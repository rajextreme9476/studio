import { z } from 'zod';

export type ReviewTheme = 'Login' | 'Privacy' | 'Crash' | 'UPI' | 'Credit Card' | 'Registration' | 'General' | 'Interface/UI';

// Base schema for what the AI will return
export const ReviewClassificationSchema = z.object({
  id: z.string(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
  theme: z.enum(['Login', 'Privacy', 'Crash', 'UPI', 'Credit Card', 'Registration', 'General', 'Interface/UI']),
});

// This is the main schema used throughout the application.
// It preprocesses raw CSV data to create a valid Review object.
export const ReviewSchema = z.preprocess(
  (data: any) => ({
    id: data.id || crypto.randomUUID(),
    platform: data.platform || 'Android',
    author: data.author || 'Anonymous',
    rating: data.rating ? parseInt(String(data.rating), 10) : 0,
    text: data.text || '',
    date: data.date ? new Date(data.date).toISOString() : new Date().toISOString(),
    // Default values before AI classification
    sentiment: data.sentiment || 'Neutral', 
    theme: data.theme || 'General',
  }),
  z.object({
    id: z.string(),
    platform: z.enum(['iOS', 'Android']),
    author: z.string(),
    rating: z.number().int().min(0).max(5), // allow 0 rating for parsing robustness
    text: z.string().optional(), // Allow empty review text
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
    theme: z.enum(['Login', 'Privacy', 'Crash', 'UPI', 'Credit Card', 'Registration', 'General', 'Interface/UI']),
  })
);


export type Review = z.infer<typeof ReviewSchema>;

export const SwotItemSchema = z.object({
  title: z.string(),
  description: z.string(),
});
export type SwotItem = z.infer<typeof SwotItemSchema>;

export type SwotAnalysis = {
  strengths: SwotItem[];
  weaknesses: SwotItem[];
  opportunities: SwotItem[];
  threats: SwotItem[];
};

const RecommendationItemSchema = z.object({
    title: z.string(),
    actions: z.array(z.string()),
    rationale: z.string(),
});

export const SuggestImprovementsOutputSchema = z.object({
  recommendations: z.array(RecommendationItemSchema),
});

export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;
