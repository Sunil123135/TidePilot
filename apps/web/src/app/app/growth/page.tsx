import { getWorkspacePlan } from '@/app/actions/plan';
import { UpgradePrompt } from '@/components/upgrade-prompt';
import { GrowthClient } from './GrowthClient';

export default async function GrowthPage() {
  const plan = await getWorkspacePlan();
  if (plan === 'FREE') {
    return (
      <UpgradePrompt
        feature="Growth Simulator"
        description="Model your long-term trajectory — authority projection, engagement compounding, and fatigue detection. Available on Pro and Teams."
      />
    );
  }
  return <GrowthClient />;
}
