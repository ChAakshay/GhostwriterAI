'use server';
/**
 * @fileOverview This file defines a Genkit flow for personalized voice and style learning.
 *
 * The flow takes user-uploaded content as input and leverages LLMs to learn and replicate the user's unique voice, tone, and style.
 * It exports the `personalizedVoiceStyleLearning` function, the `PersonalizedVoiceStyleLearningInput` type, and the `PersonalizedVoiceStyleLearningOutput` type.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedVoiceStyleLearningInputSchema = z.object({
  content: z
    .string()
    .describe('The user-uploaded content for voice and style learning.'),
});
export type PersonalizedVoiceStyleLearningInput = z.infer<
  typeof PersonalizedVoiceStyleLearningInputSchema
>;

const PersonalizedVoiceStyleLearningOutputSchema = z.object({
  voiceProfile: z
    .string()
    .describe('A description of the user voice profile.'),
});
export type PersonalizedVoiceStyleLearningOutput = z.infer<
  typeof PersonalizedVoiceStyleLearningOutputSchema
>;

export async function personalizedVoiceStyleLearning(
  input: PersonalizedVoiceStyleLearningInput
): Promise<PersonalizedVoiceStyleLearningOutput> {
  return personalizedVoiceStyleLearningFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedVoiceStyleLearningPrompt',
  input: {schema: PersonalizedVoiceStyleLearningInputSchema},
  output: {schema: PersonalizedVoiceStyleLearningOutputSchema},
  prompt: `You are an AI voice and style learning engine. Analyze the following content and extract the unique characteristics of the author's voice, tone, and style.\n\nContent: {{{content}}}\n\nCreate a voice profile that summarizes these characteristics. The profile should describe the author's writing style, tone, vocabulary, sentence structure, and any other relevant features that contribute to their unique voice.\n\nVoice Profile:`, 
});

const personalizedVoiceStyleLearningFlow = ai.defineFlow(
  {
    name: 'personalizedVoiceStyleLearningFlow',
    inputSchema: PersonalizedVoiceStyleLearningInputSchema,
    outputSchema: PersonalizedVoiceStyleLearningOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
