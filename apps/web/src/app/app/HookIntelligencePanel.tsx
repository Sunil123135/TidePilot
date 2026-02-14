'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { runHookIntelligence } from '@/app/actions';
import { Sparkles, ChevronDown } from 'lucide-react';

type HookIntelligenceData = {
  overallScore: number;
  emotionalTriggerScore: number;
  curiosityGapScore: number;
  improvementSuggestions: string[];
  confidence_score?: number;
};

export function HookIntelligencePanel({
  draftId,
  content,
  initialData,
}: {
  draftId: string;
  content: string;
  initialData?: Partial<HookIntelligenceData> | null;
}) {
  const [data, setData] = useState<HookIntelligenceData | null>(
    initialData && typeof initialData.overallScore === 'number' ? (initialData as HookIntelligenceData) : null
  );
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(true);

  async function handleAnalyze() {
    if (!content.trim()) return;
    setLoading(true);
    const result = await runHookIntelligence(draftId);
    setLoading(false);
    if (result.ok && result.data) {
      setData(result.data as HookIntelligenceData);
    }
  }

  if (!data) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="text-sm text-muted-foreground mb-2">
          Analyze hook strength, emotional triggers, and curiosity gap.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleAnalyze}
          disabled={loading || !content.trim()}
        >
          {loading ? 'Analyzing…' : (
            <>
              <Sparkles className="h-3.5 w-3 mr-1.5" />
              Run Hook Intelligence
            </>
          )}
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <span className="font-medium text-sm flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          Hook Intelligence
        </span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`}
        />
      </button>
      {expanded && (
        <div className="border-t border-border p-4 space-y-3">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-md bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Overall</p>
              <p className="font-medium">{Math.round(data.overallScore * 100)}%</p>
            </div>
            <div className="rounded-md bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Emotional</p>
              <p className="font-medium">{Math.round(data.emotionalTriggerScore * 100)}%</p>
            </div>
            <div className="rounded-md bg-muted/50 p-2">
              <p className="text-xs text-muted-foreground">Curiosity</p>
              <p className="font-medium">{Math.round(data.curiosityGapScore * 100)}%</p>
            </div>
          </div>
          {data.improvementSuggestions.length > 0 && (
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Improvement suggestions</p>
              <ul className="list-inside list-disc text-sm text-muted-foreground space-y-0.5">
                {data.improvementSuggestions.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleAnalyze} disabled={loading}>
            {loading ? 'Refreshing…' : 'Refresh analysis'}
          </Button>
        </div>
      )}
    </div>
  );
}
