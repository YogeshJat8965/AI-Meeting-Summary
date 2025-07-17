// src/ai/flows/extract-action-items.ts
'use server';

/**
 * @fileOverview Extracts action items from a meeting transcript using the OpenAI GPT-4 API.
 *
 * - extractActionItems - A function that takes a meeting transcript and returns a list of action items.
 * - ExtractActionItemsInput - The input type for the extractActionItems function.
 * - ExtractActionItemsOutput - The return type for the extractActionItems function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

const ExtractActionItemsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The meeting transcript to extract action items from.'),
});
export type ExtractActionItemsInput = z.infer<typeof ExtractActionItemsInputSchema>;

const ExtractActionItemsOutputSchema = z.object({
  actionItems: z
    .array(z.string())
    .describe('A list of action items extracted from the meeting transcript.'),
});
export type ExtractActionItemsOutput = z.infer<typeof ExtractActionItemsOutputSchema>;

export async function extractActionItems(input: ExtractActionItemsInput): Promise<ExtractActionItemsOutput> {
  return extractActionItemsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractActionItemsPrompt',
  input: {schema: ExtractActionItemsInputSchema},
  output: {schema: ExtractActionItemsOutputSchema},
  model: googleAI.model('gemini-pro'),
  prompt: `You are an AI assistant tasked with extracting action items from meeting transcripts.

  Given the following meeting transcript, identify and list all action items and follow-up tasks.

  Transcript:
  {{transcript}}

  Please provide a list of action items, each representing a specific task or follow-up mentioned in the transcript.
  Format the output as a JSON object with an array of strings under the key "actionItems".`,
});

const extractActionItemsFlow = ai.defineFlow(
  {
    name: 'extractActionItemsFlow',
    inputSchema: ExtractActionItemsInputSchema,
    outputSchema: ExtractActionItemsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
