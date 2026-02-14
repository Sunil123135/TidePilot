'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { refreshStrategicPositioning } from '@/app/actions';
import { TrendingUp, AlertTriangle, Map, Target } from 'lucide-react';

export type PositioningData = {
  topSignals: Array<{ theme: string; strength: number; evidence?: string }>;
  driftDetected: boolean;
  driftSummary?: string;
  authorityRoadmap: Array<{ phase: string; actions: string[]; timeframe: string }>;
  narrativeGaps: Array<{ gap: string; suggestedAngle: string }>;
  contentStrategy30Days: Array<{ week: number; focus: string; postThemes: string[] }>;
  confidence_score: number;
};

type StrategyClientProps = {
  contentHistory: string[];
  initialPositioning: PositioningData | null;
};

export function StrategyClient({ contentHistory, initialPositioning }: StrategyClientProps) {
  const [positioning, setPositioning] = useState<PositioningData | null>(initialPositioning);
  const [loading, setLoading] = useState(false);

  async function handleRefresh() {
    setLoading(true);
    const result = await refreshStrategicPositioning();
    setLoading(false);
    if (result.ok && result.data) {
      setPositioning(result.data);
    }
  }

  if (!positioning) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground mb-4">Loading strategy analysis…</p>
          <Button onClick={handleRefresh} disabled={loading}>
            {loading ? 'Analyzing…' : 'Run Strategy Analysis'}
          </Button>
        </CardContent>
      </Card>
    );
  }

  const { data } = { data: positioning };

  return (
    <div className="space-y-6">
      {data.driftDetected && data.driftSummary && (
        <Card className="border-amber-500/50 bg-amber-500/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
              Positioning drift detected
            </CardTitle>
            <CardDescription>{data.driftSummary}</CardDescription>
          </CardHeader>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Top positioning signals
            </CardTitle>
            <CardDescription>Core themes with strength scores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.topSignals.map((s, i) => (
                <div key={i} className="flex items-center justify-between gap-4">
                  <span className="text-sm font-medium">{s.theme}</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${s.strength * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-8">
                      {Math.round(s.strength * 100)}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="h-4 w-4" />
              Authority roadmap
            </CardTitle>
            <CardDescription>Phased build plan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.authorityRoadmap.map((phase, i) => (
                <div key={i} className="rounded-md border border-border p-3">
                  <p className="font-medium text-sm">{phase.phase}</p>
                  <p className="text-xs text-muted-foreground">{phase.timeframe}</p>
                  <ul className="mt-2 list-inside list-disc text-sm text-muted-foreground">
                    {phase.actions.map((a, j) => (
                      <li key={j}>{a}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Target className="h-4 w-4" />
              Narrative gaps
            </CardTitle>
            <CardDescription>Opportunities to differentiate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {data.narrativeGaps.map((g, i) => (
                <div
                  key={i}
                  className="rounded-md border border-dashed border-muted-foreground/50 px-3 py-2 text-sm"
                >
                  <span className="font-medium">{g.gap}</span>
                  <span className="text-muted-foreground"> — {g.suggestedAngle}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">30-day content strategy</CardTitle>
            <CardDescription>Weekly focus and post themes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {data.contentStrategy30Days.map((week, i) => (
                <div key={i} className="rounded-md border border-border p-3">
                  <p className="font-medium text-sm">Week {week.week}</p>
                  <p className="text-xs text-muted-foreground mt-1">{week.focus}</p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {week.postThemes.map((t, j) => (
                      <span
                        key={j}
                        className="rounded bg-muted px-2 py-0.5 text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Confidence: {Math.round(data.confidence_score * 100)}%
        </p>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
          {loading ? 'Refreshing…' : 'Refresh analysis'}
        </Button>
      </div>
    </div>
  );
}
