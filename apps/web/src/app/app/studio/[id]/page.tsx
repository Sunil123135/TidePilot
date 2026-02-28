import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getDraft } from '@/app/actions';
import { getDraftComments } from '@/app/actions/comments';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { DraftPageClient } from './draft-page-client';

export default async function DraftPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [draft, comments] = await Promise.all([
    getDraft(id),
    getDraftComments(id),
  ]);
  if (!draft) notFound();

  return (
    <DraftPageClient
      draft={{
        id: draft.id,
        content: draft.content,
        channel: draft.channel,
        status: draft.status,
        meta: draft.meta as Record<string, unknown> | null,
      }}
      initialComments={comments}
    />
  );
}
