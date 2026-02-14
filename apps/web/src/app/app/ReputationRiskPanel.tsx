'use client';

import { Button } from '@/components/ui/button';
import { runReputationRiskCheck } from '@/app/actions';
import { ShieldAlert, ShieldCheck } from 'lucide-react';

type RiskItem = { type: string; severity: string; phrase?: string; suggestion?: string };

interface ReputationRiskPanelProps {
  draftId: string;
  riskData: { risks?: RiskItem[]; overallScore?: number } | null;
  onUpdate: () => void;
}

export function ReputationRiskPanel({
  draftId,
  riskData,
  onUpdate,
}: ReputationRiskPanelProps) {
  async function handleCheck() {
    const r = await runReputationRiskCheck(draftId);
    if (r.ok) onUpdate();
  }

  const risks = riskData?.risks ?? [];
  const overallScore = riskData?.overallScore ?? null;
  const hasHighRisk = risks.some((r) => r.severity === 'high');

  return (
    <div className="rounded-md border border-border bg-muted/50 p-3 text-sm">
      <div className="mb-2 flex items-center justify-between">
        <p className="font-medium text-muted-foreground flex items-center gap-2">
          {hasHighRisk ? (
            <ShieldAlert className="h-4 w-4 text-destructive" />
          ) : (
            <ShieldCheck className="h-4 w-4 text-green-600" />
          )}
          Reputation risk
        </p>
        <Button variant="outline" size="sm" onClick={handleCheck}>
          {riskData ? 'Re-scan' : 'Scan before publish'}
        </Button>
      </div>
      {riskData ? (
        <div className="space-y-2">
          {overallScore !== null && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Overall:</span>
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    overallScore < 0.5 ? 'bg-destructive' : overallScore < 0.8 ? 'bg-amber-500' : 'bg-green-600'
                  }`}
                  style={{ width: `${overallScore * 100}%` }}
                />
              </div>
              <span className="text-xs">{Math.round(overallScore * 100)}%</span>
            </div>
          )}
          {risks.length > 0 && (
            <ul className="space-y-1">
              {risks.map((r, i) => (
                <li key={i} className="flex items-start gap-2 text-xs">
                  <span
                    className={`shrink-0 rounded px-1.5 py-0.5 ${
                      r.severity === 'high'
                        ? 'bg-destructive/20 text-destructive'
                        : r.severity === 'medium'
                        ? 'bg-amber-500/20 text-amber-700'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {r.severity}
                  </span>
                  <span>
                    {r.type}
                    {r.phrase && ` (${r.phrase})`}
                    {r.suggestion && (
                      <span className="text-muted-foreground"> — {r.suggestion}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">
          Detect controversial claims, legal risk phrasing, tone escalation before publishing.
        </p>
      )}
    </div>
  );
}
