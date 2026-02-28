'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DraftEditor, type TextSelection } from './draft-editor';
import { DraftComments } from '@/components/draft-comments';
import { CollaborationPresence } from '@/components/collaboration-presence';
import type { DraftChannel, DraftStatus, DraftComment } from '@prisma/client';

type CommentWithReplies = DraftComment & { replies: DraftComment[] };

interface Props {
  draft: {
    id: string;
    content: string;
    channel: DraftChannel;
    status: DraftStatus;
    meta: Record<string, unknown> | null;
  };
  initialComments: CommentWithReplies[];
}

export function DraftPageClient({ draft, initialComments }: Props) {
  const [selection, setSelection] = useState<TextSelection | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Link href="/app/studio" className="text-sm text-muted-foreground hover:text-foreground">
          ← Studio
        </Link>
        <CollaborationPresence draftId={draft.id} />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
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
              meta={draft.meta}
              onTextSelection={setSelection}
            />
          </CardContent>
        </Card>

        <div className="pt-2">
          <DraftComments
            draftId={draft.id}
            initialComments={initialComments}
            selection={selection}
            onClearSelection={() => setSelection(null)}
          />
        </div>
      </div>
    </div>
  );
}
