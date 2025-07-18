import { z } from 'zod';

export type ReviewTheme = 'Login' | 'Privacy' | 'Crash' | 'UPI' | 'Credit Card' | 'Registration' | 'General';

export const ReviewSchema = z.object({
  id: z.string(),
  platform: z.enum(['iOS', 'Android']),
  author: z.string(),
  rating: z.number(),
  text: z.string(),
  date: z.string(),
  sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
  theme: z.enum(['Login', 'Privacy', 'Crash', 'UPI', 'Credit Card', 'Registration', 'General']),
});

export type Review = z.infer<typeof ReviewSchema>;

export type SwotAnalysis = {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
};
