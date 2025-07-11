'use server';
/**
 * @fileOverview Defines a Genkit flow for simulating audience persona feedback on a draft.
 *
 * - personaFeedback - A function that generates feedback on content from a specific audience persona's perspective.
 * - PersonaFeedbackInput - The input type for the function.
 * - PersonaFeedbackOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

export const PersonaFeedbackInputSchema = z.object({
  draftContent: z.string().describe('The content of the draft to be reviewed.'),
  personaDescription: z.string().describe('A detailed description of the target audience persona.'),
});
export type PersonaFeedbackInput = z.infer<typeof PersonaFeedbackInputSchema>;

export const PersonaFeedbackOutputSchema = z.object({
  overallImpression: z.string().describe("The persona's first impression and overall feeling about the content."),
  clarityFeedback: z.string().describe("Feedback on the clarity and ease of understanding of the content."),
  engagementFeedback: z.string().describe("Feedback on how engaging and interesting the content is for the persona."),
  questions: z.array(z.string()).describe("A list of questions the persona might have after reading the content."),
  suggestions: z.array(z.string()).describe("Actionable suggestions to improve the content for this specific persona."),
});
export type PersonaFeedbackOutput = z.infer<typeof PersonaFeedbackOutputSchema>;

export async function personaFeedback(input: PersonaFeedbackInput): Promise<PersonaFeedbackOutput> {
  return personaFeedbackFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personaFeedbackPrompt',
  input: {schema: PersonaFeedbackInputSchema},
  output: {schema: PersonaFeedbackOutputSchema},
  prompt: `You are an AI that simulates an audience persona to provide feedback on a piece of content.
  
Your Persona:
{{{personaDescription}}}

You will read the following draft and provide feedback from the perspective of this persona. Be critical, insightful, and helpful. Your goal is to help the creator improve this content to better connect with you (the persona).

Draft Content:
"{{{draftContent}}}"

Based on the persona described, analyze the draft and provide the following feedback.
`,
});

const personaFeedbackFlow = ai.defineFlow(
  {
    name: 'personaFeedbackFlow',
    inputSchema: PersonaFeedbackInputSchema,
    outputSchema: PersonaFeedbackOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('The AI model returned an empty response for persona feedback.');
    }
    return output;
  }
);
