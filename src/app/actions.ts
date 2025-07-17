"use server";

import { z } from "zod";
import { transcribeAudio } from "@/ai/flows/transcribe-audio";
import { summarizeMeeting } from "@/ai/flows/summarize-meeting";
import { extractObjections } from "@/ai/flows/extract-objections";
import { extractActionItems } from "@/ai/flows/extract-action-items";
import type { ResultState } from "@/types";

const processMeetingSchema = z.object({
  transcript: z.string().optional(),
  file: z.instanceof(File).optional(),
});

function fileToDataURI(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
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
    });
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
  // This is a placeholder for a real email implementation (e.g., using Nodemailer).
  // In a real-world scenario, you would integrate an email service here.
  console.log("Attempting to send email with results:", results.summary);
  
  // Simulate email sending
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log("Email sent successfully (simulated).");
  
  return { success: true, message: "Email sent successfully!" };
}
