'use server';
/**
 * @fileOverview A flow to classify reviews by sentiment and theme.
 *
 * - classifyReviews - A function that handles the review classification process.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { ReviewSchema, ReviewClassificationSchema, type Review } from '@/types';

const ClassifyReviewsInputSchema = z.array(ReviewSchema);
const ClassifyReviewsOutputSchema = z.array(ReviewSchema);

export async function classifyReviews(
  reviews: z.infer<typeof ClassifyReviewsInputSchema>
): Promise<z.infer<typeof ClassifyReviewsOutputSchema>> {
  return classifyReviewsFlow(reviews);
}

const classificationPrompt = ai.definePrompt({
  name: 'classificationPrompt',
  input: {
    schema: z.object({
      reviewsToClassify: z.string(),
    }),
  },
  output: {
    schema: z.object({
      classifications: z.array(ReviewClassificationSchema),
    }),
  },
  prompt: `You are an expert review analyst. For the following list of reviews, determine the sentiment and a single, most relevant theme for each.

  The available themes are: 'Login', 'Privacy', 'Crash', 'UPI', 'Credit Card', 'Registration', 'General'.
  The available sentiments are: 'Positive', 'Negative', 'Neutral'.

  Analyze the text of each review and provide its ID, sentiment, and theme.
  Please provide your response as a JSON object with a "classifications" array.

  Reviews to classify:
  {{{reviewsToClassify}}}
  `,
});

const classifyReviewsFlow = ai.defineFlow(
  {
    name: 'classifyReviewsFlow',
    inputSchema: ClassifyReviewsInputSchema,
    outputSchema: ClassifyReviewsOutputSchema,
  },
  async (reviews) => {
    // If there are no reviews, just return an empty array.
    if (reviews.length === 0) {
      return [];
    }

    // We only need to send the id and text to the AI for classification.
    const reviewsToClassify = reviews.map((review) => ({
      id: review.id,
      text: review.text,
    }));

    const { output } = await classificationPrompt({
      reviewsToClassify: JSON.stringify(reviewsToClassify, null, 2),
    });

    if (!output?.classifications) {
      // If the AI fails to return classifications, return the original reviews
      // so the user can at least see their data.
      console.error('AI classification failed to return valid data.');
      return reviews;
    }
    
    // Create a map of classifications for easy lookup.
    const classificationMap = new Map(
      output.classifications.map((c) => [c.id, c])
    );

    // Merge the classifications back into the original review objects.
    const classifiedReviews = reviews.map((review) => {
      const classification = classificationMap.get(review.id);
      if (classification) {
        return {
          ...review,
          sentiment: classification.sentiment,
          theme: classification.theme,
        };
      }
      // If a review wasn't classified, return it as is (with default values).
      return review;
    });

    return classifiedReviews;
  }
);
