// src/ai/flows/conversational-drafting.ts
'use server';
/**
 * @fileOverview This file defines the server-side logic for the conversational AI writing partner.
 *
 * - conversationalDrafting - A server action that handles the conversational drafting process.
 * - Message - The type for a single message in the conversation.
 */
import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'zod';

// Define the schema for a single message
const MessageSchema = z.object({
  role: z.enum(['user', 'model']),
  content: z.string(),
});
export type Message = z.infer<typeof MessageSchema>;

// Define the schema for the function's input
const ConversationalDraftingInputSchema = z.object({
  history: z.array(MessageSchema).describe('The conversation history.'),
  prompt: z.string().describe('The latest user prompt.'),
  voiceProfile: z.string().describe("The user's voice profile."),
});

// This is a server action that can be called directly from the client
export async function conversationalDrafting(input: z.infer<typeof ConversationalDraftingInputSchema>): Promise<{ response: string; error?: undefined } | { error: string; response?: undefined }> {
  // Validate the input
  const validation = ConversationalDraftingInputSchema.safeParse(input);
  if (!validation.success) {
    return { error: 'Invalid input.' };
  }
  const { history, prompt, voiceProfile } = validation.data;

  // Construct the system prompt to guide the AI
  const systemPrompt = `You are a helpful and creative writing partner. Your goal is to help the user brainstorm and create content. You must adopt the user's unique voice and style, which is described as: "${voiceProfile}". Maintain this voice throughout the conversation and be a supportive partner.`;

  try {
    // Call the AI model
    const { output } = await ai.generate({
      model: googleAI.model('gemini-2.0-flash'),
      system: systemPrompt,
      history: history.map(h => ({
        role: h.role,
        content: [{ text: h.content }], // Format content correctly for Gemini
      })),
      prompt: prompt,
    });

    // Ensure the model returned a valid response
    if (!output || !output.text) {
      console.error("AI returned an empty response or malformed output.");
      return { error: 'The AI model returned an empty response. Please try again.' };
    }
    
    // Return the successful response
    return {
        response: output.text,
    };
  } catch (e) {
    console.error("Error in conversational drafting:", e);
    // Return a generic error message
    return { error: 'An unexpected error occurred. Please try again later.' };
  }
}
