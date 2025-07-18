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

const SuggestImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe('A markdown-formatted list of AI-driven suggestions for app improvements, including actionable steps.'),
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
Generate a list of 2-4 high-impact, strategic recommendations. For each recommendation, provide a clear title and a few bullet points outlining actionable steps. The output should be in markdown format.

**Example Format:**
### 1. Fortify a Security-First UX
- **Action:** Immediately implement a PIN/Biometric gate for viewing sensitive information like account balances and transaction history.
- **Rationale:** This directly addresses the significant user privacy concerns (~180 reviews) and positions the app as more secure than competitors who show balances on launch.

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
