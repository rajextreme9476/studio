'use server';

import { generateSwotAnalysis } from '@/ai/flows/generate-swot-analysis';
import { suggestImprovements } from '@/ai/flows/suggest-improvements';
import type { Review, SwotItem } from '@/types';

// This action is no longer needed as we upload data, but we'll keep the file for other actions.
// import { fetchReviews } from '@/ai/flows/fetch-reviews-flow';
// export async function getReviewsAction() {
//     try {
//         const result = await fetchReviews();
//         return { success: true, data: result };
//     } catch (error) {
//         console.error(error);
//         return { success: false, error: 'Failed to fetch reviews.' };
//     }
// }

export async function generateSwotAction(reviews: Review[]) {
  const positiveReviews = reviews
    .filter((r) => r.sentiment === 'Positive')
    .map((r) => r.text)
    .join('\n');
  const negativeReviews = reviews
    .filter((r) => r.sentiment === 'Negative')
    .map((r) => r.text)
    .join('\n');
  const crashCount = reviews.filter(r => r.theme === 'Crash').length;

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
      reviewCount: reviews.length,
      crashCount,
    });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    return { success: false, error: 'Failed to generate SWOT analysis.' };
  }
}

export async function generateRecommendationsAction(
  weaknesses: SwotItem[],
  reviews: Review[]
) {
  const negativeReviewsSummary = reviews
    .filter((r) => r.sentiment === 'Negative')
    .map((r) => r.text)
    .join('\n');
    
  const identifiedWeaknesses = weaknesses
    .map(w => `${w.title} | ${w.description}`)
    .join('\n');

  try {
    const result = await suggestImprovements({
      identifiedWeaknesses,
      negativeReviewsSummary,
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
