'use client';

import { useState, useMemo } from 'react';
import { simulateGrowthProjection } from '@tidepilot/ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp } from 'lucide-react';

export function GrowthSimulatorClient() {
  const [postsPerWeek, setPostsPerWeek] = useState(3);
  const [engagementFreq, setEngagementFreq] = useState(5);
  const [totalWeeks, setTotalWeeks] = useState(12);

  const projection = useMemo(
    () =>
      simulateGrowthProjection({
        postsPerWeek,
        engagementFrequency: engagementFreq,
        totalWeeks,
      }),
    [postsPerWeek, engagementFreq, totalWeeks]
  );

  const maxEngagement = Math.max(...projection.data.curve.map((p) => p.engagement));
  const maxAuthority = 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Input parameters
          </CardTitle>
          <CardDescription>
            Adjust sliders to simulate different strategies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Posts per week: {postsPerWeek}
              </label>
              <input
                type="range"
                min={1}
                max={7}
                value={postsPerWeek}
                onChange={(e) => setPostsPerWeek(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Engagement actions/week: {engagementFreq}
              </label>
              <input
                type="range"
                min={0}
                max={20}
                value={engagementFreq}
                onChange={(e) => setEngagementFreq(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Simulation period: {totalWeeks} weeks
              </label>
              <input
                type="range"
                min={4}
                max={24}
                value={totalWeeks}
                onChange={(e) => setTotalWeeks(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Projected growth curve</CardTitle>
          <CardDescription>
            If you post {postsPerWeek}x/week for {totalWeeks} weeks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <p className="text-sm font-medium mb-2">Engagement (cumulative)</p>
              <svg viewBox="0 0 400 120" className="w-full h-32" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  points={projection.data.curve
                    .map((p, i) => {
                      const x = (i / projection.data.curve.length) * 400;
                      const y = 110 - (p.engagement / maxEngagement) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Week 0</span>
                <span>Week {totalWeeks}</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Authority score</p>
              <svg viewBox="0 0 400 120" className="w-full h-32" preserveAspectRatio="none">
                <polyline
                  fill="none"
                  stroke="hsl(142 76% 36%)"
                  strokeWidth="2"
                  points={projection.data.curve
                    .map((p, i) => {
                      const x = (i / projection.data.curve.length) * 400;
                      const y = 110 - (p.authority / maxAuthority) * 100;
                      return `${x},${y}`;
                    })
                    .join(' ')}
                />
              </svg>
              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                <span>Week 0</span>
                <span>Week {totalWeeks}</span>
              </div>
            </div>
            <div className="rounded-md bg-muted/50 p-3 text-sm">
              <p className="font-medium">Projected at week {totalWeeks}:</p>
              <p className="text-muted-foreground">
                ~{projection.data.curve[projection.data.curve.length - 1]?.engagement ?? 0} total engagement ·{' '}
                {Math.round((projection.data.curve[projection.data.curve.length - 1]?.authority ?? 0) * 100)}% authority
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
