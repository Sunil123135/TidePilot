import Link from 'next/link';
import { Zap, Lock } from 'lucide-react';

interface UpgradePromptProps {
  feature: string;
  description?: string;
  requiredPlan?: 'PRO' | 'TEAMS';
}

export function UpgradePrompt({
  feature,
  description,
  requiredPlan = 'PRO',
}: UpgradePromptProps) {
  const planLabel = requiredPlan === 'TEAMS' ? 'Teams' : 'Pro';
  const planColor = requiredPlan === 'TEAMS' ? 'from-pink-500 to-rose-500' : 'from-violet-600 to-purple-500';

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      {/* Lock icon */}
      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${planColor} flex items-center justify-center mb-6 shadow-lg`}>
        <Lock className="w-8 h-8 text-white" />
      </div>

      {/* Badge */}
      <div className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${planColor} text-white text-xs font-semibold px-3 py-1 rounded-full mb-4`}>
        <Zap className="w-3 h-3" />
        {planLabel} Feature
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-3">{feature}</h2>
      <p className="text-muted-foreground max-w-md mb-8 leading-relaxed">
        {description ?? `Unlock ${feature} and all advanced tools by upgrading to ${planLabel}.`}
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/pricing"
          className={`inline-flex items-center gap-2 gradient-brand text-white font-semibold px-6 py-3 rounded-xl hover:opacity-90 transition-opacity shadow-lg shadow-violet-200`}
        >
          <Zap className="w-4 h-4" />
          Upgrade to {planLabel}
        </Link>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 border border-border text-foreground font-medium px-6 py-3 rounded-xl hover:bg-accent transition-colors"
        >
          View all plans
        </Link>
      </div>

      <p className="mt-6 text-xs text-muted-foreground">
        Plans start at $19/mo · Cancel anytime ·
        <Link href="/app/settings" className="underline hover:text-foreground ml-1">Manage billing</Link>
      </p>
    </div>
  );
}
