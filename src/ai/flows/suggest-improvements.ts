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
  negativeReviewsSummary: z
    .string()
    .describe('A summary of negative reviews for the HDFC Bank App.'),
  identifiedWeaknesses: z
    .string()
    .describe(
      'A structured summary of identified weaknesses, including Pain Points and Strategic Risks.'
    ),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const RecommendationItemSchema = z.object({
    title: z.string().describe('A high-level title for the recommendation, starting with a number (e.g., "1. Enhance Login Security").'),
    actions: z.array(z.string()).describe('A list of 1-2 specific, actionable steps to implement.'),
    rationale: z.string().describe('The reasoning and business value behind this recommendation.'),
});

const SuggestImprovementsOutputSchema = z.object({
  recommendations: z.array(RecommendationItemSchema).describe('A list of 2-4 strategic recommendations.'),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {schema: SuggestImprovementsInputSchema},
  output: {schema: SuggestImprovementsOutputSchema},
  prompt: `You are an expert product strategist for a leading bank, tasked with creating actionable recommendations to improve the HDFC Bank App.

Your recommendations must be based on the specific weaknesses identified in the SWOT analysis and the raw sentiment from negative user reviews.

**Identified Weaknesses (Pain Point | Strategic Risk):**
{{{identifiedWeaknesses}}}

**Summary of Negative User Reviews:**
{{{negativeReviewsSummary}}}

---

**Task:**
Generate a list of 2-4 high-impact, strategic recommendations. For each recommendation, provide a clear, numbered title, a list of specific "actions", and a "rationale". The output must be a valid JSON object matching the defined schema.

**Example Format:**
{
  "recommendations": [
    {
      "title": "1. Fortify a Security-First UX",
      "actions": [
        "Immediately implement a PIN/Biometric gate for viewing sensitive information like account balances and transaction history."
      ],
      "rationale": "This directly addresses the significant user privacy concerns (~180 reviews) and positions the app as more secure than competitors who show balances on launch."
    }
  ]
}

Your suggestions should be concrete, referencing the data provided (e.g., "Address the login failures affecting over 220 users...").
`,
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
