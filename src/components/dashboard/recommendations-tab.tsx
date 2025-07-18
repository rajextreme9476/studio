'use client';

import { useEffect, useState } from 'react';
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
import type { Review, SwotAnalysis, SuggestImprovementsOutput } from '@/types';
import { Bot, Lightbulb } from 'lucide-react';

type RecommendationsTabProps = {
  swot: SwotAnalysis | null;
  reviews: Review[];
  onRecommendationsComplete: (recommendations: SuggestImprovementsOutput['recommendations'] | null) => void;
};

export function RecommendationsTab({ swot, reviews, onRecommendationsComplete }: RecommendationsTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<SuggestImprovementsOutput['recommendations'] | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    onRecommendationsComplete(recommendations);
  }, [recommendations, onRecommendationsComplete]);

  const handleGenerate = async () => {
    if (!swot?.weaknesses || swot.weaknesses.length === 0) {
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
    if (result.success && result.data?.recommendations) {
      setRecommendations(result.data.recommendations);
      toast({
        title: 'Recommendations Generated',
        description: 'Successfully created improvement suggestions.',
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Failed to generate recommendations.',
      });
    }
  };
  
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }
    if (recommendations) {
      return (
        <div className="space-y-6">
          {recommendations.map((item, index) => (
            <div key={index} className="p-4 border rounded-lg bg-background">
              <h3 className="text-lg font-semibold text-foreground mb-3">{item.title}</h3>
              <div className="space-y-2 mb-3">
                {item.actions.map((action, actionIndex) => (
                  <p key={actionIndex} className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">Action:</span> {action}
                  </p>
                ))}
              </div>
               <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-md">
                <span className="font-semibold text-foreground">Rationale:</span> {item.rationale}
              </p>
            </div>
          ))}
        </div>
      );
    }
    return (
        <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
            <Lightbulb className="h-10 w-10 mb-4" />
            <p className="max-w-md">
                {swot?.weaknesses && swot.weaknesses.length > 0
                ? 'Weaknesses have been identified. Click "Generate Recommendations" to get AI-powered strategic advice on how to improve the app.'
                : 'Generate a SWOT analysis first. Recommendations are based on the identified weaknesses.'}
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
            <Button onClick={handleGenerate} disabled={isLoading || !swot?.weaknesses || swot.weaknesses.length === 0}>
                <Bot className="mr-2 h-4 w-4" />
                {isLoading ? 'Generating...' : 'Generate Recommendations'}
            </Button>
        </div>
      </CardHeader>
      <CardContent>{renderContent()}</CardContent>
    </Card>
  );
}
