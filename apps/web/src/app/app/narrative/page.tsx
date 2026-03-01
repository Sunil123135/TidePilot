import { getDrafts, getWritingSamples } from '@/app/actions';
import { FeatureGuide } from '@/components/feature-guide';
import { analyzeNarrativePosition } from '@tidepilot/ai';
import { NarrativeMap } from './NarrativeMap';

const NARRATIVE_STEPS = [
  { title: 'Add writing samples in Voice Lab first', description: 'The Narrative Engine needs your writing samples to identify patterns. Go to Voice Lab and paste at least 3 samples.' },
  { title: 'Return here to see your positioning', description: 'The AI analyzes your writing samples and drafts to map your narrative landscape.' },
  { title: 'Review your authority zones', description: 'See which themes you\'re becoming known for and which topics are gaining traction.' },
  { title: 'Address overused themes', description: 'Topics flagged as "overused" are showing saturation — consider diversifying your content angles.' },
  { title: 'Explore underrepresented angles', description: 'These are opportunities where your audience is hungry for content but you haven\'t posted yet.' },
];

export default async function NarrativePage() {
  const [drafts, samples] = await Promise.all([
    getDrafts(),
    getWritingSamples(),
  ]);

  const writingSamples = samples.map((s) => s.text);
  const draftContents = drafts.map((d) => d.content);

  const analysis = await analyzeNarrativePosition({
    writingSamples,
    drafts: draftContents,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Narrative Engine</h1>
        <p className="mt-1 text-muted-foreground">
          Long-term positioning intelligence — core themes, emerging authority, saturation signals.
        </p>
      </div>

      <FeatureGuide
        feature="Narrative Engine"
        steps={NARRATIVE_STEPS}
        agentNote="GPT-4 Turbo analyzes all your writing samples and drafts to identify your core themes, emerging authority zones, and underrepresented angles."
      />

      <NarrativeMap analysis={analysis} />
    </div>
  );
}
