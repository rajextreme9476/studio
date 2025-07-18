'use client';

import { Bar, BarChart, XAxis, YAxis, Tooltip } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Review, ReviewTheme } from '@/types';
import { useMemo } from 'react';

type ThemeDistributionChartProps = {
  reviews: Review[];
};

export function ThemeDistributionChart({ reviews }: ThemeDistributionChartProps) {
  const chartData = useMemo(() => {
    const themeCounts = reviews.reduce((acc, review) => {
      acc[review.theme] = (acc[review.theme] || 0) + 1;
      return acc;
    }, {} as Record<ReviewTheme, number>);

    return Object.entries(themeCounts).map(([name, count]) => ({
      name,
      count,
    })).sort((a, b) => b.count - a.count);
  }, [reviews]);

  const chartConfig = {
    count: {
      label: 'Reviews',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Theme Distribution</CardTitle>
        <CardDescription>Most common themes mentioned in reviews.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData} layout="vertical" margin={{ left: 10, right: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
              width={80}
            />
            <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
            <Bar dataKey="count" radius={5} fill="var(--color-count)" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
