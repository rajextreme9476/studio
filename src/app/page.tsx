'use client';

import { useState } from 'react';
import { Header } from '@/components/header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OverviewTab } from '@/components/dashboard/overview-tab';
import { ReviewExplorerTab } from '@/components/dashboard/review-explorer-tab';
import { SwotTab } from '@/components/dashboard/swot-tab';
import { RecommendationsTab } from '@/components/dashboard/recommendations-tab';
import { reviews as rawReviewsData } from '@/lib/data';
import type { Review, SwotAnalysis } from '@/types';

export default function DashboardPage() {
  const [reviews] = useState<Review[]>(rawReviewsData);
  const [swot, setSwot] = useState<SwotAnalysis | null>(null);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="review-explorer">Review Explorer</TabsTrigger>
            <TabsTrigger value="swot-analysis">SWOT Analysis</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>
          <TabsContent value="overview">
            <OverviewTab reviews={reviews} />
          </TabsContent>
          <TabsContent value="review-explorer">
            <ReviewExplorerTab reviews={reviews} />
          </TabsContent>
          <TabsContent value="swot-analysis">
            <SwotTab reviews={reviews} onAnalysisComplete={setSwot} />
          </TabsContent>
          <TabsContent value="recommendations">
            <RecommendationsTab swot={swot} reviews={reviews} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
