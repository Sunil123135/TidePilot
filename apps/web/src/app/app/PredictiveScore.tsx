'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { predictPostPerformance } from '@tidepilot/ai';
import { BarChart3, Zap } from 'lucide-react';

type PredictiveScoreProps = {
  content: string;
  onClose?: () => void;
};

export function PredictiveScore({ content, onClose }: PredictiveScoreProps) {
  const [scores, setScores] = useState<{
    predictedEngagement: number;
    hookStrengthScore: number;
    audienceResonance: number;
    confidence_score: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      try {
        const result = predictPostPerformance({ content });
        if (!cancelled && result?.data) {
          setScores({
            predictedEngagement: result.data.predictedEngagement,
            hookStrengthScore: result.data.hookStrengthScore,
            audienceResonance: result.data.audienceResonance,
            confidence_score: result.data.confidence_score,
          });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    run();
    return () => { cancelled = true; };
  }, [content]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="rounded-lg border border-border bg-muted/30 p-4"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          Calculating predictive scores…
        </div>
      </motion.div>
    );
  }

  if (!scores) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-3"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          Predicted performance
        </h3>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Dismiss
          </button>
        )}
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Engagement</p>
          <div className="flex items-baseline gap-1">
            <BarChart3 className="h-3.5 w-3 text-muted-foreground" />
            <span className="font-semibold">{Math.round(scores.predictedEngagement * 100)}%</span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Hook strength</p>
          <span className="font-semibold">{Math.round(scores.hookStrengthScore * 100)}%</span>
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-0.5">Audience resonance</p>
          <span className="font-semibold">{Math.round(scores.audienceResonance * 100)}%</span>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        Confidence: {Math.round(scores.confidence_score * 100)}%
      </p>
    </motion.div>
  );
}
