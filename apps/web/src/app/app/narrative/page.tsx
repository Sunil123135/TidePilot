import { getDrafts, getWritingSamples } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NarrativeMap } from './NarrativeMap';

export default async function NarrativePage() {
  const [drafts, samples] = await Promise.all([
    getDrafts(),
    getWritingSamples(),
  ]);

  const writingSamples = samples.map((s) => s.text);
  const draftContents = drafts.map((d) => d.content);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Narrative Engine</h1>
        <p className="mt-1 text-muted-foreground">
          Long-term positioning intelligence — core themes, emerging authority, saturation signals.
        </p>
      </div>

      <NarrativeMap
        writingSamples={writingSamples}
        draftContents={draftContents}
      />
    </div>
  );
}
