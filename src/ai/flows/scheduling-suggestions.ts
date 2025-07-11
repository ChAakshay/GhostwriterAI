'use server';
/**
 * @fileOverview Defines a Genkit flow for providing content scheduling suggestions.
 *
 * - getSchedulingSuggestion - A function that suggests an optimal posting day/time.
 * - SchedulingSuggestionInput - The input type for the function.
 * - SchedulingSuggestionOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SchedulingSuggestionInputSchema = z.object({
  topic: z.string().describe('The topic of the content draft.'),
  format: z.string().describe('The format of the content (e.g., Blog Post, LinkedIn Post).'),
});
export type SchedulingSuggestionInput = z.infer<typeof SchedulingSuggestionInputSchema>;

const SchedulingSuggestionOutputSchema = z.object({
  suggestedDay: z.string().describe("The suggested day of the week to post (e.g., 'Tuesday')."),
  suggestedTime: z.string().describe("The suggested time of day to post (e.g., '9:00 AM EST')."),
  reasoning: z.string().describe("The reasoning behind the suggestion, based on general best practices for the content format."),
});
export type SchedulingSuggestionOutput = z.infer<typeof SchedulingSuggestionOutputSchema>;

export async function getSchedulingSuggestion(input: SchedulingSuggestionInput): Promise<SchedulingSuggestionOutput> {
  return schedulingSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'schedulingSuggestionPrompt',
  input: {schema: SchedulingSuggestionInputSchema},
  output: {schema: SchedulingSuggestionOutputSchema},
  prompt: `You are a content marketing expert. Based on general best practices for audience engagement, suggest an optimal day and time to publish a piece of content.

Content Topic: {{{topic}}}
Content Format: {{{format}}}

Provide a specific day of the week and time, and a brief explanation for your recommendation. For example, for a LinkedIn post about business, you might suggest Tuesday morning as it's a peak time for professionals on the platform.
`,
});

const schedulingSuggestionFlow = ai.defineFlow(
  {
    name: 'schedulingSuggestionFlow',
    inputSchema: SchedulingSuggestionInputSchema,
    outputSchema: SchedulingSuggestionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model returned an empty response for scheduling suggestion.');
    }
    return output;
  }
);
