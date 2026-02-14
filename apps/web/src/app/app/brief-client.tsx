'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { generateBriefAction } from '@/app/actions';
import { Sparkles } from 'lucide-react';

export function BriefClient({
  generateAction,
}: {
  generateAction: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phase, setPhase] = useState(0);

  async function handleGenerate() {
    setLoading(true);
    setPhase(1);
    const interval = setInterval(() => setPhase((p) => Math.min(p + 1, 3)), 800);
    const r = await generateAction();
    clearInterval(interval);
    setLoading(false);
    if (r.ok) router.refresh();
  }

  return (
    <div className="flex items-center gap-2">
      <Button onClick={handleGenerate} disabled={loading} className="relative overflow-hidden">
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            {phase < 3 ? 'Analyzing…' : 'Almost done…'}
          </span>
        ) : (
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Generate this week&apos;s brief
          </span>
        )}
      </Button>
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="text-sm text-muted-foreground"
          >
            Brief builds section-by-section…
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
