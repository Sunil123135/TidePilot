import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BenchmarkClient } from './BenchmarkClient';

export default function BenchmarkPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Competitive Benchmark</h1>
        <p className="mt-1 text-muted-foreground">
          Import competitor posts, analyze hook patterns, compare topic coverage, identify gaps.
        </p>
      </div>

      <BenchmarkClient />
    </div>
  );
}
