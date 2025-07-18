'use server';
/**
 * @fileOverview A flow to fetch app reviews using a tool.
 *
 * - fetchReviews - A function that handles the review fetching process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { fetchAppReviews } from '../tools/review-scraper';
import { ReviewSchema } from '@/types';

const FetchReviewsOutputSchema = z.array(ReviewSchema);

export async function fetchReviews(): Promise<z.infer<typeof FetchReviewsOutputSchema>> {
    return fetchReviewsFlow();
}

const fetchReviewsFlow = ai.defineFlow(
  {
    name: 'fetchReviewsFlow',
    inputSchema: z.void(),
    outputSchema: FetchReviewsOutputSchema,
  },
  async () => {
    // In a real app, you might get this from configuration
    const hdfcAppIdentifier = 'com.hdfcbank.android.now'; 
    
    const reviews = await fetchAppReviews({ appIdentifier: hdfcAppIdentifier });
    return reviews;
  }
);
