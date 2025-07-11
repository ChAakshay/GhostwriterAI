'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating personalized content ideas by combining trending topics with a user's unique voice and style.
 *
 * - generateContentIdeas - A function that orchestrates the content idea generation process.
 * - GenerateContentIdeasInput - The input type for the generateContentIdeas function.
 * - GenerateContentIdeasOutput - The return type for the generateContentIdeas function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input schema for content idea generation, including the user's voice profile and trending topics.
const GenerateContentIdeasInputSchema = z.object({
  userVoiceProfile: z.string().describe('The user\u0027s unique voice profile, learned from their past content.'),
  trendingTopics: z.string().describe('A list of trending topics relevant to the user\u0027s interests.'),
});
export type GenerateContentIdeasInput = z.infer<typeof GenerateContentIdeasInputSchema>;

// Output schema for content idea generation, providing a list of personalized content ideas.
const GenerateContentIdeasOutputSchema = z.object({
  contentIdeas: z.array(z.string()).describe('A list of personalized content ideas.'),
});
export type GenerateContentIdeasOutput = z.infer<typeof GenerateContentIdeasOutputSchema>;

// Exported function to trigger content idea generation.
export async function generateContentIdeas(input: GenerateContentIdeasInput): Promise<GenerateContentIdeasOutput> {
  return generateContentIdeasFlow(input);
}

// Define the prompt for generating content ideas.
const generateContentIdeasPrompt = ai.definePrompt({
  name: 'generateContentIdeasPrompt',
  input: {schema: GenerateContentIdeasInputSchema},
  output: {schema: GenerateContentIdeasOutputSchema},
  prompt: `You are an AI assistant specializing in content creation. Generate personalized content ideas based on the user\u0027s voice profile and trending topics.

User Voice Profile: {{{userVoiceProfile}}}
Trending Topics: {{{trendingTopics}}}

Please generate a diverse set of content ideas that align with the user\u0027s style and expertise.
`, // Use Handlebars templating for dynamic content
});

// Define the Genkit flow for content idea generation.
const generateContentIdeasFlow = ai.defineFlow(
  {
    name: 'generateContentIdeasFlow',
    inputSchema: GenerateContentIdeasInputSchema,
    outputSchema: GenerateContentIdeasOutputSchema,
  },
  async input => {
    const {output} = await generateContentIdeasPrompt(input);
    if (!output) {
      throw new Error('The AI model returned an empty response.');
    }
    return output;
  }
);
