'use client';

import { useEffect, useState } from 'react';
import { analyzeNarrativePosition } from '@tidepilot/ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';

interface NarrativeMapProps {
  writingSamples: string[];
  draftContents: string[];
}

export function NarrativeMap({ writingSamples, draftContents }: NarrativeMapProps) {
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeNarrativePosition> | null>(null);

  useEffect(() => {
    const result = analyzeNarrativePosition({
      writingSamples,
      drafts: draftContents,
    });
    setAnalysis(result);
  }, [writingSamples, draftContents]);

  if (!analysis) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Loading narrative analysis…
        </CardContent>
      </Card>
    );
  }

  const { data } = analysis;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            You are becoming known for…
          </CardTitle>
          <CardDescription>AI-synthesized positioning summary</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-medium">{data.summary}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Confidence: {Math.round(data.confidence_score * 100)}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Top 5 narrative signals</CardTitle>
          <CardDescription>Core themes with strength scores</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.topNarrativeSignals.map((s, i) => (
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
            <TrendingUp className="h-4 w-4" />
            Emerging authority zones
          </CardTitle>
          <CardDescription>Topics gaining traction</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.emergingAuthorityZones.map((zone, i) => (
              <span
                key={i}
                className="rounded-full bg-primary/20 px-3 py-1 text-sm"
              >
                {zone}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Overused themes
          </CardTitle>
          <CardDescription>Saturation warning — consider diversifying</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.overusedThemes.map((theme, i) => (
              <span
                key={i}
                className="rounded-full bg-amber-500/20 px-3 py-1 text-sm"
              >
                {theme}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Underrepresented angles
          </CardTitle>
          <CardDescription>Opportunities to differentiate</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {data.underrepresentedAngles.map((angle, i) => (
              <span
                key={i}
                className="rounded-md border border-dashed border-muted-foreground/50 px-3 py-1.5 text-sm text-muted-foreground"
              >
                {angle}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
