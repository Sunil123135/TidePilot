'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { updateEngagementStatus, suggestEngagementReplies } from '@/app/actions';
import { MessageCircle, Star } from 'lucide-react';

type Status = 'PENDING' | 'REPLIED' | 'SKIPPED';

export function EngagementClient({
  itemId,
  author,
  comment,
  status,
  relationshipScore,
  replyCount = 0,
}: {
  itemId: string;
  author: string;
  comment: string;
  status: Status;
  relationshipScore?: number | null;
  replyCount?: number;
}) {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<Array<{ variant: string; text: string; voiceMatchScore?: number }> | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSuggest() {
    setLoading(true);
    const r = await suggestEngagementReplies(itemId);
    setLoading(false);
    if (r.ok && r.data) setSuggestions(r.data.suggestions);
    router.refresh();
  }

  async function handleReplied() {
    await updateEngagementStatus(itemId, 'REPLIED');
    router.refresh();
  }

  async function handleSkipped() {
    await updateEngagementStatus(itemId, 'SKIPPED');
    router.refresh();
  }

  const showDmSuggestion = replyCount >= 3;
  const isHighValue = (relationshipScore ?? 0) >= 0.8;

  return (
    <Card className={isHighValue ? 'border-primary/30' : ''}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs font-medium text-muted-foreground">{author}</p>
          {relationshipScore != null && relationshipScore >= 0.8 && (
            <span className="flex items-center gap-0.5 text-xs text-amber-600">
              <Star className="h-3 w-3 fill-current" />
              High value
            </span>
          )}
        </div>
        <p className="mt-1 text-sm">{comment}</p>
        {showDmSuggestion && (
          <div className="mt-2 rounded-md bg-primary/10 border border-primary/20 p-2 text-xs">
            <p className="font-medium flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3" />
              Consider moving to DM
            </p>
            <p className="text-muted-foreground mt-0.5">
              You&apos;ve replied 3+ times. &quot;This conversation has been great — would love to continue in DMs.&quot;
            </p>
          </div>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={handleSuggest} disabled={loading}>
            {loading ? '…' : 'Suggest replies'}
          </Button>
          <Button size="sm" variant="outline" onClick={handleReplied}>
            Mark replied
          </Button>
          <Button size="sm" variant="ghost" onClick={handleSkipped}>
            Skip
          </Button>
        </div>
        {suggestions && (
          <ul className="mt-3 space-y-2 border-t border-border pt-2 text-sm">
            {suggestions.map((s, i) => (
              <li key={i} className="rounded border border-border bg-muted/30 p-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <span className="font-medium text-muted-foreground capitalize">{s.variant}:</span>
                    <p className="mt-0.5">{s.text}</p>
                  </div>
                  {s.voiceMatchScore !== undefined && (
                    <span className="text-xs text-muted-foreground">
                      {(s.voiceMatchScore * 100).toFixed(0)}% match
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
