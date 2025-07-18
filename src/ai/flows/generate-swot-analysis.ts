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
  positiveReviews: z.string().describe('A summary of aggregated positive reviews.'),
  negativeReviews: z.string().describe('A summary of aggregated negative reviews.'),
  marketTrends: z.string().describe('Current market trends related to banking apps.'),
  competitorAnalysis: z.string().describe('Analysis of competitor apps.'),
  reviewCount: z.number().describe('Total number of reviews analyzed.'),
  crashCount: z.number().describe('Number of reviews mentioning crashes.'),
});
export type GenerateSwotAnalysisInput = z.infer<typeof GenerateSwotAnalysisInputSchema>;

const SwotItemSchema = z.object({
  title: z.string().describe('The primary point or area (e.g., "Seamless UPI").'),
  description: z.string().describe('The detailed analysis or strategic consequence.'),
});

const GenerateSwotAnalysisOutputSchema = z.object({
  strengths: z.array(SwotItemSchema).describe('List of key strengths with a title (Strength) and description (Evidence from reviews).'),
  weaknesses: z.array(SwotItemSchema).describe('List of key weaknesses with a title (Pain Point) and description (Strategic Risk).'),
  opportunities: z.array(SwotItemSchema).describe('List of key opportunities with a title (Opportunity Area) and description (Value Creation Potential).'),
  threats: z.array(SwotItemSchema).describe('List of key threats with a title (Threat Source) and description (Strategic Consequence).'),
});
export type GenerateSwotAnalysisOutput = z.infer<typeof GenerateSwotAnalysisOutputSchema>;

export async function generateSwotAnalysis(input: GenerateSwotAnalysisInput): Promise<GenerateSwotAnalysisOutput> {
  return generateSwotAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSwotAnalysisPrompt',
  input: {schema: GenerateSwotAnalysisInputSchema},
  output: {schema: GenerateSwotAnalysisOutputSchema},
  prompt: `You are a strategic analyst for a major bank, tasked with creating a SWOT analysis for the HDFC Bank App based on user reviews and market data.

  The analysis should be detailed, insightful, and presented in a structured format.
  Analyze the provided data and generate 2-4 concrete points for each of the four SWOT categories (Strengths, Weaknesses, Opportunities, Threats).
  
  For each point, provide a "title" and a "description" as per the output schema.
  - For Strengths, the title is the core strength and the description is the evidence.
  - For Weaknesses, the title is the "Pain Point" and the description is the "Strategic Risk".
  - For Opportunities, the title is the "Opportunity Area" and the description is the "Value Creation Potential".
  - For Threats, the title is the "Threat Source" and the description is the "Strategic Consequence".

  Base your analysis on the following data:
  - Total Reviews Analyzed: {{{reviewCount}}}
  - Reviews Mentioning Crashes: {{{crashCount}}}
  - Positive Reviews Summary: {{{positiveReviews}}}
  - Negative Reviews Summary: {{{negativeReviews}}}
  - Market Trends: {{{marketTrends}}}
  - Competitor Analysis: {{{competitorAnalysis}}}

  Be specific and use the data to back up your points. For example, mention specific numbers or themes from the reviews.
  `,
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
