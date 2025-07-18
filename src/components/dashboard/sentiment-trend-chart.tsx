'use client';

import { TrendingUp } from 'lucide-react';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
  ChartTooltip,
} from '@/components/ui/chart';
import type { Review } from '@/types';
import { useMemo } from 'react';

type SentimentTrendChartProps = {
  reviews: Review[];
};

export function SentimentTrendChart({ reviews }: SentimentTrendChartProps) {
  const chartData = useMemo(() => {
    const sentimentByDate = reviews.reduce((acc, review) => {
      const date = new Date(review.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (!acc[date]) {
        acc[date] = { date, Positive: 0, Negative: 0, Neutral: 0 };
      }
      acc[date][review.sentiment]++;
      return acc;
    }, {} as Record<string, { date: string, Positive: number, Negative: number, Neutral: number }>);
    
    return Object.values(sentimentByDate).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [reviews]);
  
  const chartConfig = {
    Positive: {
      label: 'Positive',
      color: 'hsl(var(--chart-2))',
    },
    Negative: {
      label: 'Negative',
      color: 'hsl(var(--destructive))',
    },
     Neutral: {
      label: 'Neutral',
      color: 'hsl(var(--muted-foreground))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sentiment Trends</CardTitle>
        <CardDescription>Positive vs. Negative sentiment over the last month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <LineChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis />
            <Tooltip content={<ChartTooltipContent />} />
            <Line dataKey="Positive" type="monotone" stroke="var(--color-Positive)" strokeWidth={2} dot={false} />
            <Line dataKey="Negative" type="monotone" stroke="var(--color-Negative)" strokeWidth={2} dot={false} />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
