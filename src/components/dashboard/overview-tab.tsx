'use client';

import { useMemo } from 'react';
import { StatCard } from '@/components/dashboard/stat-card';
import { SentimentTrendChart } from '@/components/dashboard/sentiment-trend-chart';
import { BarChart, Smile, Frown, Users, AlertCircle, Star, CalendarX2 } from 'lucide-react';
import type { Review, ReviewTheme } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format, parseISO } from 'date-fns';

type OverviewTabProps = {
  reviews: Review[];
};

const THEME_DESCRIPTIONS: Record<string, string> = {
    'Interface/UI': 'Design, layout, and navigation often praised; some users call out inconsistency.',
    'Login': 'Users report login loops, timeouts, and failed sessions.',
    'Privacy': 'Balance shown pre-login flagged as a critical security breach.',
    'Crash': 'App freezes, force closes, especially on Android 12–13 with mid-tier RAM.',
    'Credit Card': 'Inaccessible or blank card data section.',
    'Registration': 'SIM-based OTP or onboarding flow failures.',
    'UPI': 'Broken UPI payments; approval flows don’t reach payer.',
    'General': 'General feedback, feature requests, or uncategorized issues.',
    'Security': 'Absence of biometric/PIN walls erodes user trust.',
};

export function OverviewTab({ reviews }: OverviewTabProps) {
  const stats = useMemo(() => {
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      return {
        totalReviews: 0,
        averageRating: '0',
        positiveReviews: 0,
        negativeReviews: 0,
        positivePercent: 0,
        negativePercent: 0,
        starCounts: {},
        worstDay: { date: 'N/A', rating: 'N/A' },
        reviewDuration: 'N/A'
      };
    }

    const averageRating = (
        reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
      ).toFixed(2);
    const positiveReviews = reviews.filter(
      (r) => r.sentiment === 'Positive'
    ).length;
    const negativeReviews = reviews.filter(
      (r) => r.sentiment === 'Negative'
    ).length;
    const positivePercent = Math.round((positiveReviews / totalReviews) * 100);
    const negativePercent = Math.round((negativeReviews / totalReviews) * 100);
    
    const starCounts = reviews.reduce((acc, review) => {
        const rating = review.rating;
        acc[rating] = (acc[rating] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    const ratingsByDay = reviews.reduce((acc, review) => {
        const day = format(parseISO(review.date), 'yyyy-MM-dd');
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

    const dates = reviews.map(r => parseISO(r.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    const reviewDuration = `${format(minDate, 'MMM d, yyyy')} - ${format(maxDate, 'MMM d, yyyy')}`;

    return { 
        totalReviews, 
        averageRating, 
        positiveReviews, 
        negativeReviews, 
        positivePercent, 
        negativePercent,
        starCounts,
        worstDay: {
            date: worstDay.date ? format(parseISO(worstDay.date), 'MMMM d, yyyy') : 'N/A',
            rating: worstDay.avgRating <= 5 ? worstDay.avgRating.toFixed(2) : 'N/A'
        },
        reviewDuration,
    };
  }, [reviews]);
  
  const themeAnalysis = useMemo(() => {
    const themeCounts = reviews.reduce((acc, review) => {
      acc[review.theme] = (acc[review.theme] || 0) + 1;
      return acc;
    }, {} as Record<ReviewTheme, number>);

    return Object.entries(themeCounts)
      .map(([theme, count]) => ({
        category: theme,
        mentions: count,
        insight: THEME_DESCRIPTIONS[theme] || 'No specific insight available.',
      }))
      .sort((a, b) => b.mentions - a.mentions);
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
                      <p>Please select a different time period or upload a new file.</p>
                  </div>
              </CardContent>
          </Card>
      )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>HDFC Mobile Bank</CardTitle>
          <CardDescription>Review Duration: {stats.reviewDuration}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            This report combines insights from {stats.totalReviews.toLocaleString()} user reviews to guide product, CX, and engineering teams toward a unified goal: achieving a consistent 4.9+ rating across platforms. Key problem clusters include login failure, privacy concerns, and onboarding breakdowns. Yet, the app is also lauded for its modern interface and banking convenience. This dashboard provides a clear SWOT analysis, review category mapping, and actionable roadmap to stabilize user trust and improve retention.
          </p>
        </CardContent>
      </Card>
      
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
          <Card>
            <CardHeader>
              <CardTitle>Review Category Analysis</CardTitle>
              <CardDescription>Breakdown of the most common themes in reviews.</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue Category</TableHead>
                    <TableHead className="text-right">Mentions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {themeAnalysis.map((item) => (
                    <TableRow key={item.category}>
                      <TableCell>
                        <div className="font-medium">{item.category}</div>
                        <div className="text-xs text-muted-foreground">{item.insight}</div>
                      </TableCell>
                      <TableCell className="text-right font-medium">{item.mentions}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
