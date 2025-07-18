'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Review } from '@/types';
import { ReviewSchema } from '@/types';
import { Upload, FileCheck2, FileX2, Loader2 } from 'lucide-react';
import { z } from 'zod';

type ReviewUploaderProps = {
  onUpload: (reviews: Review[]) => void;
};

// Define expected CSV headers
const expectedHeaders = ['id', 'platform', 'author', 'rating', 'text', 'date', 'sentiment', 'theme'];

export function ReviewUploader({ onUpload }: ReviewUploaderProps) {
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
        complete: (results) => {
          setIsLoading(false);
          const headers = results.meta.fields;
          if (!headers || !expectedHeaders.every(h => headers.includes(h))) {
              setError(`CSV headers are incorrect. Expected: ${expectedHeaders.join(', ')}`);
              toast({
                  variant: 'destructive',
                  title: 'Invalid CSV Header',
                  description: `Please ensure the CSV has the correct headers: ${expectedHeaders.join(', ')}`,
              });
              setFileName(null);
              return;
          }

          try {
            // Transform and validate data
            const parsedReviews = z.array(ReviewSchema).parse(
              results.data.map((row: any) => ({
                ...row,
                rating: parseInt(row.rating, 10), // Papa returns strings
              }))
            );
            onUpload(parsedReviews);
            toast({
              title: 'Upload Successful',
              description: `${parsedReviews.length} reviews have been loaded.`,
            });
          } catch (e) {
            if (e instanceof z.ZodError) {
              console.error(e.errors);
              const errorMessage = e.errors.map(err => `Row validation failed: ${err.path.join('.')} - ${err.message}`).slice(0, 2).join('; ');
              setError(`Data validation failed. ${errorMessage}`);
              toast({
                variant: 'destructive',
                title: 'Validation Error',
                description: `The data in the CSV does not match the required format. ${errorMessage}`,
              });
            } else {
              setError('An unexpected error occurred during parsing.');
              toast({
                variant: 'destructive',
                title: 'Parsing Error',
                description: 'Could not process the CSV file.',
              });
            }
            setFileName(null);
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
    [onUpload, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: { 'text/csv': ['.csv'] },
  });
  
  const getIcon = () => {
      if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
      if (error) return <FileX2 className="h-5 w-5 text-destructive" />;
      if (fileName) return <FileCheck2 className="h-5 w-5 text-green-500" />;
      return <Upload className="h-5 w-5" />;
  }

  return (
    <div className="flex items-center gap-4">
      <div
        {...getRootProps()}
        className={`flex-grow border-2 border-dashed rounded-md p-4 text-center cursor-pointer transition-colors
        ${isDragActive ? 'border-primary bg-accent' : 'border-border'}`}
      >
        <input {...getInputProps()} />
        <div className="flex items-center justify-center gap-2 text-muted-foreground">
            {getIcon()}
            <span className={error ? 'text-destructive' : ''}>
                {isLoading ? 'Processing...' : error ? error : fileName ? `Loaded: ${fileName}` : 'Drag & drop a CSV file here, or click to select'}
            </span>
        </div>
      </div>
      <Button onClick={() => getRootProps().onClick?.(null as any)} disabled={isLoading}>
        {fileName ? 'Upload New' : 'Upload File'}
      </Button>
    </div>
  );
}
