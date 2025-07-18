'use client';

import { useMemo } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { SentimentTrendChart } from '@/components/dashboard/sentiment-trend-chart';
import { ThemeDistributionChart } from '@/components/dashboard/theme-distribution-chart';
import { BarChart, Smile, Frown, Users } from 'lucide-react';
import type { Review } from '@/types';

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
        : 'N/A';
    const positiveReviews = reviews.filter(
      (r) => r.sentiment === 'Positive'
    ).length;
    const negativeReviews = reviews.filter(
      (r) => r.sentiment === 'Negative'
    ).length;
    return { totalReviews, averageRating, positiveReviews, negativeReviews };
  }, [reviews]);

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
          description={`${Math.round((stats.positiveReviews / stats.totalReviews) * 100)}% of total`}
        />
        <StatCard
          title="Negative Sentiment"
          value={stats.negativeReviews.toString()}
          icon={Frown}
          description={`${Math.round((stats.negativeReviews / stats.totalReviews) * 100)}% of total`}
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
