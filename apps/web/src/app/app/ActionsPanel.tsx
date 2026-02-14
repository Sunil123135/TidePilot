'use client';

import { BriefActionToggle } from './brief-action-toggle';

type Action = {
  id: string;
  text: string;
  done?: boolean;
  impactEstimate?: string;
  timeEstimate?: string;
  order?: number;
};

const impactColors: Record<string, string> = {
  high: 'text-emerald-600',
  medium: 'text-amber-600',
  low: 'text-slate-500',
};

export function ActionsPanel({
  briefId,
  actions,
}: {
  briefId: string;
  actions: Action[];
}) {
  if (!actions?.length) return <p className="text-sm text-muted-foreground">No actions.</p>;

  const sorted = [...actions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  return (
    <ul className="space-y-3">
      {sorted.map((a) => (
        <li
          key={a.id}
          className="flex items-start gap-3 rounded-lg border border-border bg-card p-3 hover:bg-muted/30 transition-colors group"
        >
          <div className="pt-0.5">
            <BriefActionToggle briefId={briefId} actionId={a.id} done={!!a.done} />
          </div>
          <div className="flex-1 min-w-0">
            <span
              className={`text-sm ${a.done ? 'text-muted-foreground line-through' : 'font-medium'}`}
            >
              {a.text}
            </span>
            <div className="flex gap-2 mt-1 flex-wrap">
              {a.impactEstimate && (
                <span
                  className={`text-xs ${impactColors[a.impactEstimate] ?? 'text-muted-foreground'}`}
                >
                  {a.impactEstimate} impact
                </span>
              )}
              {a.timeEstimate && (
                <span className="text-xs text-muted-foreground">~{a.timeEstimate}</span>
              )}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
