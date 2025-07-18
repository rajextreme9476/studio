'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { generateSwotAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Review, SwotAnalysis } from '@/types';
import { Lightbulb, ShieldCheck, ThumbsDown, Zap, Bot } from 'lucide-react';

type SwotTabProps = {
  reviews: Review[];
  onAnalysisComplete: (analysis: SwotAnalysis) => void;
};

export function SwotTab({ reviews, onAnalysisComplete }: SwotTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [swot, setSwot] = useState<SwotAnalysis | null>(null);
  const { toast } = useToast();

  const handleGenerateSwot = async () => {
    setIsLoading(true);
    setSwot(null);
    const result = await generateSwotAction(reviews);
    setIsLoading(false);
    if (result.success && result.data) {
      setSwot(result.data);
      onAnalysisComplete(result.data);
      toast({
        title: 'SWOT Analysis Generated',
        description: 'Successfully created SWOT analysis from review data.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error,
      });
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return <SwotSkeleton />;
    }
    if (swot) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SwotCard title="Strengths" icon={ShieldCheck} content={swot.strengths} />
          <SwotCard title="Weaknesses" icon={ThumbsDown} content={swot.weaknesses} />
          <SwotCard title="Opportunities" icon={Lightbulb} content={swot.opportunities} />
          <SwotCard title="Threats" icon={Zap} content={swot.threats} />
        </div>
      );
    }
    return (
      <div className="text-center text-muted-foreground py-12">
        <p>Click the button to generate a SWOT analysis based on the latest reviews.</p>
      </div>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
              <CardTitle>SWOT Analysis</CardTitle>
              <CardDescription>
                AI-generated Strengths, Weaknesses, Opportunities, and Threats.
              </CardDescription>
            </div>
            <Button onClick={handleGenerateSwot} disabled={isLoading}>
              <Bot className="mr-2 h-4 w-4" />
              {isLoading ? 'Generating...' : 'Generate SWOT'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}

function SwotCard({ title, icon: Icon, content }: { title: string, icon: React.ElementType, content: string }) {
    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Icon className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">{title}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground whitespace-pre-line flex-grow">
                {content}
            </CardContent>
        </Card>
    )
}

function SwotSkeleton() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
            <Card>
                <CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader>
                <CardContent className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                </CardContent>
            </Card>
        </div>
    )
}
