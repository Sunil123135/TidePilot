import { getEngagementItems } from '@/app/actions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { EngagementClient } from './engagement-client';
import { RelationshipIntelligence } from './RelationshipIntelligence';

export default async function EngagementPage() {
  const items = await getEngagementItems();
  const pending = items.filter((i) => i.status === 'PENDING');
  const replied = items.filter((i) => i.status === 'REPLIED');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Engagement Cockpit</h1>
        <p className="mt-1 text-muted-foreground">
          Inbound comments, high-value people, suggested replies.
        </p>
      </div>

      <RelationshipIntelligence />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="py-3">
            <h2 className="text-sm font-medium">Inbound ({pending.length})</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {pending.length === 0 ? (
              <p className="text-sm text-muted-foreground">No comments needing reply.</p>
            ) : (
              [...pending]
                .sort((a, b) => (b.relationshipScore ?? 0) - (a.relationshipScore ?? 0))
                .slice(0, 10)
                .map((i) => (
                  <EngagementClient
                    key={i.id}
                    itemId={i.id}
                    author={i.author}
                    comment={i.comment}
                    status={i.status}
                    relationshipScore={i.relationshipScore}
                    replyCount={i.replyCount}
                  />
                ))
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <h2 className="text-sm font-medium">Replied ({replied.length})</h2>
          </CardHeader>
          <CardContent className="space-y-2">
            {replied.slice(0, 10).map((i) => (
              <div key={i.id} className="rounded border border-border p-2 text-sm">
                <span className="font-medium text-muted-foreground">{i.author}</span>
                <p className="line-clamp-2">{i.comment}</p>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="py-3">
            <h2 className="text-sm font-medium">Suggested actions</h2>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Reply to top inbound, then mark as replied. Use suggested replies for voice match.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
