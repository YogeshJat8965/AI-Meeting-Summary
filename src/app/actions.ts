"use server";

import { z } from "zod";
import { transcribeAudio } from "@/ai/flows/transcribe-audio";
import { summarizeMeeting } from "@/ai/flows/summarize-meeting";
import { extractObjections } from "@/ai/flows/extract-objections";
import { extractActionItems } from "@/ai/flows/extract-action-items";
import type { ResultState } from "@/types";
import nodemailer from "nodemailer";

const processMeetingSchema = z.object({
  transcript: z.string().optional(),
  file: z.instanceof(File).optional(),
});

function fileToDataURI(file: File): Promise<string> {
    const reader = new FileReader();
    reader.onload = () => {
        if (typeof reader.result === 'string') {
            resolve(reader.result);
        } else {
            reject(new Error('Failed to read file as Data URI'));
        }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
}


export async function processMeeting(formData: FormData): Promise<{ data: ResultState } | { error: string }> {
  const rawTranscript = formData.get("transcript") as string | null;
  const audioFile = formData.get("file") as File | null;
  
  let transcript = rawTranscript || "";

  try {
    if (audioFile && audioFile.size > 0) {
      if (!audioFile.type.startsWith("audio/")) {
        return { error: "Invalid file type. Please upload an audio file." };
      }
      const audioDataUri = await fileToDataURI(audioFile);
      const transcriptionResult = await transcribeAudio({ audioDataUri });
      transcript = transcriptionResult.transcription;
    }

    if (!transcript.trim()) {
      return { error: "Transcript is empty. Please provide a transcript or an audio file." };
    }

    const [summaryResult, objectionsResult, actionItemsResult] = await Promise.all([
      summarizeMeeting({ transcript }),
      extractObjections({ transcript }),
      extractActionItems({ transcript }),
    ]);

    return {
      data: {
        summary: summaryResult.summary,
        objections: objectionsResult.objections,
        actionItems: actionItemsResult.actionItems,
        transcript: transcript,
      }
    };
  } catch (e: any) {
    console.error("Error processing meeting:", e);
    return { error: e.message || "An unknown error occurred during processing." };
  }
}

export async function sendEmail(results: ResultState): Promise<{ success: boolean; message: string }> {
  const GMAIL_EMAIL = process.env.GMAIL_EMAIL;
  const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;
  const emailRecipient = "yogeshjat8965@gmail.com";

  if (!GMAIL_EMAIL || !GMAIL_APP_PASSWORD) {
    console.error("Gmail credentials are not set in environment variables.");
    return { success: false, message: "Server is not configured to send emails. Please contact support." };
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
      user: GMAIL_EMAIL,
      pass: GMAIL_APP_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Insight Extractor" <${GMAIL_EMAIL}>`,
    to: emailRecipient,
    subject: 'Your Meeting Summary from Insight Extractor',
    html: `
      <h1>Meeting Summary</h1>
      <p>${results.summary}</p>
      
      <h2>Objections & Resolutions</h2>
      <ul>
        ${results.objections.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <h2>Action Items</h2>
      <ul>
        ${results.actionItems.map(item => `<li>${item}</li>`).join('')}
      </ul>

      <hr>

      <h2>Full Transcript</h2>
      <p>${results.transcript}</p>
    `,
  };

  try {
    await transporter.verify(); // Verify the connection configuration
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${emailRecipient}.`);
    return { success: true, message: `Email sent successfully to ${emailRecipient}` };
  } catch (error: any) {
    console.error("Failed to send email:", error);
    return { success: false, message: `Failed to send email. Error: ${error.message}` };
  }
}
