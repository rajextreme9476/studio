// src/ai/flows/generate-swot-analysis.ts
'use server';
/**
 * @fileOverview Generates a SWOT analysis based on aggregated review data.
 *
 * - generateSwotAnalysis - A function that generates the SWOT analysis.
 * - GenerateSwotAnalysisInput - The input type for the generateSwotAnalysis function.
 * - GenerateSwotAnalysisOutput - The return type for the generateSwotAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateSwotAnalysisInputSchema = z.object({
  positiveReviews: z.string().describe('Aggregated positive reviews.'),
  negativeReviews: z.string().describe('Aggregated negative reviews.'),
  marketTrends: z.string().describe('Current market trends related to banking apps.'),
  competitorAnalysis: z.string().describe('Analysis of competitor apps.'),
});
export type GenerateSwotAnalysisInput = z.infer<typeof GenerateSwotAnalysisInputSchema>;

const GenerateSwotAnalysisOutputSchema = z.object({
  strengths: z.string().describe('Strengths derived from positive reviews.'),
  weaknesses: z.string().describe('Weaknesses derived from negative reviews.'),
  opportunities: z.string().describe('Opportunities based on market trends.'),
  threats: z.string().describe('Threats based on competitor analysis.'),
});
export type GenerateSwotAnalysisOutput = z.infer<typeof GenerateSwotAnalysisOutputSchema>;

export async function generateSwotAnalysis(input: GenerateSwotAnalysisInput): Promise<GenerateSwotAnalysisOutput> {
  return generateSwotAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSwotAnalysisPrompt',
  input: {schema: GenerateSwotAnalysisInputSchema},
  output: {schema: GenerateSwotAnalysisOutputSchema},
  prompt: `You are a strategic analyst specializing in SWOT analysis for mobile banking applications.

  Based on the following information, generate a SWOT analysis.

  Positive Reviews: {{{positiveReviews}}}
  Negative Reviews: {{{negativeReviews}}}
  Market Trends: {{{marketTrends}}}
  Competitor Analysis: {{{competitorAnalysis}}}

  Format your response as follows:

  Strengths: [List strengths derived from positive reviews]
  Weaknesses: [List weaknesses derived from negative reviews]
  Opportunities: [List opportunities based on market trends]
  Threats: [List threats based on competitor analysis]`,
});

const generateSwotAnalysisFlow = ai.defineFlow(
  {
    name: 'generateSwotAnalysisFlow',
    inputSchema: GenerateSwotAnalysisInputSchema,
    outputSchema: GenerateSwotAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
