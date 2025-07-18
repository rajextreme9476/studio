export type ReviewTheme = 'Login' | 'Privacy' | 'Crash' | 'UPI' | 'Credit Card' | 'Registration' | 'General';

export type Review = {
  id: string;
  platform: 'iOS' | 'Android';
  author: string;
  rating: number;
  text: string;
  date: string;
  sentiment: 'Positive' | 'Negative' | 'Neutral';
  theme: ReviewTheme;
};

export type SwotAnalysis = {
  strengths: string;
  weaknesses: string;
  opportunities: string;
  threats: string;
};
