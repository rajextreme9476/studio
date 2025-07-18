'use client';

import { useMemo } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { SentimentTrendChart } from '@/components/dashboard/sentiment-trend-chart';
import { ThemeDistributionChart } from '@/components/dashboard/theme-distribution-chart';
import { BarChart, Smile, Frown, Users, AlertCircle } from 'lucide-react';
import type { Review } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

type OverviewTabProps = {
  reviews: Review[];
};

export function OverviewTab({ reviews }: OverviewTabProps) {
  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    const averageRating =
      totalReviews > 0
        ? (
            reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
          ).toFixed(2)
        : '0';
    const positiveReviews = reviews.filter(
      (r) => r.sentiment === 'Positive'
    ).length;
    const negativeReviews = reviews.filter(
      (r) => r.sentiment === 'Negative'
    ).length;
    const positivePercent = totalReviews > 0 ? Math.round((positiveReviews / totalReviews) * 100) : 0;
    const negativePercent = totalReviews > 0 ? Math.round((negativeReviews / totalReviews) * 100) : 0;

    return { totalReviews, averageRating, positiveReviews, negativeReviews, positivePercent, negativePercent };
  }, [reviews]);

  if (reviews.length === 0) {
      return (
          <Card>
              <CardHeader>
                  <CardTitle className="text-xl">No Data Available</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="flex flex-col items-center justify-center text-center text-muted-foreground py-12">
                      <AlertCircle className="h-12 w-12 mb-4" />
                      <p>There are no reviews in the selected date range.</p>
                      <p>Please select a different time period.</p>
                  </div>
              </CardContent>
          </Card>
      )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Reviews"
          value={stats.totalReviews.toString()}
          icon={Users}
        />
        <StatCard
          title="Average Rating"
          value={stats.averageRating}
          icon={BarChart}
          description="Out of 5 stars"
        />
        <StatCard
          title="Positive Sentiment"
          value={stats.positiveReviews.toString()}
          icon={Smile}
          description={`${stats.positivePercent}% of total`}
        />
        <StatCard
          title="Negative Sentiment"
          value={stats.negativeReviews.toString()}
          icon={Frown}
          description={`${stats.negativePercent}% of total`}
        />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SentimentTrendChart reviews={reviews} />
        </div>
        <div className="lg:col-span-3">
          <ThemeDistributionChart reviews={reviews} />
        </div>
      </div>
    </div>
  );
}
