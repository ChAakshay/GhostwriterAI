'use server';
/**
 * @fileOverview This file defines a Genkit flow for generating visual assets based on text content.
 *
 * - visualAssetGeneration - A function that generates an image based on a content summary.
 * - VisualAssetGenerationInput - The input type for the function.
 * - VisualAssetGenerationOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VisualAssetGenerationInputSchema = z.object({
  content: z.string().describe('The text content to generate a visual asset for.'),
});
export type VisualAssetGenerationInput = z.infer<typeof VisualAssetGenerationInputSchema>;

const VisualAssetGenerationOutputSchema = z.object({
  imageUrl: z.string().url().describe('The data URI of the generated image.'),
});
export type VisualAssetGenerationOutput = z.infer<typeof VisualAssetGenerationOutputSchema>;

export async function visualAssetGeneration(input: VisualAssetGenerationInput): Promise<VisualAssetGenerationOutput> {
  return visualAssetGenerationFlow(input);
}

const summarizePrompt = ai.definePrompt({
    name: 'summarizeForImagePrompt',
    input: { schema: z.object({ content: z.string() }) },
    output: { schema: z.object({ summary: z.string() }) },
    prompt: `Summarize the following content into a short, visually descriptive prompt for an image generation model. Focus on the key subjects, actions, and overall mood. The summary should be a concise instruction for creating an image.

Content:
{{{content}}}
`,
});


const visualAssetGenerationFlow = ai.defineFlow(
  {
    name: 'visualAssetGenerationFlow',
    inputSchema: VisualAssetGenerationInputSchema,
    outputSchema: VisualAssetGenerationOutputSchema,
  },
  async ({ content }) => {

    const { output: summaryOutput } = await summarizePrompt({ content });
    if (!summaryOutput) {
        throw new Error("Failed to generate summary for image prompt");
    }

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.0-flash-preview-image-generation',
      prompt: `Generate a visually appealing and relevant image based on the following description: ${summaryOutput.summary}. Style: Digital illustration, professional, clean.`,
      config: {
        responseModalities: ['TEXT', 'IMAGE'],
      },
    });

    if (!media || !media.url) {
        throw new Error("Image generation failed to return a valid image.");
    }

    return {
      imageUrl: media.url,
    };
  }
);
