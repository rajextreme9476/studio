
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Review } from '@/types';
import { ReviewSchema } from '@/types';
import { Upload, FileCheck2, FileX2, Loader2, Wand2 } from 'lucide-react';
import { z } from 'zod';
import { classifyReviews } from '@/ai/flows/classify-reviews-flow';

type ReviewUploaderProps = {
  onUpload: (reviews: Review[]) => void;
  onClassificationChange: (isClassifying: boolean) => void;
  isClassifying?: boolean;
};

// Define expected CSV headers from user's file
const expectedHeaders = [
  'Star Rating',
  'Review Text',
  'Review Submit Date and Time',
  'Review Submit Millis Since Epoch',
  'Review Link',
  'Device'
];

export function ReviewUploader({ onUpload, onClassificationChange, isClassifying }: ReviewUploaderProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) {
        return;
      }
      const file = acceptedFiles[0];
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Invalid file type. Please upload a CSV file.');
        setFileName(null);
        return;
      }
      
      setIsLoading(true);
      setError(null);
      setFileName(file.name);

      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: async (results) => {
          const headers = results.meta.fields;
          const requiredHeaders = ['Star Rating', 'Review Text', 'Review Submit Date and Time', 'Review Submit Millis Since Epoch', 'Review Link', 'Device'];

          if (!headers || !requiredHeaders.every(h => headers.includes(h))) {
              const missingHeaders = requiredHeaders.filter(h => !headers?.includes(h));
              const errorMessage = `CSV missing required headers: ${missingHeaders.join(', ')}`;
              setError(errorMessage);
              toast({
                  variant: 'destructive',
                  title: 'Invalid CSV Header',
                  description: `Please ensure the CSV has the correct headers. Missing: ${missingHeaders.join(', ')}`,
              });
              setFileName(null);
              setIsLoading(false);
              return;
          }

          try {
            // Transform and validate data
            const parsedReviews = z.array(ReviewSchema).parse(
              results.data.map((row: any) => ({
                id: row['Review Link'] || row['Review Submit Millis Since Epoch'] || crypto.randomUUID(),
                platform: row['Device']?.toLowerCase().includes('phone') ? 'Android' : 'iOS',
                author: `User ${ (row['Review Submit Millis Since Epoch'] || '').slice(-4)}`,
                rating: parseInt(row['Star Rating'], 10) || 0,
                text: row['Review Text'] || '',
                date: new Date(row['Review Submit Date and Time']).toISOString(),
              }))
            );
            
            toast({
              title: 'Upload Successful',
              description: `${parsedReviews.length} reviews loaded. Now classifying with AI...`,
            });
            onClassificationChange(true);

            // Now, classify the reviews
            const classified = await classifyReviews(parsedReviews);
            onUpload(classified);
            
            toast({
              title: 'Classification Complete',
              description: 'AI analysis has been applied to all reviews.',
            });

          } catch (e) {
            let errorMessage = 'An unexpected error occurred during processing.';
            if (e instanceof z.ZodError) {
              console.error(e.errors);
              errorMessage = e.errors.map(err => `Row validation failed: ${err.path.join('.')} - ${err.message}`).slice(0, 2).join('; ');
              setError(`Data validation failed. ${errorMessage}`);
            } else if (e instanceof Error) {
                errorMessage = e.message;
            }
            console.error(e);
            toast({
              variant: 'destructive',
              title: 'Processing Error',
              description: errorMessage,
            });
            setFileName(null);
          } finally {
            setIsLoading(false);
            onClassificationChange(false);
          }
        },
        error: (err: Error) => {
          setIsLoading(false);
          setError(err.message);
          setFileName(null);
          toast({
            variant: 'destructive',
            title: 'Parsing Error',
            description: err.message,
          });
        },
      });
    },
    [onUpload, toast, onClassificationChange]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'text/csv': ['.csv'] },
    disabled: isLoading || isClassifying,
    noClick: true, // we are using a custom button to open the dialog
  });
  
  const getIcon = () => {
      if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
      if (isClassifying) return <Wand2 className="h-5 w-5 animate-pulse" />;
      if (error) return <FileX2 className="h-5 w-5 text-destructive" />;
      if (fileName) return <FileCheck2 className="h-5 w-5 text-green-500" />;
      return <Upload className="h-5 w-5" />;
  }
  
  const getMessage = () => {
    if (isLoading) return 'Parsing file...';
    if (isClassifying) return 'Applying AI classification...';
    if (error) return error;
    if (fileName) return `Loaded: ${fileName}`;
    return 'Drag & drop a CSV file here, or click to select';
  }

  return (
    <div className="flex items-center gap-4">
      <div
        {...getRootProps()}
        className={`flex-grow border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-accent' : 'border-border'}
        ${(isLoading || isClassifying) ? 'cursor-not-allowed opacity-50' : ''}
        `}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
            {getIcon()}
            <span className={error ? 'text-destructive' : ''}>
                {getMessage()}
            </span>
        </div>
      </div>
      <Button onClick={open} disabled={isLoading || isClassifying}>
        {fileName ? 'Upload New' : 'Upload File'}
      </Button>
    </div>
  );
}
