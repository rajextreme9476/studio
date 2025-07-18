import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-improvements.ts';
import '@/ai/flows/generate-swot-analysis.ts';
import '@/ai/flows/fetch-reviews-flow.ts';
import '@/ai/flows/classify-reviews-flow.ts';
