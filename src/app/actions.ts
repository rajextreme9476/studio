'use server';

import { generateSwotAnalysis } from '@/ai/flows/generate-swot-analysis';
import { suggestImprovements } from '@/ai/flows/suggest-improvements';
import { fetchReviews } from '@/ai/flows/fetch-reviews-flow';
import type { Review } from '@/types';

export async function getReviewsAction() {
    try {
        const result = await fetchReviews();
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'Failed to fetch reviews.' };
    }
}

export async function generateSwotAction(reviews: Review[]) {
  const positiveReviews = reviews
    .filter((r) => r.sentiment === 'Positive')
    .map((r) => r.text)
    .join('\n');
  const negativeReviews = reviews
    .filter((r) => r.sentiment === 'Negative')
    .map((r) => r.text)
    .join('\n');

  const marketTrends =
    'Rise of neo-banks, increasing demand for personalized financial services, and adoption of AI-driven customer support.';
  const competitorAnalysis =
    'Competitors like ICICI iMobile and Axis Mobile offer more intuitive UIs and faster UPI transaction speeds. Security features like biometric login are becoming standard.';

  try {
    const result = await generateSwotAnalysis({
      positiveReviews,
      negativeReviews,
      marketTrends,
      competitorAnalysis,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate SWOT analysis.' };
  }
}

export async function generateRecommendationsAction(
  weaknesses: string,
  reviews: Review[]
) {
  const negativeReviews = reviews
    .filter((r) => r.sentiment === 'Negative')
    .map((r) => r.text)
    .join('\n');
    
  try {
    const result = await suggestImprovements({
      identifiedWeaknesses: weaknesses,
      negativeReviews: negativeReviews,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return {
      success: false,
      error: 'Failed to generate recommendations.',
    };
  }
}
