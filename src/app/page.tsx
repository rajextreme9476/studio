'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from '@/components/dashboard/overview-tab';
import { ReviewExplorerTab } from '@/components/dashboard/review-explorer-tab';
import { SwotTab } from '@/components/dashboard/swot-tab';
import { RecommendationsTab } from '@/components/dashboard/recommendations-tab';
import { reviews as rawReviewsData } from '@/lib/data';
import type { Review, SwotAnalysis } from '@/types';
import { DateRangeFilter, type DateRange } from '@/components/dashboard/date-range-filter';
import { subDays, isAfter, parseISO } from 'date-fns';

export default function DashboardPage() {
  const [reviews] = useState<Review[]>(rawReviewsData);
  const [swot, setSwot] = useState<SwotAnalysis | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('30d');

  const filteredReviews = useMemo(() => {
    // Find the latest date in the reviews to use as the "today" for filtering
    const latestReviewDate = reviews.reduce((latest, review) => {
      const reviewDate = parseISO(review.date);
      return reviewDate > latest ? reviewDate : latest;
    }, new Date(0));

    let fromDate: Date;

    switch (dateRange) {
      case '7d':
        fromDate = subDays(latestReviewDate, 7);
        break;
      case '30d':
        fromDate = subDays(latestReviewDate, 30);
        break;
      case '90d':
        fromDate = subDays(latestReviewDate, 90);
        break;
      case '180d':
        fromDate = subDays(latestReviewDate, 180);
        break;
      case '1y':
        fromDate = subDays(latestReviewDate, 365);
        break;
      default:
        return reviews;
    }
    return reviews.filter(review => isAfter(parseISO(review.date), fromDate));
  }, [reviews, dateRange]);

  const handleDateRangeChange = (range: DateRange) => {
    setDateRange(range);
    setSwot(null); // Reset SWOT analysis when date range changes
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <DateRangeFilter value={dateRange} onValueChange={handleDateRangeChange} />
        </div>
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="review-explorer">Review Explorer</TabsTrigger>
            <TabsTrigger value="swot-analysis">SWOT Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab reviews={filteredReviews} />
          </TabsContent>
          <TabsContent value="review-explorer">
            <ReviewExplorerTab reviews={filteredReviews} />
          </TabsContent>
          <TabsContent value="swot-analysis">
            <SwotTab reviews={filteredReviews} onAnalysisComplete={setSwot} />
          </TabsContent>
          <TabsContent value="recommendations">
            <RecommendationsTab swot={swot} reviews={filteredReviews} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
