'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getKnowledgeGraph } from '@/app/actions';
import { Network } from 'lucide-react';

type Node = {
  id: string;
  label: string;
  strength: number;
  postCount?: number;
};

type Edge = {
  source: string;
  target: string;
  weight: number;
};

type KnowledgeData = {
  nodes: Node[];
  edges: Edge[];
  strongestCluster?: string;
  confidence_score: number;
};

export default function KnowledgePage() {
  const [data, setData] = useState<KnowledgeData | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadGraph() {
    setLoading(true);
    const result = await getKnowledgeGraph();
    setLoading(false);
    if (result.ok && result.data) {
      setData(result.data as KnowledgeData);
    }
  }

  useEffect(() => {
    loadGraph();
  }, []);

  if (!data) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Knowledge Graph</h1>
          <p className="mt-1 text-muted-foreground">
            Semantic map of your thinking — topic nodes, intellectual territory, expansion zones.
          </p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Button onClick={loadGraph} disabled={loading}>
              {loading ? 'Building graph…' : 'Build knowledge graph'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Knowledge Graph</h1>
        <p className="mt-1 text-muted-foreground">
          Semantic map of your thinking — topic nodes, intellectual territory, expansion zones.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Network className="h-4 w-4" />
                Topic nodes
              </CardTitle>
              <CardDescription>
                {data.strongestCluster && `Strongest cluster: ${data.strongestCluster}`}
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadGraph} disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {data.nodes.map((node) => (
              <div
                key={node.id}
                className="rounded-full px-4 py-2 border-2 border-primary/30 bg-primary/10"
                style={{
                  fontSize: `${0.75 + node.strength * 0.5}rem`,
                  opacity: 0.7 + node.strength * 0.3,
                }}
              >
                <span className="font-medium">{node.label}</span>
                {node.postCount != null && (
                  <span className="ml-2 text-xs text-muted-foreground">({node.postCount})</span>
                )}
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs font-medium text-muted-foreground mb-2">Connections</p>
            <div className="flex flex-wrap gap-2">
              {data.edges.map((e, i) => {
                const src = data.nodes.find((n) => n.id === e.source);
                const tgt = data.nodes.find((n) => n.id === e.target);
                return (
                  <span
                    key={i}
                    className="text-xs rounded bg-muted px-2 py-1"
                  >
                    {src?.label ?? e.source} ↔ {tgt?.label ?? e.target}
                  </span>
                );
              })}
            </div>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Confidence: {Math.round(data.confidence_score * 100)}%
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
