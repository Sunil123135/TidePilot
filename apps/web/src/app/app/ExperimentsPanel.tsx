'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, FlaskConical, Plus } from 'lucide-react';

type Experiment = {
  id: string;
  title: string;
  description?: string;
  status: string;
  impactEstimate?: string;
  timeEstimate?: string;
  completedAt?: string | null;
};

const MOCK_EXPERIMENTS: Experiment[] = [
  {
    id: '1',
    title: 'Post at 8:30 AM Wednesday',
    description: 'Test if morning posts outperform afternoon.',
    status: 'active',
    impactEstimate: 'high',
    timeEstimate: '15 min',
  },
  {
    id: '2',
    title: 'Use story + metric hook',
    description: 'Combine personal story with data point in opening.',
    status: 'active',
    impactEstimate: 'medium',
    timeEstimate: '20 min',
  },
  {
    id: '3',
    title: 'Engage with 7 operations leaders',
    description: 'Target high-value connections in operations space.',
    status: 'completed',
    impactEstimate: 'high',
    completedAt: new Date().toISOString(),
  },
];

export function ExperimentsPanel() {
  const [experiments, setExperiments] = useState<Experiment[]>(MOCK_EXPERIMENTS);

  function markComplete(id: string) {
    setExperiments((prev) =>
      prev.map((e) =>
        e.id === id ? { ...e, status: 'completed' as const, completedAt: new Date().toISOString() } : e
      )
    );
  }

  const active = experiments.filter((e) => e.status === 'active');
  const completed = experiments.filter((e) => e.status === 'completed');

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base flex items-center gap-2">
            <FlaskConical className="h-4 w-4" />
            Run This Experiment
          </CardTitle>
          <CardDescription>Test hypotheses and compare before/after</CardDescription>
        </div>
        <Button variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {active.length === 0 && completed.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No experiments yet. Add one to test what works for your audience.
          </p>
        ) : (
          <>
            {active.map((exp) => (
              <div
                key={exp.id}
                className="rounded-lg border border-border bg-muted/30 p-3 space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm">{exp.title}</p>
                    {exp.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{exp.description}</p>
                    )}
                    <div className="flex gap-2 mt-2">
                      {exp.impactEstimate && (
                        <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                          {exp.impactEstimate} impact
                        </span>
                      )}
                      {exp.timeEstimate && (
                        <span className="text-xs text-muted-foreground">{exp.timeEstimate}</span>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0"
                    onClick={() => markComplete(exp.id)}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
            {completed.length > 0 && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Completed</p>
                {completed.map((exp) => (
                  <div
                    key={exp.id}
                    className="rounded-lg border border-border bg-muted/20 p-2 text-sm opacity-75"
                  >
                    <span className="line-through">{exp.title}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      Compare before/after
                    </span>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
