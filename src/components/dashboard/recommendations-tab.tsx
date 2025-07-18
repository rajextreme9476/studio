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
import { generateRecommendationsAction } from '@/app/actions';
import { useToast } from '@/hooks/use-toast';
import type { Review, SwotAnalysis } from '@/types';
import { Bot, Wand2 } from 'lucide-react';

type RecommendationsTabProps = {
  swot: SwotAnalysis | null;
  reviews: Review[];
};

export function RecommendationsTab({ swot, reviews }: RecommendationsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!swot?.weaknesses) {
      toast({
        variant: 'destructive',
        title: 'Prerequisite Missing',
        description: 'Please generate a SWOT analysis first to identify weaknesses.',
      });
      return;
    }
    setIsLoading(true);
    setRecommendations(null);
    const result = await generateRecommendationsAction(swot.weaknesses, reviews);
    setIsLoading(false);
    if (result.success && result.data) {
      setRecommendations(result.data.suggestions);
      toast({
        title: 'Recommendations Generated',
        description: 'Successfully created improvement suggestions.',
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
      return (
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </div>
      );
    }
    if (recommendations) {
      return (
        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-line text-muted-foreground">
         {recommendations}
        </div>
      );
    }
    return (
        <div className="text-center text-muted-foreground py-12">
            <p>
                {swot?.weaknesses
                ? 'Weaknesses identified. Ready to generate recommendations.'
                : 'Generate a SWOT analysis first to get started.'}
            </p>
        </div>
    );
  };


  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
            <div>
                <CardTitle>Strategic Recommendations</CardTitle>
                <CardDescription>
                    AI-driven suggestions for app improvements based on weaknesses.
                </CardDescription>
            </div>
            <Button onClick={handleGenerate} disabled={isLoading || !swot?.weaknesses}>
                <Bot className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate Recommendations'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
