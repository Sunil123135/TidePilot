'use client';

import { useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6">
      <Card className="max-w-md">
        <CardContent className="pt-6">
          <h2 className="text-lg font-semibold text-destructive">Something went wrong</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {error.message || 'An unexpected error occurred.'}
          </p>
          <p className="mt-2 text-xs text-muted-foreground font-mono break-all">
            {error.stack}
          </p>
          <Button className="mt-4" onClick={reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
