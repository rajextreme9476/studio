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
import type { Review, SwotAnalysis, SwotItem } from '@/types';
import { Bot, ThumbsUp, ThumbsDown, Rocket, AlertTriangle, LucideIcon } from 'lucide-react';

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
        <div className="space-y-8">
          <SwotSection
            icon={ThumbsUp}
            title="Strengths"
            subtitle="Core Features Driving Positive Sentiment"
            items={swot.strengths}
            columnHeaders={['Strength', 'Evidence from Reviews']}
          />
          <SwotSection
            icon={ThumbsDown}
            title="Weaknesses"
            subtitle="High-Friction Touchpoints That Limit NPS"
            items={swot.weaknesses}
            columnHeaders={['Pain Point', 'Strategic Risk']}
          />
          <SwotSection
            icon={Rocket}
            title="Opportunities"
            subtitle="Untapped Features & Experience Wins"
            items={swot.opportunities}
            columnHeaders={['Opportunity Area', 'Value Creation Potential']}
          />
          <SwotSection
            icon={AlertTriangle}
            title="Threats"
            subtitle="Competitive & Reputational Risks If Gaps Persist"
            items={swot.threats}
            columnHeaders={['Threat Source', 'Strategic Consequence']}
          />
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

function SwotSection({
  icon: Icon,
  title,
  subtitle,
  items,
  columnHeaders,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  items: SwotItem[];
  columnHeaders: [string, string];
}) {
  if (!items || items.length === 0) return null;

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <Icon className="h-8 w-8 text-primary" />
        <div>
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-1/3 px-4 py-2 text-left text-sm font-semibold text-muted-foreground">{columnHeaders[0]}</th>
              <th className="px-4 py-2 text-left text-sm font-semibold text-muted-foreground">{columnHeaders[1]}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} className="border-t">
                <td className="p-4 align-top font-medium text-sm">{item.title}</td>
                <td className="p-4 align-top text-sm text-muted-foreground whitespace-pre-line">{item.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function SwotSkeleton() {
    return (
        <div className="space-y-8">
            {[...Array(4)].map((_, i) => (
                <div key={i}>
                    <div className="flex items-center gap-3 mb-4">
                        <Skeleton className="h-8 w-8 rounded-full" />
                        <div className="space-y-2">
                           <Skeleton className="h-5 w-32" />
                           <Skeleton className="h-4 w-48" />
                        </div>
                    </div>
                    <div className="border rounded-lg p-4 space-y-4">
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-1/3" />
                            <Skeleton className="h-12 w-2/3" />
                        </div>
                        <div className="flex gap-4">
                            <Skeleton className="h-12 w-1/3" />
                            <Skeleton className="h-12 w-2/3" />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
