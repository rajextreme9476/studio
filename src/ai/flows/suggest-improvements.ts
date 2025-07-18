// src/ai/flows/suggest-improvements.ts
'use server';
/**
 * @fileOverview A flow to suggest improvements based on negative reviews and identified weaknesses.
 *
 * - suggestImprovements - A function that generates improvement suggestions.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The return type for the suggestImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestImprovementsInputSchema = z.object({
  negativeReviews: z
    .string()
    .describe('A summary of negative reviews for the HDFC Bank App.'),
  identifiedWeaknesses: z
    .string()
    .describe('A summary of identified weaknesses in the HDFC Bank App.'),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A list of AI-driven suggestions for app improvements.'),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {schema: SuggestImprovementsInputSchema},
  output: {schema: SuggestImprovementsOutputSchema},
  prompt: `You are an AI-powered product manager specializing in improving mobile banking applications.

Based on the following negative reviews and identified weaknesses for the HDFC Bank App, provide a list of actionable suggestions for app improvements.

Negative Reviews: {{{negativeReviews}}}
Identified Weaknesses: {{{identifiedWeaknesses}}}

Suggestions:`,
});

const suggestImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestImprovementsFlow',
    inputSchema: SuggestImprovementsInputSchema,
    outputSchema: SuggestImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
