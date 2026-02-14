import { getDrafts, getEngagementItems } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IdeasMiningClient } from './IdeasMiningClient';

export default async function IdeasPage() {
  const [drafts, engagement] = await Promise.all([
    getDrafts(),
    getEngagementItems(),
  ]);

  const sources = [
    ...drafts.map((d) => d.content),
    ...engagement.map((e) => e.comment),
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Idea Mining Engine</h1>
        <p className="mt-1 text-muted-foreground">
          Extract ideas from drafts, engagement, notes. Auto-cluster and prioritize.
        </p>
      </div>

      <IdeasMiningClient initialSources={sources} />
    </div>
  );
}
