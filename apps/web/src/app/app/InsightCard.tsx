'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';

type InsightEvidence = {
  supportingPosts?: Array<{ title: string; engagement?: number }>;
  avgEngagementComparison?: string;
  suggestedExperiments?: string[];
  severity?: 'high' | 'medium' | 'low';
};

type Insight = {
  id: string;
  text: string;
  type?: string;
  severity?: 'high' | 'medium' | 'low';
  evidence?: InsightEvidence;
  recommendedAction?: string;
  expectedLift?: string;
};

const severityColors = {
  high: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30',
  medium: 'bg-amber-500/15 text-amber-600 border-amber-500/30',
  low: 'bg-slate-500/15 text-slate-600 border-slate-500/30',
};

function MiniSparkline({ values }: { values: number[] }) {
  const safeValues = Array.isArray(values) && values.length > 0 ? values : [1];
  const max = Math.max(...safeValues, 1);
  return (
    <div className="flex items-end gap-0.5 h-8">
      {safeValues.map((v, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(v / max) * 100}%` }}
          transition={{ delay: i * 0.05, duration: 0.3 }}
          className="w-2 rounded-sm bg-primary/60 min-h-[2px]"
        />
      ))}
    </div>
  );
}

export function InsightCard({ insight }: { insight: Insight }) {
  const [expanded, setExpanded] = useState(false);
  const severity = insight.severity ?? insight.evidence?.severity ?? 'medium';
  const evidence = insight.evidence;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={`cursor-pointer transition-all hover:shadow-md hover:border-primary/20 ${
          expanded ? 'ring-2 ring-primary/20' : ''
        }`}
        onClick={() => setExpanded(!expanded)}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium capitalize ${severityColors[severity]}`}
                >
                  {severity} impact
                </span>
                {insight.type && (
                  <span className="text-xs text-muted-foreground capitalize">{insight.type}</span>
                )}
              </div>
              <p className="mt-2 text-sm font-medium">{insight.text}</p>
            </div>
            <div className="flex-shrink-0 text-muted-foreground">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </div>

          <AnimatePresence>
            {expanded && evidence && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {Array.isArray(evidence.supportingPosts) && evidence.supportingPosts.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Supporting posts
                      </p>
                      <ul className="space-y-1.5">
                        {evidence.supportingPosts.map((p, i) => (
                          <li
                            key={i}
                            className="flex items-center justify-between text-sm gap-2 rounded-md bg-muted/50 px-2 py-1.5"
                          >
                            <span className="truncate">{p.title}</span>
                            {p.engagement != null && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                                <TrendingUp className="h-3 w-3" />
                                {p.engagement}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {evidence.avgEngagementComparison && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">
                        Engagement comparison
                      </p>
                      <div className="flex items-center gap-2">
                        <MiniSparkline
                          values={
                            (() => {
                              const v = evidence.supportingPosts?.map((p) => p.engagement ?? 50) ?? [];
                              return v.length > 0 ? v : [60, 80, 90];
                            })()
                          }
                        />
                        <span className="text-sm">{evidence.avgEngagementComparison}</span>
                      </div>
                    </div>
                  )}
                  {Array.isArray(evidence.suggestedExperiments) && evidence.suggestedExperiments.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-2">
                        Suggested experiments
                      </p>
                      <ul className="space-y-1">
                        {evidence.suggestedExperiments.map((s, i) => (
                          <li key={i} className="text-sm text-primary">
                            • {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {insight.recommendedAction && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Recommended action</p>
                      <p className="text-sm font-medium">{insight.recommendedAction}</p>
                    </div>
                  )}
                  {insight.expectedLift && (
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-1">Expected lift</p>
                      <p className="text-sm text-emerald-600">{insight.expectedLift}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
