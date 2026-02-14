import { getDrafts, getWritingSamples, getStrategicPositioning } from '@/app/actions';
import { StrategyClient } from './StrategyClient';

export default async function StrategyPage() {
  const [drafts, samples, positioning] = await Promise.all([
    getDrafts(),
    getWritingSamples(),
    getStrategicPositioning(),
  ]);

  const contentHistory = [
    ...samples.map((s) => s.text),
    ...drafts.map((d) => d.content),
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Strategy</h1>
        <p className="mt-1 text-muted-foreground">
          Long-term positioning intelligence — authority roadmap, narrative drift, content gaps.
        </p>
      </div>

      <StrategyClient
        contentHistory={contentHistory}
        initialPositioning={positioning}
      />
    </div>
  );
}
