'use client';

import { useState, useMemo } from 'react';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from '@/components/dashboard/overview-tab';
import { ReviewExplorerTab } from '@/components/dashboard/review-explorer-tab';
import { SwotTab } from '@/components/dashboard/swot-tab';
import { RecommendationsTab } from '@/components/dashboard/recommendations-tab';
import { ReviewUploader } from '@/components/dashboard/review-uploader';
import type { Review, SwotAnalysis } from '@/types';
import { DateRangeFilter, type DateRange } from '@/components/dashboard/date-range-filter';
import { subDays, isAfter, parseISO } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud } from 'lucide-react';


export default function DashboardPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [swot, setSwot] = useState<SwotAnalysis | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>('all');

  const handleReviewsUploaded = (newReviews: Review[]) => {
    setReviews(newReviews);
    setSwot(null); // Reset analysis when new data is uploaded
    setDateRange('all'); // Reset date range to show all new data
  };

  const filteredReviews = useMemo(() => {
    if (reviews.length === 0 || dateRange === 'all') return reviews;
    
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
    setSwot(null);
  };
  
  const renderEmptyState = () => (
    <Card>
      <CardHeader>
        <CardTitle>Welcome to HDFC App Insights</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <UploadCloud className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">Upload Your Review Data</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Export your reviews as a CSV file and drop it here to get started.
          </p>
          <div className="mt-6">
            <ReviewUploader onUpload={handleReviewsUploaded} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            {reviews.length > 0 && (
              <DateRangeFilter value={dateRange} onValueChange={handleDateRangeChange} />
            )}
        </div>

        {reviews.length === 0 ? (
          renderEmptyState()
        ) : (
          <>
            <div className="mb-4">
              <ReviewUploader onUpload={handleReviewsUploaded} />
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
          </>
        )}
      </main>
    </div>
  );
}
