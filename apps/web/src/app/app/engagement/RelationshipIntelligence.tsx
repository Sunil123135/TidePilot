'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getReengagementSuggestions } from '@/app/actions';
import { Users, RefreshCw } from 'lucide-react';

type Contact = {
  name: string;
  reason: string;
  suggestedAction: string;
  priorityScore: number;
};

export function RelationshipIntelligence() {
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  async function loadSuggestions() {
    setLoading(true);
    const result = await getReengagementSuggestions();
    setLoading(false);
    if (result.ok && result.data) {
      const data = result.data as { contacts?: Contact[] };
      setContacts(data.contacts ?? []);
    } else {
      setContacts([]);
    }
  }

  useEffect(() => {
    loadSuggestions();
  }, []);

  if (dismissed || !contacts || contacts.length === 0) return null;

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader className="py-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium flex items-center gap-2">
            <Users className="h-4 w-4" />
            Re-engagement suggestions
          </h2>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadSuggestions}
              disabled={loading}
            >
              <RefreshCw className={`h-3.5 w-3 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setDismissed(true)}>
              Dismiss
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {contacts.slice(0, 3).map((c, i) => (
          <div
            key={i}
            className="flex items-start justify-between gap-2 rounded-md border border-border bg-background p-2 text-sm"
          >
            <div>
              <p className="font-medium">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.reason}</p>
              <p className="text-xs text-primary mt-0.5">{c.suggestedAction}</p>
            </div>
            <span className="text-xs text-muted-foreground shrink-0">
              {Math.round(c.priorityScore * 100)}% priority
            </span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
