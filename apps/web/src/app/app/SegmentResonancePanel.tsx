'use client';

import { Button } from '@/components/ui/button';
import { predictDraftResonance } from '@/app/actions';
import { Users } from 'lucide-react';

type SegmentData = { name: string; score: number; reason?: string };

interface SegmentResonancePanelProps {
  draftId: string;
  segments: SegmentData[] | null;
  onUpdate: () => void;
}

export function SegmentResonancePanel({
  draftId,
  segments,
  onUpdate,
}: SegmentResonancePanelProps) {
  async function handleCheck() {
    const r = await predictDraftResonance(draftId);
    if (r.ok) onUpdate();
  }

  return (
    <div className="rounded-md border border-border bg-muted/50 p-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-muted-foreground flex items-center gap-2">
          <Users className="h-4 w-4" />
          Audience resonance
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCheck}
        >
          {segments ? 'Re-check' : 'Check resonance'}
        </Button>
      </div>
      {segments ? (
        <div className="space-y-2">
          {segments.map((s) => (
            <div key={s.name} className="flex items-center gap-2">
              <span className="w-24 text-xs">{s.name}</span>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.round(s.score * 100)}%` }}
                />
              </div>
              <span className="w-8 text-xs text-muted-foreground">
                {Math.round(s.score * 100)}%
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Predict resonance across Operators, Founders, Students, Recruiters, Peers.
        </p>
      )}
    </div>
  );
}
