'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { createDraftFromSuggestion } from '@/app/actions';
import { useState } from 'react';

export function PostSuggestionsBlock({ suggestions }: { suggestions: string[] }) {
  const router = useRouter();
  const [loadingId, setLoadingId] = useState<string | null>(null);

  async function handleCreateDraft(idea: string) {
    setLoadingId(idea);
    const r = await createDraftFromSuggestion(idea);
    setLoadingId(null);
    if (r.ok && r.draftId) router.push(`/app/studio/${r.draftId}`);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Post suggestions</CardTitle>
        <CardDescription>Create a LinkedIn draft from a suggestion</CardDescription>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2">
          {suggestions.map((s) => (
            <li key={s} className="flex items-center justify-between gap-2 rounded-md border border-border bg-background px-3 py-2 text-sm">
              <span className="line-clamp-1 flex-1 text-muted-foreground">{s}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCreateDraft(s)}
                disabled={loadingId !== null}
              >
                {loadingId === s ? 'Creating…' : 'Create draft'}
              </Button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
