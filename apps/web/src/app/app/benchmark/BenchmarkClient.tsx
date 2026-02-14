'use client';

import { useState } from 'react';
import { analyzeCompetitorPatterns } from '@tidepilot/ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, Target } from 'lucide-react';

export function BenchmarkClient() {
  const [posts, setPosts] = useState('');
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeCompetitorPatterns> | null>(null);
  const [loading, setLoading] = useState(false);

  function handleAnalyze() {
    setLoading(true);
    const lines = posts.trim().split('\n').filter(Boolean);
    const result = analyzeCompetitorPatterns({ competitorPosts: lines });
    setAnalysis(result);
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Import competitor posts</CardTitle>
          <CardDescription>
            Paste competitor posts (one per line) to analyze hook patterns and topic coverage.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <textarea
            className="min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            placeholder="Paste competitor posts here, one per line..."
            value={posts}
            onChange={(e) => setPosts(e.target.value)}
          />
          <Button
            className="mt-2"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? 'Analyzing…' : 'Analyze'}
          </Button>
        </CardContent>
      </Card>

      {analysis && (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Hook patterns
              </CardTitle>
              <CardDescription>Frequency distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analysis.data.hookPatterns.map((p, i) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{p.type}</span>
                      <span className="text-muted-foreground">{Math.round(p.frequency * 100)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${p.frequency * 100}%` }}
                      />
                    </div>
                    {p.example && (
                      <p className="mt-0.5 text-xs text-muted-foreground">&quot;{p.example}&quot;</p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Topic coverage</CardTitle>
              <CardDescription>Competitor focus areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {analysis.data.topicCoverage.map((t, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <span>{t.topic}</span>
                    <span className="text-muted-foreground">{t.count} posts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Differentiation gaps
              </CardTitle>
              <CardDescription>Opportunities to stand out</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm">
                {analysis.data.differentiationGaps.map((gap, i) => (
                  <li key={i}>{gap}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
