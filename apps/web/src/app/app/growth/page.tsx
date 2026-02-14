'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { runGrowthSimulation } from '@/app/actions';
import { TrendingUp, AlertTriangle } from 'lucide-react';

type Projection = {
  month: number;
  authorityScore: number;
  engagement: number;
};

type GrowthData = {
  projections: Projection[];
  fatigueDetected: boolean;
  optimalFrequency: number;
  confidence_score: number;
};

export default function GrowthPage() {
  const [postsPerWeek, setPostsPerWeek] = useState(4);
  const [months, setMonths] = useState(6);
  const [data, setData] = useState<GrowthData | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSimulate() {
    setLoading(true);
    const result = await runGrowthSimulation({ postsPerWeek, months });
    setLoading(false);
    if (result.ok && result.data) {
      setData(result.data as GrowthData);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Growth Simulator</h1>
        <p className="mt-1 text-muted-foreground">
          Model long-term trajectory — authority projection, engagement compounding, fatigue detection.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Simulation parameters</CardTitle>
          <CardDescription>Adjust sliders and run simulation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Posts per week</label>
            <input
              type="range"
              min={1}
              max={10}
              value={postsPerWeek}
              onChange={(e) => setPostsPerWeek(Number(e.target.value))}
              className="w-full mt-1"
            />
            <p className="text-xs text-muted-foreground">{postsPerWeek} posts/week</p>
          </div>
          <div>
            <label className="text-sm font-medium">Projection months</label>
            <input
              type="range"
              min={3}
              max={12}
              value={months}
              onChange={(e) => setMonths(Number(e.target.value))}
              className="w-full mt-1"
            />
            <p className="text-xs text-muted-foreground">{months} months</p>
          </div>
          <Button onClick={handleSimulate} disabled={loading}>
            {loading ? 'Simulating…' : 'Run simulation'}
          </Button>
        </CardContent>
      </Card>

      {data && (
        <>
          {data.fatigueDetected && (
            <Card className="border-amber-500/50 bg-amber-500/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  Fatigue risk detected
                </CardTitle>
                <CardDescription>
                  Posting frequency may be too high. Optimal: {data.optimalFrequency} posts/week.
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Projection chart
              </CardTitle>
              <CardDescription>
                Authority score and engagement over {months} months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-48 flex items-end gap-1">
                  {data.projections.map((p, i) => (
                    <div
                      key={i}
                      className="flex-1 flex flex-col items-center gap-1"
                      title={`Month ${p.month}: ${Math.round(p.authorityScore * 100)}% authority, ${p.engagement} engagement`}
                    >
                      <div
                        className="w-full bg-primary/60 rounded-t min-h-[4px]"
                        style={{ height: `${p.authorityScore * 100}%` }}
                      />
                      <span className="text-[10px] text-muted-foreground">{p.month}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Month 1</span>
                  <span>Month {months}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Confidence: {Math.round(data.confidence_score * 100)}%
                </p>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
