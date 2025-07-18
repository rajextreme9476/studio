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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Download, ListFilter } from 'lucide-react';
import type { Review, ReviewTheme } from '@/types';
import { reviews as allReviews } from '@/lib/data';
import { Icons, IconKey } from '@/components/icons';

const sentimentVariantMap: Record<Review['sentiment'], 'default' | 'destructive' | 'secondary'> = {
  Positive: 'default',
  Negative: 'destructive',
  Neutral: 'secondary',
};

export function ReviewExplorerTab({ reviews: initialReviews }: { reviews: Review[] }) {
  const [reviews] = useState(initialReviews);
  const [searchTerm, setSearchTerm] = useState('');
  const [platformFilter, setPlatformFilter] = useState<('iOS' | 'Android')[]>([]);
  const [sentimentFilter, setSentimentFilter] = useState<Review['sentiment'][]>([]);
  const [themeFilter, setthemeFilter] = useState<ReviewTheme[]>([]);

  const filteredReviews = useMemo(() => {
    return reviews
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
  }, [reviews, searchTerm, platformFilter, sentimentFilter, themeFilter]);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Explorer</CardTitle>
        <CardDescription>
          Search, filter, and export raw review data.
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
            <DropdownMenuContent align="end">
              {/* Platform Filter */}
              <DropdownMenuCheckboxItem onCheckedChange={(c) => c ? setPlatformFilter(p => [...p, 'iOS']) : setPlatformFilter(p => p.filter(i => i !== 'iOS'))}>iOS</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem onCheckedChange={(c) => c ? setPlatformFilter(p => [...p, 'Android']) : setPlatformFilter(p => p.filter(i => i !== 'Android'))}>Android</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" /> Export CSV
          </Button>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Author</TableHead>
                <TableHead>Review</TableHead>
                <TableHead className="text-center">Sentiment</TableHead>
                <TableHead className="text-center">Theme</TableHead>
                <TableHead className="text-center">Rating</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReviews.map((review) => (
                <TableRow key={review.id}>
                  <TableCell className="font-medium">{review.author}<br/><span className="text-muted-foreground text-xs">{review.platform}</span></TableCell>
                  <TableCell className="max-w-md">{review.text}</TableCell>
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
                  <TableCell>{review.date}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
