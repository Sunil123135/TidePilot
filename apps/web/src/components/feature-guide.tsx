'use client';

import { useState } from 'react';
import { ChevronDown, BookOpen } from 'lucide-react';

interface Step {
  title: string;
  description: string;
}

interface FeatureGuideProps {
  feature: string;
  steps: Step[];
  agentNote?: string;
}

export function FeatureGuide({ feature, steps, agentNote }: FeatureGuideProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-6 border rounded-lg bg-muted/30">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-2 p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
        aria-expanded={open}
      >
        <BookOpen className="h-4 w-4 text-muted-foreground shrink-0" />
        <span className="text-sm font-medium">How to use {feature}</span>
        <ChevronDown
          className={`ml-auto h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div className="px-4 pb-4 space-y-3 border-t">
          <div className="pt-3 space-y-3">
            {steps.map((step, i) => (
              <div key={i} className="flex gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/20 text-primary text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div>
                  <p className="text-sm font-medium">{step.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          {agentNote && (
            <p className="text-xs text-muted-foreground border-t pt-3 mt-3">
              AI Agent: {agentNote}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
