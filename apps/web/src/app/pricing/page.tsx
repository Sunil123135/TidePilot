'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, Zap, Users, Star } from 'lucide-react';

const PLANS = [
  {
    name: 'Free',
    price: { monthly: 0, annual: 0 },
    description: 'Get started with the essentials.',
    icon: Star,
    color: 'from-slate-500 to-slate-600',
    features: [
      '5 drafts per month',
      'Voice Lab (tone calibration)',
      'Engagement triage',
      'Content calendar',
      'Writing inbox',
      'Weekly brief (basic)',
      'Community support',
    ],
    notIncluded: [
      'Narrative Engine',
      'Benchmark analysis',
      'Growth agent',
      'Strategy agent',
      'LinkedIn sync',
      'Analytics dashboard',
    ],
    cta: 'Get Started Free',
    ctaHref: '/sign-up',
    highlight: false,
  },
  {
    name: 'Pro',
    price: { monthly: 19, annual: 15 },
    description: 'Everything you need to grow your brand.',
    icon: Zap,
    color: 'from-violet-600 to-purple-500',
    features: [
      'Unlimited drafts',
      'Voice Lab (full)',
      'Engagement triage + AI replies',
      'Content calendar',
      'Writing inbox + OCR',
      'Weekly brief (AI-powered)',
      'Narrative Engine',
      'Benchmark analysis',
      'Growth agent',
      'Strategy agent',
      'LinkedIn sync',
      'Analytics dashboard',
      'Priority support',
    ],
    notIncluded: [],
    cta: 'Start Pro',
    ctaHref: '/sign-up?plan=pro',
    highlight: true,
  },
  {
    name: 'Teams',
    price: { monthly: 49, annual: 39 },
    description: 'Collaborate and scale across your team.',
    icon: Users,
    color: 'from-pink-500 to-rose-500',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Shared voice profiles',
      'Team analytics',
      'Advanced benchmark reports',
      'Dedicated onboarding',
      'Priority Slack support',
    ],
    notIncluded: [],
    cta: 'Start Teams',
    ctaHref: '/sign-up?plan=teams',
    highlight: false,
  },
];

export default function PricingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-slate-900">TidePilot</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/sign-in" className="text-sm text-slate-600 hover:text-slate-900 transition-colors">Sign in</Link>
            <Link href="/sign-up" className="text-sm bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700 transition-colors">Get started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-16 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-violet-50 text-violet-700 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
          <Zap className="w-3.5 h-3.5" />
          Simple, transparent pricing
        </div>
        <h1 className="text-5xl font-bold text-slate-900 mb-4">
          Invest in your
          <span className="gradient-brand-text"> personal brand</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
          Start free. Upgrade when you're ready to unlock your full potential.
        </p>

        {/* Toggle */}
        <div className="inline-flex items-center gap-3 bg-slate-100 rounded-xl p-1">
          <button
            onClick={() => setAnnual(false)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${!annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${annual ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Annual
            <span className="ml-1.5 text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">Save 20%</span>
          </button>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-6xl mx-auto px-6 pb-24">
        <div className="grid md:grid-cols-3 gap-8 items-start">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            const price = annual ? plan.price.annual : plan.price.monthly;
            return (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-white p-8 flex flex-col ${
                  plan.highlight
                    ? 'border-violet-300 shadow-2xl shadow-violet-100 md:-mt-4'
                    : 'border-slate-200 shadow-lg'
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="gradient-brand text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg whitespace-nowrap">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 mb-1">{plan.name}</h2>
                <p className="text-sm text-slate-500 mb-6">{plan.description}</p>

                <div className="mb-8">
                  <div className="flex items-end gap-1">
                    <span className="text-5xl font-bold text-slate-900">${price}</span>
                    {price > 0 && <span className="text-slate-500 mb-2">/mo</span>}
                  </div>
                  {annual && price > 0 && (
                    <p className="text-xs text-slate-400 mt-1">Billed annually (${price * 12}/yr)</p>
                  )}
                  {price === 0 && <p className="text-sm text-slate-400 mt-1">Free forever</p>}
                </div>

                <Link
                  href={plan.ctaHref}
                  className={`w-full py-3 px-6 rounded-xl text-sm font-semibold text-center transition-all mb-8 ${
                    plan.highlight
                      ? 'gradient-brand text-white hover:opacity-90 shadow-lg shadow-violet-200'
                      : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </Link>

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <div className={`mt-0.5 w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-sm text-slate-700">{feature}</span>
                    </div>
                  ))}
                  {plan.notIncluded.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 opacity-40">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-400 text-[10px] leading-none font-bold">—</span>
                      </div>
                      <span className="text-sm text-slate-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="bg-slate-50 py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              { q: 'Can I switch plans?', a: 'Yes — upgrade or downgrade anytime from Settings → Billing. Billing is prorated.' },
              { q: 'What happens when I hit the 5-draft limit on Free?', a: "You'll be prompted to upgrade. Existing drafts are never deleted." },
              { q: 'Is there a free trial for Pro?', a: 'The Free plan gives you a full taste of TidePilot. Upgrade when you\'re ready.' },
              { q: 'What payment methods do you accept?', a: 'All major credit/debit cards via Stripe. Secure and PCI-compliant.' },
              { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel from Settings → Billing and your plan continues until the end of the current period.' },
              { q: 'Is my data safe?', a: 'Yes — all data is encrypted at rest and in transit. We never share or sell your data.' },
            ].map(({ q, a }) => (
              <div key={q} className="bg-white rounded-xl p-6 border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{q}</h3>
                <p className="text-slate-500 text-sm">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="gradient-brand py-20 px-6 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to build your brand?</h2>
        <p className="text-violet-100 mb-8 max-w-xl mx-auto">
          Join creators who use TidePilot to post consistently, engage authentically, and grow strategically.
        </p>
        <Link
          href="/sign-up"
          className="inline-block bg-white text-violet-700 font-semibold px-8 py-3 rounded-xl hover:bg-violet-50 transition-colors shadow-lg"
        >
          Start for free
        </Link>
      </div>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-10 px-6 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} TidePilot. All rights reserved.</p>
        <div className="mt-3 flex justify-center gap-6">
          <Link href="/" className="hover:text-white transition-colors">Home</Link>
          <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          <Link href="/sign-in" className="hover:text-white transition-colors">Sign In</Link>
        </div>
      </footer>
    </div>
  );
}
