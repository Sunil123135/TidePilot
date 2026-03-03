'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Zap, CreditCard, ExternalLink } from 'lucide-react';
import type { Plan } from '@/app/actions/plan';

interface BillingInfo {
  plan: string | null;
  subscriptionStatus: string | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

interface BillingSectionProps {
  plan: Plan;
  billing: BillingInfo | null;
}

const PLAN_CONFIG = {
  FREE: {
    label: 'Free',
    color: 'bg-slate-100 text-slate-700',
    description: '5 drafts/month · Core features',
  },
  PRO: {
    label: 'Pro',
    color: 'bg-violet-100 text-violet-700',
    description: 'Unlimited drafts · All Pro features',
  },
  TEAMS: {
    label: 'Teams',
    color: 'bg-pink-100 text-pink-700',
    description: 'Up to 5 members · All Teams features',
  },
} as const;

export function BillingSection({ plan, billing }: BillingSectionProps) {
  const [loading, setLoading] = useState(false);
  const config = PLAN_CONFIG[plan];
  const hasSubscription = billing?.stripeSubscriptionId && billing?.subscriptionStatus === 'active';

  async function handleManageBilling() {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/portal', { method: 'POST' });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  async function handleUpgrade(priceId: string) {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } finally {
      setLoading(false);
    }
  }

  const proPriceId = process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID;
  const teamsPriceId = process.env.NEXT_PUBLIC_STRIPE_TEAMS_PRICE_ID;

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      {/* Current plan */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${config.color}`}>
              {config.label}
            </span>
            {hasSubscription && (
              <span className="text-xs text-green-600 font-medium">Active</span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-1">{config.description}</p>
        </div>

        {hasSubscription ? (
          <button
            onClick={handleManageBilling}
            disabled={loading}
            className="flex items-center gap-1.5 text-sm text-violet-600 hover:text-violet-700 font-medium disabled:opacity-50"
          >
            <CreditCard className="w-3.5 h-3.5" />
            {loading ? 'Loading…' : 'Manage billing'}
            <ExternalLink className="w-3 h-3" />
          </button>
        ) : (
          <Link href="/pricing" className="text-sm text-violet-600 hover:text-violet-700 font-medium">
            View plans
          </Link>
        )}
      </div>

      {/* Upgrade CTAs for Free users */}
      {plan === 'FREE' && (
        <div className="border-t border-border pt-4 space-y-2">
          <p className="text-sm text-muted-foreground mb-3">
            Unlock Narrative Engine, Benchmark, Growth Simulator, Strategy Agent, and more.
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            {proPriceId ? (
              <button
                onClick={() => handleUpgrade(proPriceId)}
                disabled={loading}
                className="flex items-center justify-center gap-2 gradient-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                <Zap className="w-3.5 h-3.5" />
                {loading ? 'Loading…' : 'Upgrade to Pro — $19/mo'}
              </button>
            ) : (
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 gradient-brand text-white text-sm font-semibold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity"
              >
                <Zap className="w-3.5 h-3.5" />
                Upgrade to Pro
              </Link>
            )}
            {teamsPriceId ? (
              <button
                onClick={() => handleUpgrade(teamsPriceId)}
                disabled={loading}
                className="flex items-center justify-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
              >
                {loading ? 'Loading…' : 'Upgrade to Teams — $49/mo'}
              </button>
            ) : (
              <Link
                href="/pricing"
                className="flex items-center justify-center gap-2 border border-border text-foreground text-sm font-medium px-4 py-2 rounded-lg hover:bg-accent transition-colors"
              >
                View Teams plan
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pro user: show manage portal link */}
      {plan !== 'FREE' && hasSubscription && (
        <div className="border-t border-border pt-4">
          <p className="text-xs text-muted-foreground">
            Manage your subscription, update payment method, or download invoices from the{' '}
            <button
              onClick={handleManageBilling}
              className="underline hover:text-foreground"
            >
              billing portal
            </button>.
          </p>
        </div>
      )}
    </div>
  );
}
