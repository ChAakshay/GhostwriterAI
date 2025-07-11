'use server';
/**
 * @fileOverview Defines a Genkit flow for analyzing content for tone and readability.
 *
 * - contentAnalysis - A function that analyzes a draft and provides feedback.
 * - ContentAnalysisInput - The input type for the function.
 * - ContentAnalysisOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ContentAnalysisInputSchema = z.object({
  draftContent: z.string().describe('The content of the draft to be analyzed.'),
});
export type ContentAnalysisInput = z.infer<typeof ContentAnalysisInputSchema>;

const ContentAnalysisOutputSchema = z.object({
  toneAnalysis: z.string().describe("A summary of the detected tone and style of the content (e.g., 'formal and academic', 'witty and casual')."),
  readabilityLevel: z.string().describe("The estimated reading grade level of the content (e.g., '8th Grade', 'College Level')."),
  claritySuggestions: z.array(z.string()).describe("A list of specific sentences or phrases that could be clearer, with suggestions for how to simplify them."),
  engagementSuggestions: z.array(z.string()).describe("A list of actionable suggestions to make the content more engaging for the reader."),
});
export type ContentAnalysisOutput = z.infer<typeof ContentAnalysisOutputSchema>;

export async function contentAnalysis(input: ContentAnalysisInput): Promise<ContentAnalysisOutput> {
  return contentAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'contentAnalysisPrompt',
  input: {schema: ContentAnalysisInputSchema},
  output: {schema: ContentAnalysisOutputSchema},
  prompt: `You are an expert editor and writing coach. Analyze the following draft for tone, readability, clarity, and engagement.

Draft Content:
"{{{draftContent}}}"

Provide a detailed analysis based on the output schema. For suggestions, be specific and provide concrete examples of how to improve the text.
`,
});

const contentAnalysisFlow = ai.defineFlow(
  {
    name: 'contentAnalysisFlow',
    inputSchema: ContentAnalysisInputSchema,
    outputSchema: ContentAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model returned an empty response for content analysis.');
    }
    return output;
  }
);
