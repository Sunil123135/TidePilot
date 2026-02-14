'use client';

import { FileText, MessageCircle, TrendingUp, Mic } from 'lucide-react';

type BriefKpisProps = {
  postsThisWeek: number;
  repliesPending: number;
  consistencyScore: number; // 0-100
  voiceMatchAvg: number; // 0-1
};

export function BriefKpis({ postsThisWeek, repliesPending, consistencyScore, voiceMatchAvg }: BriefKpisProps) {
  const kpis = [
    {
      label: 'Posts this week',
      value: postsThisWeek,
      icon: FileText,
      color: 'text-primary',
    },
    {
      label: 'Replies pending',
      value: repliesPending,
      icon: MessageCircle,
      color: repliesPending > 5 ? 'text-amber-600' : 'text-muted-foreground',
    },
    {
      label: 'Consistency score',
      value: `${consistencyScore}%`,
      icon: TrendingUp,
      color: consistencyScore >= 80 ? 'text-emerald-600' : consistencyScore >= 50 ? 'text-amber-600' : 'text-muted-foreground',
    },
    {
      label: 'Voice match avg',
      value: `${Math.round(voiceMatchAvg * 100)}%`,
      icon: Mic,
      color: voiceMatchAvg >= 0.8 ? 'text-emerald-600' : 'text-muted-foreground',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {kpis.map((kpi) => (
        <div
          key={kpi.label}
          className="rounded-lg border border-border bg-card px-4 py-3 flex items-center gap-3"
        >
          <div className={`rounded-md bg-muted/50 p-2 ${kpi.color}`}>
            <kpi.icon className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{kpi.label}</p>
            <p className="text-lg font-semibold">{kpi.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
