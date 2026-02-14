'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Target, XCircle, Zap } from 'lucide-react';

type BriefSummaryCardProps = {
  doThis: string;
  avoidThis: string;
  focusOn: string;
};

export function BriefSummaryCard({ doThis, avoidThis, focusOn }: BriefSummaryCardProps) {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
      <CardContent className="p-4">
        <p className="text-sm font-medium text-muted-foreground mb-3">This week</p>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="flex gap-2">
            <Target className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Do</p>
              <p className="text-sm font-medium">{doThis}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <XCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Avoid</p>
              <p className="text-sm font-medium">{avoidThis}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-medium text-muted-foreground">Focus on</p>
              <p className="text-sm font-medium">{focusOn}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
