'use server';

/**
 * @fileOverview Extracts client pain points, objections, and resolutions from a meeting transcript.
 *
 * - extractObjections - A function that handles the extraction process.
 * - ExtractObjectionsInput - The input type for the extractObjections function.
 * - ExtractObjectionsOutput - The return type for the extractObjections function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractObjectionsInputSchema = z.object({
  transcript: z.string().describe('The meeting transcript.'),
});
export type ExtractObjectionsInput = z.infer<typeof ExtractObjectionsInputSchema>;

const ExtractObjectionsOutputSchema = z.object({
  objections: z
    .array(z.string())
    .describe('A list of client pain points, objections, and resolutions discussed during the meeting.'),
});
export type ExtractObjectionsOutput = z.infer<typeof ExtractObjectionsOutputSchema>;

export async function extractObjections(input: ExtractObjectionsInput): Promise<ExtractObjectionsOutput> {
  return extractObjectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'extractObjectionsPrompt',
  input: {schema: ExtractObjectionsInputSchema},
  output: {schema: ExtractObjectionsOutputSchema},
  prompt: `You are an AI expert in analyzing meeting transcripts to extract client pain points, objections, and resolutions.\n\nAnalyze the following meeting transcript and extract a list of client pain points, objections, and resolutions.  Be as concise as possible.  Each should be a short sentence.\n\nTranscript: {{{transcript}}}`,
});

const extractObjectionsFlow = ai.defineFlow(
  {
    name: 'extractObjectionsFlow',
    inputSchema: ExtractObjectionsInputSchema,
    outputSchema: ExtractObjectionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
