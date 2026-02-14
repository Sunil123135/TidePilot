import { getInboxItems } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { InboxClient } from './InboxClient';

export default async function InboxPage() {
  const items = await getInboxItems();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Inbox</h1>
        <p className="mt-1 text-muted-foreground">
          OCR extracts, pasted notes, transcripts. Convert to drafts, samples, or engagement.
        </p>
      </div>

      <InboxClient initialItems={items} />
    </div>
  );
}
