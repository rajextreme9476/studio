'use client';

import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, ListFilter, AlertCircle } from 'lucide-react';
import type { Review, ReviewTheme } from '@/types';
import { Icons, IconKey } from '@/components/icons';
import { ScrollArea } from '../ui/scroll-area';

const sentimentVariantMap: Record<Review['sentiment'], 'default' | 'destructive' | 'secondary'> = {
  Positive: 'default',
  Negative: 'destructive',
  Neutral: 'secondary',
};

const allThemes: ReviewTheme[] = ['Login', 'Privacy', 'Crash', 'UPI', 'Credit Card', 'Registration', 'General'];
const allSentiments: Review['sentiment'][] = ['Positive', 'Negative', 'Neutral'];
const allPlatforms: Review['platform'][] = ['iOS', 'Android'];


export function ReviewExplorerTab({ reviews: initialReviews }: { reviews: Review[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<Review['platform'][]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<Review['sentiment'][]>([]);
  const [themeFilter, setThemeFilter] = useState<ReviewTheme[]>([]);

  const filteredReviews = useMemo(() => {
    return initialReviews
      .filter((review) =>
        review.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.author.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((review) =>
        platformFilter.length === 0 || platformFilter.includes(review.platform)
      )
      .filter((review) =>
        sentimentFilter.length === 0 || sentimentFilter.includes(review.sentiment)
      )
      .filter((review) =>
        themeFilter.length === 0 || themeFilter.includes(review.theme)
      );
  }, [initialReviews, searchTerm, platformFilter, sentimentFilter, themeFilter]);

  const handleExport = () => {
    const headers = "ID,Platform,Author,Rating,Date,Sentiment,Theme,Text";
    const csvContent = "data:text/csv;charset=utf-8," + headers + "\n" +
      filteredReviews.map(r => 
        `"${r.id}","${r.platform}","${r.author}",${r.rating},"${r.date}","${r.sentiment}","${r.theme}","${r.text.replace(/"/g, '""')}"`
      ).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "hdfc-app-reviews.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getThemeIcon = (theme: ReviewTheme) => {
    const iconKey = theme.toLowerCase().replace(' ', '') as IconKey;
    const Icon = Icons[iconKey];
    return Icon ? <Icon className="h-4 w-4 mr-2" /> : null;
  };
  
  const toggleFilter = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, value: T) => {
    setter(current => 
      current.includes(value) 
        ? current.filter(item => item !== value) 
        : [...current, value]
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Explorer</CardTitle>
        <CardDescription>
          Search, filter, and export raw review data. Found {filteredReviews.length} reviews.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 mb-4">
          <Input
            placeholder="Search reviews..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-auto">
                <ListFilter className="mr-2 h-4 w-4" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
                <DropdownMenuLabel>Platform</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allPlatforms.map(platform => (
                    <DropdownMenuCheckboxItem key={platform} checked={platformFilter.includes(platform)} onCheckedChange={() => toggleFilter(setPlatformFilter, platform)}>
                        {platform}
                    </DropdownMenuCheckboxItem>
                ))}
                
                <DropdownMenuLabel>Sentiment</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allSentiments.map(sentiment => (
                    <DropdownMenuCheckboxItem key={sentiment} checked={sentimentFilter.includes(sentiment)} onCheckedChange={() => toggleFilter(setSentimentFilter, sentiment)}>
                        {sentiment}
                    </DropdownMenuCheckboxItem>
                ))}

                <DropdownMenuLabel>Theme</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {allThemes.map(theme => (
                    <DropdownMenuCheckboxItem key={theme} checked={themeFilter.includes(theme)} onCheckedChange={() => toggleFilter(setThemeFilter, theme)}>
                        {theme}
                    </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleExport} disabled={filteredReviews.length === 0}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
        <ScrollArea className="h-[60vh]">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead className="w-[40%]">Review</TableHead>
                <TableHead className="text-center">Sentiment</TableHead>
                <TableHead className="text-center">Theme</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.length > 0 ? (
                filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">{review.author}<br/><span className="text-muted-foreground text-xs">{review.platform}</span></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{review.text}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={sentimentVariantMap[review.sentiment]}>
                        {review.sentiment}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center">
                        {getThemeIcon(review.theme)}
                        <span>{review.theme}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">{review.rating}/5</TableCell>
                    <TableCell>{new Date(review.date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <AlertCircle className="h-8 w-8 mb-2" />
                            <span>No reviews match your filters.</span>
                        </div>
                    </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
