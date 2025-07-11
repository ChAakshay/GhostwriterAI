// src/ai/flows/conversational-drafting.ts
'use server';
/**
 * @fileOverview This file defines a Genkit flow for a conversational AI writing partner.
 *
 * - conversationalDrafting - A function that handles the conversational drafting process.
 * - ConversationalDraftingInput - The input type for the function.
 * - ConversationalDraftingOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});

const ConversationalDraftingInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  prompt: z.string().describe('The latest user prompt.'),
  voiceProfile: z.string().describe("The user's voice profile."),
});
export type ConversationalDraftingInput = z.infer<typeof ConversationalDraftingInputSchema>;

const ConversationalDraftingOutputSchema = z.object({
  response: z.string().describe('The AI\'s response.'),
});
export type ConversationalDraftingOutput = z.infer<typeof ConversationalDraftingOutputSchema>;

export async function conversationalDrafting(input: ConversationalDraftingInput): Promise<ConversationalDraftingOutput> {
  return conversationalDraftingFlow(input);
}

const conversationalDraftingFlow = ai.defineFlow(
  {
    name: 'conversationalDraftingFlow',
    inputSchema: ConversationalDraftingInputSchema,
    outputSchema: ConversationalDraftingOutputSchema,
  },
  async ({ history, prompt, voiceProfile }) => {
    const systemPrompt = `You are a helpful and creative writing partner. Your goal is to help the user brainstorm and create content. You must adopt the user's unique voice and style, which is described as: ${voiceProfile}. Maintain this voice and be a supportive partner.`;

    const { output } = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      system: systemPrompt,
      history: history.map(h => ({
        role: h.role,
        content: [{ text: h.content }],
      })),
      prompt: prompt,
    });
    
    if (!output) {
      throw new Error("The AI model returned an empty response.");
    }
    
    return {
        response: output.text,
    };
  }
);
