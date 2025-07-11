// src/ai/flows/content-drafting.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating content drafts in a user's voice and style.
 *
 * - contentDrafting - A function that generates content drafts based on a topic.
 * - ContentDraftingInput - The input type for the contentDrafting function.
 * - ContentDraftingOutput - The return type for the contentDrafting function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentDraftingInputSchema = z.object({
  topic: z.string().describe('The topic for which to generate a content draft.'),
  voiceProfile: z.string().describe('A description of the user\'s voice and style.'),
  format: z.string().describe('The desired content format (e.g., tweet, blog post).'),
});
export type ContentDraftingInput = z.infer<typeof ContentDraftingInputSchema>;

const ContentDraftingOutputSchema = z.object({
  draftContent: z.string().describe('The generated content draft.'),
});
export type ContentDraftingOutput = z.infer<typeof ContentDraftingOutputSchema>;

export async function contentDrafting(input: ContentDraftingInput): Promise<ContentDraftingOutput> {
  return contentDraftingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentDraftingPrompt',
  input: {schema: ContentDraftingInputSchema},
  output: {schema: ContentDraftingOutputSchema},
  prompt: `You are an AI assistant that generates content drafts in a specific user's voice and style.

  The user's voice profile is described as follows:
  {{{voiceProfile}}}

  Generate a content draft on the following topic, formatted as a {{{format}}}:
  {{{topic}}}`,
});

const contentDraftingFlow = ai.defineFlow(
  {
    name: 'contentDraftingFlow',
    inputSchema: ContentDraftingInputSchema,
    outputSchema: ContentDraftingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
