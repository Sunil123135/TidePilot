import { FeatureGuide } from '@/components/feature-guide';
import { BenchmarkClient } from './BenchmarkClient';
import { getWorkspacePlan } from '@/app/actions/plan';
import { UpgradePrompt } from '@/components/upgrade-prompt';

const BENCHMARK_STEPS = [
  { title: 'Find competitor posts', description: 'Browse LinkedIn and copy the text of 3-10 posts from creators in your niche or industry.' },
  { title: 'Paste posts into the text area', description: 'Each post goes on its own line, or separated by a blank line. The more posts you add, the better the analysis.' },
  { title: 'Click "Analyze"', description: 'The AI reads all posts and identifies hook patterns, topic clusters, and frequency distributions.' },
  { title: 'Review hook patterns', description: 'See which types of hooks (question, data-led, contrarian, story) your competitors use most.' },
  { title: 'Find differentiation gaps', description: 'Topics and angles competitors ignore are your opportunity. Use these gaps to plan content that stands out.' },
];

export default async function BenchmarkPage() {
  const plan = await getWorkspacePlan();
  if (plan === 'FREE') {
    return (
      <UpgradePrompt
        feature="Competitive Benchmark"
        description="Analyze competitor posts to find hook patterns, topic gaps, and differentiation opportunities. Available on Pro and Teams."
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Competitive Benchmark</h1>
        <p className="mt-1 text-muted-foreground">
          Import competitor posts, analyze hook patterns, compare topic coverage, identify gaps.
        </p>
      </div>

      <FeatureGuide
        feature="Competitive Benchmark"
        steps={BENCHMARK_STEPS}
        agentNote="GPT-4 Turbo reads competitor posts and identifies structural patterns — hook types, topic focus, and content gaps you can exploit."
      />

      <BenchmarkClient />
    </div>
  );
}
