'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { generateHookVariants } from '@tidepilot/ai';
import { Quote, ChevronDown } from 'lucide-react';

const CATEGORY_LABELS: Record<string, string> = {
  question: 'Question',
  contrarian: 'Contrarian',
  data_led: 'Data-led',
  story_led: 'Story-led',
  framework_led: 'Framework-led',
};

type HookVariant = {
  text: string;
  category: string;
  voiceMatchScore: number;
};

export function HookGenerator({
  onSelect,
  topic,
}: {
  onSelect: (text: string) => void;
  topic?: string;
}) {
  const [variants, setVariants] = useState<HookVariant[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    try {
      const result = generateHookVariants({ topic });
      if (result?.data?.variants) {
        setVariants(result.data.variants);
        setExpandedCategory(result.data.variants[0]?.category ?? null);
      }
    } finally {
      setLoading(false);
    }
  }

  if (!variants) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="text-sm text-muted-foreground mb-2">
          Generate 10 hook variants across 5 categories.
        </p>
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate hook variants'}
        </Button>
      </div>
    );
  }

  const byCategory = variants.reduce((acc, v) => {
    const c = v.category;
    if (!acc[c]) acc[c] = [];
    acc[c].push(v);
    return acc;
  }, {} as Record<string, HookVariant[]>);

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">Click to use as opening</p>
      <div className="space-y-1">
        {Object.entries(byCategory).map(([cat, items]) => (
          <div key={cat} className="rounded-md border border-border overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50 transition-colors"
              onClick={() => setExpandedCategory(expandedCategory === cat ? null : cat)}
            >
              <span className="font-medium">{CATEGORY_LABELS[cat] ?? cat}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform ${expandedCategory === cat ? 'rotate-180' : ''}`}
              />
            </button>
            {expandedCategory === cat && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="border-t border-border"
              >
                {items.map((v, i) => (
                  <button
                    key={i}
                    type="button"
                    className="w-full flex items-start gap-2 px-3 py-2 text-left text-sm hover:bg-primary/5 transition-colors border-b border-border last:border-0"
                    onClick={() => onSelect(v.text)}
                  >
                    <Quote className="h-3.5 w-3 mt-0.5 text-muted-foreground shrink-0" />
                    <span className="flex-1">{v.text}</span>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {Math.round(v.voiceMatchScore * 100)}% match
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
