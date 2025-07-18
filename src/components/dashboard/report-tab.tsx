'use client';

import { useState, useRef, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Review, SwotAnalysis, SuggestImprovementsOutput, SwotItem } from '@/types';
import { Download, Loader2, ThumbsUp, ThumbsDown, Rocket, AlertTriangle, Lightbulb, LucideIcon, BarChart, Smile, Frown, Users, AlertCircle, Star, CalendarX2 } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Icons } from '@/components/icons';
import { DateRange } from './date-range-filter';
import { format } from 'date-fns';

type ReportTabProps = {
  reviews: Review[];
  swot: SwotAnalysis | null;
  recommendations: SuggestImprovementsOutput['recommendations'] | null;
  dateRange: DateRange;
};

const DATE_RANGE_MAP: Record<DateRange, string> = {
    '7d': 'Last 7 Days',
    '30d': 'Last 30 Days',
    '90d': 'Last 90 Days',
    '180d': 'Last 180 Days',
    '1y': 'Last Year',
    'all': 'All Time',
};

export function ReportTab({ reviews, swot, recommendations, dateRange }: ReportTabProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const reportRef = useRef<HTMLDivElement>(null);

  const handleGeneratePdf = async () => {
    if (!swot || !recommendations) {
        toast({
            variant: 'destructive',
            title: 'Incomplete Data',
            description: 'Please generate both SWOT analysis and recommendations before creating a report.',
        });
        return;
    }
    
    const reportElement = reportRef.current;
    if (!reportElement) return;

    setIsGenerating(true);

    try {
        const canvas = await html2canvas(reportElement, {
            scale: 2, // Higher scale for better quality
            useCORS: true,
            backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;
        const ratio = canvasWidth / canvasHeight;
        const imgWidth = pdfWidth;
        const imgHeight = imgWidth / ratio;

        let heightLeft = imgHeight;
        let position = 0;
        
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;

        while (heightLeft > 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pdfHeight;
        }

        pdf.save(`HDFC-App-Insights-Report-${new Date().toISOString().split('T')[0]}.pdf`);

        toast({
            title: 'Report Generated',
            description: 'Your PDF report has been downloaded.',
        });

    } catch (error) {
        console.error("Failed to generate PDF:", error);
        toast({
            variant: 'destructive',
            title: 'Error Generating PDF',
            description: 'An unexpected error occurred. Please try again.',
        });
    } finally {
        setIsGenerating(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Generate Report</CardTitle>
              <CardDescription>
                Compile a comprehensive PDF report with all the key insights from the dashboard.
              </CardDescription>
            </div>
            <Button onClick={handleGeneratePdf} disabled={isGenerating || !swot || !recommendations}>
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Download PDF Report'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
           <div className="text-center text-muted-foreground py-12 flex flex-col items-center">
                <Lightbulb className="h-10 w-10 mb-4" />
                <p className="max-w-md">
                    {(!swot || !recommendations) 
                        ? 'Generate a SWOT analysis and recommendations first to create a complete report.'
                        : 'Click the "Download PDF Report" button to generate your document.'
                    }
                </p>
            </div>
        </CardContent>
      </Card>
      
      {/* Hidden element for PDF generation */}
      <div className="absolute -left-[9999px] top-auto" aria-hidden="true">
        <div ref={reportRef} className="p-10 bg-white text-black w-[800px]">
          <ReportContent reviews={reviews} swot={swot} recommendations={recommendations} dateRange={dateRange} />
        </div>
      </div>
    </>
  );
}

// Separate component for the actual report content for cleanliness
function ReportContent({ reviews, swot, recommendations, dateRange }: ReportTabProps) {
    const stats = useMemo(() => {
        if (!reviews || reviews.length === 0) return null;
        const totalReviews = reviews.length;
        const averageRating = (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(2);
        const positiveReviews = reviews.filter((r) => r.sentiment === 'Positive').length;
        const negativeReviews = reviews.filter((r) => r.sentiment === 'Negative').length;
        
        const starCounts = reviews.reduce((acc, review) => {
            acc[review.rating] = (acc[review.rating] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        const ratingsByDay = reviews.reduce((acc, review) => {
            const day = format(new Date(review.date), 'yyyy-MM-dd');
            if (!acc[day]) acc[day] = { total: 0, count: 0 };
            acc[day].total += review.rating;
            acc[day].count += 1;
            return acc;
        }, {} as Record<string, { total: number; count: number }>);

        let worstDay = { date: 'N/A', avgRating: 5 };
        if (Object.keys(ratingsByDay).length > 0) {
            worstDay = Object.entries(ratingsByDay).reduce(
                (min, [date, { total, count }]) => {
                    const avg = total / count;
                    return avg < min.avgRating ? { date, avgRating: avg } : min;
                }, { date: '', avgRating: 6 }
            );
        }

        return {
            totalReviews, averageRating, positiveReviews, negativeReviews, starCounts,
            worstDay: {
                date: worstDay.date ? format(new Date(worstDay.date), 'MMMM d, yyyy') : 'N/A',
                rating: worstDay.avgRating <= 5 ? worstDay.avgRating.toFixed(2) : 'N/A'
            }
        };
    }, [reviews]);

    if (!stats || !swot || !recommendations) return null;

    return (
        <div className="space-y-12 font-sans">
            <header className="flex items-center justify-between border-b-2 border-gray-800 pb-4">
                <div className="flex items-center gap-4">
                    <Icons.logo className="h-12 w-12 text-blue-800" />
                    <h1 className="text-4xl font-bold text-gray-800">HDFC App Insights Report</h1>
                </div>
                <div className="text-right">
                    <p className="text-sm">Report Generated: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm">Review Period: {DATE_RANGE_MAP[dateRange]}</p>
                </div>
            </header>

            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b border-gray-400 pb-2">1. Executive Overview</h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                    <ReportStatCard title="Total Reviews" value={stats.totalReviews.toString()} icon={Users} />
                    <ReportStatCard title="Average Rating" value={stats.averageRating} icon={BarChart} />
                    <ReportStatCard title="Positive Sentiment" value={stats.positiveReviews.toString()} icon={Smile} />
                    <ReportStatCard title="Negative Sentiment" value={stats.negativeReviews.toString()} icon={Frown} />
                </div>
                <div className="grid grid-cols-6 gap-4 text-center mt-4">
                     <ReportStatCard title="5 Star" value={(stats.starCounts[5] || 0).toString()} icon={Star} />
                     <ReportStatCard title="4 Star" value={(stats.starCounts[4] || 0).toString()} icon={Star} />
                     <ReportStatCard title="3 Star" value={(stats.starCounts[3] || 0).toString()} icon={Star} />
                     <ReportStatCard title="2 Star" value={(stats.starCounts[2] || 0).toString()} icon={Star} />
                     <ReportStatCard title="1 Star" value={(stats.starCounts[1] || 0).toString()} icon={Star} />
                     <ReportStatCard title="Lowest Rated Day" value={stats.worstDay.rating} icon={CalendarX2} />
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b border-gray-400 pb-2">2. SWOT Analysis</h2>
                <div className="space-y-6">
                    <ReportSwotSection icon={ThumbsUp} title="Strengths" items={swot.strengths} columnHeaders={['Strength', 'Evidence from Reviews']} />
                    <ReportSwotSection icon={ThumbsDown} title="Weaknesses" items={swot.weaknesses} columnHeaders={['Pain Point', 'Strategic Risk']} />
                    <ReportSwotSection icon={Rocket} title="Opportunities" items={swot.opportunities} columnHeaders={['Opportunity Area', 'Value Creation Potential']} />
                    <ReportSwotSection icon={AlertTriangle} title="Threats" items={swot.threats} columnHeaders={['Threat Source', 'Strategic Consequence']} />
                </div>
            </section>

            <section>
                <h2 className="text-2xl font-semibold mb-4 border-b border-gray-400 pb-2">3. Strategic Recommendations</h2>
                <div className="space-y-6">
                    {recommendations.map((item, index) => (
                        <div key={index} className="p-4 border border-gray-200 rounded-lg bg-white">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">{item.title}</h3>
                            <div className="space-y-2 mb-3">
                                {item.actions.map((action, actionIndex) => (
                                <p key={actionIndex} className="text-sm text-gray-600">
                                    <span className="font-semibold text-gray-700">Action:</span> {action}
                                </p>
                                ))}
                            </div>
                            <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-md">
                                <span className="font-semibold text-gray-700">Rationale:</span> {item.rationale}
                            </p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function ReportStatCard({ title, value, icon: Icon }: { title: string; value: string; icon: LucideIcon }) {
    return (
        <div className="p-4 border border-gray-200 rounded-lg">
            <Icon className="h-6 w-6 text-blue-700 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-gray-600">{title}</h4>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    );
}

function ReportSwotSection({ icon: Icon, title, items, columnHeaders }: { icon: LucideIcon; title: string; items: SwotItem[]; columnHeaders: [string, string] }) {
    if (!items || items.length === 0) return null;
    return (
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Icon className="h-8 w-8 text-blue-800" />
          <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        </div>
        <div className="overflow-hidden rounded-lg border border-gray-300">
          <table className="w-full text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="w-1/3 px-4 py-2 text-left font-semibold text-gray-600">{columnHeaders[0]}</th>
                <th className="px-4 py-2 text-left font-semibold text-gray-600">{columnHeaders[1]}</th>
              </tr>
            </thead>
            <tbody className='bg-white'>
              {items.map((item, index) => (
                <tr key={index} className="border-t border-gray-200">
                  <td className="p-3 align-top font-medium text-gray-700">{item.title}</td>
                  <td className="p-3 align-top text-gray-600 whitespace-pre-line">{item.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
