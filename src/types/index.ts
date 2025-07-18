import { z } from 'zod';

export type ReviewTheme = 'Login' | 'Privacy' | 'Crash' | 'UPI' | 'Credit Card' | 'Registration' | 'General';

// Adjusted to handle potential string-to-number conversion and provide defaults
export const ReviewSchema = z.preprocess(
  (data: any) => ({
    ...data,
    rating: data.rating ? parseInt(data.rating, 10) : 0,
    sentiment: data.sentiment || 'Neutral', // Default sentiment if missing
  }),
  z.object({
    id: z.string(),
    platform: z.enum(['iOS', 'Android']),
    author: z.string(),
    rating: z.number().int().min(1).max(5),
    text: z.string(),
    date: z.string().refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    }),
    sentiment: z.enum(['Positive', 'Negative', 'Neutral']),
    theme: z.enum(['Login', 'Privacy', 'Crash', 'UPI', 'Credit Card', 'Registration', 'General']),
  })
);


export type Review = z.infer<typeof ReviewSchema>;

export type SwotAnalysis = {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
};
