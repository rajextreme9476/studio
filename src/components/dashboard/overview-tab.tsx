'use client';

import { useMemo } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { SentimentTrendChart } from '@/components/dashboard/sentiment-trend-chart';
import { ThemeDistributionChart } from '@/components/dashboard/theme-distribution-chart';
import { BarChart, Smile, Frown, Users, AlertCircle, Star, CalendarX2 } from 'lucide-react';
import type { Review } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { format } from 'date-fns';

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
    
    const starCounts = reviews.reduce((acc, review) => {
        const rating = review.rating;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const ratingsByDay = reviews.reduce((acc, review) => {
        const day = format(new Date(review.date), 'yyyy-MM-dd');
        if (!acc[day]) {
            acc[day] = { total: 0, count: 0 };
        }
        acc[day].total += review.rating;
        acc[day].count += 1;
        return acc;
    }, {} as Record<string, { total: number; count: number }>);

    let worstDay = { date: 'N/A', avgRating: 5 };
    if (Object.keys(ratingsByDay).length > 0) {
        worstDay = Object.entries(ratingsByDay).reduce(
            (min, [date, { total, count }]) => {
                const avg = total / count;
                if (avg < min.avgRating) {
                    return { date, avgRating: avg };
                }
                return min;
            },
            { date: '', avgRating: 6 }
        );
    }

    return { 
        totalReviews, 
        averageRating, 
        positiveReviews, 
        negativeReviews, 
        positivePercent, 
        negativePercent,
        starCounts,
        worstDay: {
            date: worstDay.date ? format(new Date(worstDay.date), 'MMMM d, yyyy') : 'N/A',
            rating: worstDay.avgRating <= 5 ? worstDay.avgRating.toFixed(2) : 'N/A'
        }
    };
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
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <StatCard
            title="5 Star Reviews"
            value={(stats.starCounts[5] || 0).toString()}
            icon={Star}
        />
        <StatCard
            title="4 Star Reviews"
            value={(stats.starCounts[4] || 0).toString()}
            icon={Star}
        />
        <StatCard
            title="3 Star Reviews"
            value={(stats.starCounts[3] || 0).toString()}
            icon={Star}
        />
        <StatCard
            title="2 Star Reviews"
            value={(stats.starCounts[2] || 0).toString()}
            icon={Star}
        />
        <StatCard
            title="1 Star Reviews"
            value={(stats.starCounts[1] || 0).toString()}
            icon={Star}
        />
        <StatCard
          title="Lowest Rated Day"
          value={stats.worstDay.rating}
          icon={CalendarX2}
          description={stats.worstDay.date}
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
