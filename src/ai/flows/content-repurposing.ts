'use server';
/**
 * @fileOverview This file defines a Genkit flow for repurposing existing content into different formats.
 *
 * - contentRepurposing - A function that repurposes content for a new format.
 * - ContentRepurposingInput - The input type for the function.
 * - ContentRepurposingOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentRepurposingInputSchema = z.object({
  sourceContent: z.string().describe('The original content to be repurposed.'),
  voiceProfile: z.string().describe("A description of the user's voice and style."),
  targetFormat: z.string().describe('The desired new format (e.g., Tweet, LinkedIn Post).'),
});
export type ContentRepurposingInput = z.infer<typeof ContentRepurposingInputSchema>;

const ContentRepurposingOutputSchema = z.object({
  repurposedContent: z.string().describe('The generated content in the new format.'),
});
export type ContentRepurposingOutput = z.infer<typeof ContentRepurposingOutputSchema>;

export async function contentRepurposing(input: ContentRepurposingInput): Promise<ContentRepurposingOutput> {
  return contentRepurposingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentRepurposingPrompt',
  input: {schema: ContentRepurposingInputSchema},
  output: {schema: ContentRepurposingOutputSchema},
  prompt: `You are an expert content strategist. Your task is to repurpose the following source content into a new format, while strictly adhering to the user's voice profile.

User's Voice Profile:
{{{voiceProfile}}}

Source Content:
{{{sourceContent}}}

Please rewrite and reformat the source content into a "{{{targetFormat}}}". Ensure the core message is preserved but the structure, length, and tone are adapted for the new format.
`,
});

const contentRepurposingFlow = ai.defineFlow(
  {
    name: 'contentRepurposingFlow',
    inputSchema: ContentRepurposingInputSchema,
    outputSchema: ContentRepurposingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model returned an empty response.');
    }
    return output;
  }
);
