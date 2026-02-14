import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDraft } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DraftEditor } from './draft-editor';

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const draft = await getDraft(id);
  if (!draft) notFound();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Link href="/app/studio" className="text-sm text-muted-foreground hover:text-foreground">
          ← Studio
        </Link>
      </div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <span className="text-sm text-muted-foreground">Draft</span>
          <span className="text-xs text-muted-foreground capitalize">{draft.status.toLowerCase()}</span>
        </CardHeader>
        <CardContent>
          <DraftEditor
            draftId={draft.id}
            initialContent={draft.content}
            channel={draft.channel}
            status={draft.status}
            meta={draft.meta as Record<string, unknown> | null}
          />
        </CardContent>
      </Card>
    </div>
  );
}
