'use client';

import { useState, useEffect } from 'react';
import { clusterIdeas } from '@tidepilot/ai';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, Zap } from 'lucide-react';

interface IdeasMiningClientProps {
  initialSources: string[];
}

export function IdeasMiningClient({ initialSources }: IdeasMiningClientProps) {
  const [clusters, setClusters] = useState<ReturnType<typeof clusterIdeas> | null>(null);

  useEffect(() => {
    if (initialSources.length > 0) {
      const result = clusterIdeas({ sources: initialSources });
      setClusters(result);
    } else {
      const result = clusterIdeas({ sources: ['Sample idea from operations', 'Leadership insight'] });
      setClusters(result);
    }
  }, [initialSources]);

  if (!clusters) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Mining ideas…
        </CardContent>
      </Card>
    );
  }

  const maxMomentum = Math.max(...clusters.data.clusters.map((c) => c.momentumScore));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            Idea clusters
          </CardTitle>
          <CardDescription>
            Grouped by theme with momentum and priority scores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {clusters.data.clusters.map((cluster, i) => (
              <div
                key={i}
                className="rounded-lg border border-border p-4"
                style={{
                  backgroundColor: `hsl(var(--primary) / ${0.05 + (cluster.momentumScore / maxMomentum) * 0.15})`,
                }}
              >
                <h3 className="font-medium mb-2">{cluster.theme}</h3>
                <div className="flex gap-2 mb-2">
                  <span className="text-xs rounded bg-muted px-2 py-0.5">
                    Momentum: {Math.round(cluster.momentumScore * 100)}%
                  </span>
                  <span className="text-xs rounded bg-muted px-2 py-0.5">
                    Priority: {Math.round(cluster.priorityScore * 100)}%
                  </span>
                </div>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {cluster.ideas.map((idea, j) => (
                    <li key={j} className="flex items-start gap-1">
                      <Zap className="h-3 w-3 mt-0.5 shrink-0" />
                      {idea}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Idea heatmap</CardTitle>
          <CardDescription>Momentum score by cluster (darker = higher)</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {clusters.data.clusters.map((cluster, i) => (
              <div
                key={i}
                className="flex-1 rounded-md p-3 text-center text-sm"
                style={{
                  backgroundColor: `hsl(var(--primary) / ${0.2 + (cluster.momentumScore / maxMomentum) * 0.6})`,
                }}
              >
                <p className="font-medium">{cluster.theme}</p>
                <p className="text-xs opacity-80">{Math.round(cluster.momentumScore * 100)}%</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
