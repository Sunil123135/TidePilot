'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronDown, Mic, FileText, Linkedin, MessageSquare, Map,
  Zap, LayoutDashboard, Inbox, TrendingUp, Target, CalendarDays,
  HelpCircle, ArrowRight, CheckCircle2,
} from 'lucide-react';

const GETTING_STARTED = [
  { step: 1, title: 'Add writing samples', desc: 'Go to Voice Lab → paste 3–5 of your best LinkedIn posts or written content. The more samples, the better the voice model.', href: '/app/voice' },
  { step: 2, title: 'Generate your Voice Profile', desc: 'Click "Analyze Voice" — AI extracts your tone sliders, forbidden phrases, and signature moves in seconds.', href: '/app/voice' },
  { step: 3, title: 'Connect LinkedIn', desc: 'Go to Settings → Connect LinkedIn. This lets you sync posts, import engagement, and publish directly.', href: '/app/settings' },
  { step: 4, title: 'Create your first draft', desc: 'Go to Studio → Create Draft. Write or paste content, then use "Rewrite to Voice" to match your style.', href: '/app/studio' },
  { step: 5, title: 'Get your Weekly Brief', desc: 'Your AI Operator Brief updates weekly with insights, actions, and post suggestions based on your activity.', href: '/app' },
];

const SECTIONS = [
  {
    icon: Mic,
    title: 'Voice Lab',
    color: 'bg-violet-100 text-violet-700',
    summary: 'Build your AI voice model from your own writing.',
    steps: [
      { title: 'Add writing samples', desc: 'Click "Add Sample" and paste text from any of your previous posts, articles, or emails. Aim for 3–10 samples.' },
      { title: 'Analyze your voice', desc: 'Click "Analyze Voice" to run the AI extraction. It analyzes tone, sentence patterns, word choices, and style.' },
      { title: 'Review your profile', desc: 'See your tone sliders (concise/expansive, warm/authoritative), forbidden phrases to avoid, and signature moves that make your writing distinctive.' },
      { title: 'Update over time', desc: 'As your writing evolves, add new samples and re-analyze. Your voice model improves with more data.' },
    ],
    tips: 'Use posts where you felt most "like yourself." Avoid ghostwritten or heavily edited content.',
  },
  {
    icon: FileText,
    title: 'Draft Studio',
    color: 'bg-blue-100 text-blue-700',
    summary: 'Create, refine, score, and publish LinkedIn content.',
    steps: [
      { title: 'Create a draft', desc: 'Click "Create Draft" from anywhere in the app. Choose channel (LinkedIn, Voice, Video Script) and start writing.' },
      { title: 'Rewrite to your voice', desc: 'Click "Rewrite to Voice" — AI rewrites your content to match your voice profile. Accept, reject, or edit.' },
      { title: 'Check your score', desc: 'The voice match score shows how well the draft aligns with your profile. Aim for 85%+.' },
      { title: 'Schedule or publish', desc: 'Add the draft to your Calendar for a future date, or publish directly to LinkedIn if connected.' },
    ],
    tips: 'Use "Diagnose Post" to get AI feedback on hook strength, clarity, and engagement potential before publishing.',
  },
  {
    icon: Linkedin,
    title: 'LinkedIn Connection',
    color: 'bg-sky-100 text-sky-700',
    summary: 'Connect your account to sync posts and publish directly.',
    steps: [
      { title: 'Go to Settings', desc: 'Navigate to Settings → Integrations section.' },
      { title: 'Click "Connect LinkedIn"', desc: 'You\'ll be redirected to LinkedIn to authorize TidePilot. Grant all requested permissions.' },
      { title: 'Sync your posts', desc: 'After connecting, click "Sync Posts" to import your recent LinkedIn activity. Note: LinkedIn\'s "Share on LinkedIn" product may take 1–2 days to approve for post sync.' },
      { title: 'Publish drafts', desc: 'In the Studio, open any LinkedIn draft and click "Publish to LinkedIn" to post directly from TidePilot.' },
    ],
    tips: 'If sync shows "pending approval," LinkedIn is reviewing your API access. This is normal — you\'ll get an email when approved. In the meantime, paste posts manually via Inbox.',
  },
  {
    icon: MessageSquare,
    title: 'Engagement',
    color: 'bg-green-100 text-green-700',
    summary: 'Triage comments and get AI-generated replies in your voice.',
    steps: [
      { title: 'Import comments', desc: 'Connect LinkedIn and sync posts — comments import automatically. Or paste comment text manually via Inbox → Convert to Engagement.' },
      { title: 'Review priority queue', desc: 'Comments are sorted by relationship score and influence. High-value replies first.' },
      { title: 'Get reply suggestions', desc: 'Click "Suggest Reply" on any comment — AI generates 3 variants (warm, concise, bold) in your voice.' },
      { title: 'Mark as done', desc: 'After replying on LinkedIn, mark the item as Replied to keep your queue clean.' },
    ],
    tips: 'Reply within 24 hours for maximum LinkedIn algorithmic benefit. Use the "bold" variant when you want to spark further discussion.',
  },
  {
    icon: Map,
    title: 'Narrative Analysis',
    color: 'bg-orange-100 text-orange-700',
    summary: 'Understand your positioning and find authority gaps. (Pro feature)',
    steps: [
      { title: 'Add writing samples first', desc: 'Narrative analysis requires a voice profile. Go to Voice Lab and add at least 3 samples.' },
      { title: 'View your narrative map', desc: 'The AI analyzes your writing to identify your dominant themes, authority zones, and positioning signals.' },
      { title: 'Spot the gaps', desc: 'See where you\'re underrepresented vs your intended positioning. These are your content opportunities.' },
      { title: 'Act on insights', desc: 'Use the gap analysis to guide your next 4–8 posts. Fill white space in your authority zone.' },
    ],
    tips: 'Run narrative analysis monthly as your content evolves. Compare before/after a posting sprint.',
  },
  {
    icon: Zap,
    title: 'Benchmark',
    color: 'bg-yellow-100 text-yellow-700',
    summary: 'Analyze competitor posts to find your differentiation edge. (Pro feature)',
    steps: [
      { title: 'Find competitor posts', desc: 'Collect 3–5 recent posts from LinkedIn creators in your niche. Copy the text.' },
      { title: 'Paste and analyze', desc: 'Paste each post into the text area and click "Analyze Patterns."' },
      { title: 'Review pattern analysis', desc: 'See hook types they use, topics they cover, tone patterns, and engagement strategies.' },
      { title: 'Find your edge', desc: 'The AI highlights differentiation gaps — topics and angles they\'re NOT covering that you can own.' },
    ],
    tips: 'Run benchmark quarterly. Choose 3 competitors at your level + 2 aspirational voices you want to learn from.',
  },
  {
    icon: LayoutDashboard,
    title: 'Weekly Brief',
    color: 'bg-purple-100 text-purple-700',
    summary: 'Your AI-generated weekly action plan and performance snapshot.',
    steps: [
      { title: 'Generate a brief', desc: 'Click "Generate Brief" on the dashboard. AI analyzes your recent activity and creates a personalized action plan.' },
      { title: 'Review insights', desc: 'Each insight card shows a pattern in your content performance with supporting evidence.' },
      { title: 'Follow the actions', desc: 'Check off action items as you complete them. They\'re ordered by impact and time required.' },
      { title: 'Use post suggestions', desc: 'The brief includes 3–5 specific post ideas tailored to your voice and current positioning.' },
    ],
    tips: 'Generate your brief every Monday. Use the "Do This / Avoid This" summary as your content guardrails for the week.',
  },
  {
    icon: Inbox,
    title: 'Inbox',
    color: 'bg-slate-100 text-slate-700',
    summary: 'Import writing from any source — paste, PDF, or image.',
    steps: [
      { title: 'Paste text', desc: 'Click "Paste Text" and paste any content — old emails, articles, notes, LinkedIn posts. Give it a title.' },
      { title: 'Import from image/PDF', desc: 'Upload a screenshot or PDF. OCR extracts the text automatically.' },
      { title: 'Convert to a writing sample', desc: 'Click "→ Writing Sample" to add extracted text to your Voice Lab for analysis.' },
      { title: 'Convert to a draft', desc: 'Click "→ Draft" to turn any inbox item into an editable Studio draft.' },
    ],
    tips: 'Use Inbox to import old LinkedIn posts before native sync is available. It\'s the fastest way to build your voice model.',
  },
  {
    icon: Target,
    title: 'Strategy & Growth',
    color: 'bg-rose-100 text-rose-700',
    summary: 'AI-powered strategic positioning and growth simulation. (Pro feature)',
    steps: [
      { title: 'View your strategic position', desc: 'Strategy page shows your content positioning across themes, audience segments, and authority zones.' },
      { title: 'Run growth simulation', desc: 'Growth page lets you simulate what happens if you post X times/week with Y engagement rate.' },
      { title: 'Set goals', desc: 'Goals page tracks your follower, engagement, and content targets over time.' },
      { title: 'Track experiments', desc: 'Create experiments (e.g., "test hook style A vs B") and track outcomes in the Strategy dashboard.' },
    ],
    tips: 'Focus on 1–2 strategic themes per quarter rather than spreading across many topics. Depth beats breadth on LinkedIn.',
  },
  {
    icon: CalendarDays,
    title: 'Content Calendar',
    color: 'bg-teal-100 text-teal-700',
    summary: 'Schedule and visualize your publishing cadence.',
    steps: [
      { title: 'Schedule a draft', desc: 'In Studio, open a draft → click "Schedule" → pick a date and time.' },
      { title: 'View your calendar', desc: 'Calendar page shows all scheduled posts in a weekly/monthly view.' },
      { title: 'Reorder posts', desc: 'Drag and drop to change the publishing order within a day.' },
      { title: 'Publish manually', desc: 'On publishing day, go to the draft in Studio and click "Publish to LinkedIn."' },
    ],
    tips: 'Aim for 3 posts/week: 1 educational, 1 personal story, 1 opinion/contrarian take. This mix maximizes reach and engagement.',
  },
];

const FAQ = [
  {
    q: 'Why aren\'t my LinkedIn posts syncing?',
    a: 'LinkedIn requires approval for their "Share on LinkedIn" API product, which takes 1–2 business days. You\'ll get an email when approved. In the meantime, paste posts manually via the Inbox.',
  },
  {
    q: 'How many writing samples do I need for a good voice model?',
    a: 'Start with 3 samples minimum, but 8–15 samples gives significantly better results. Use your best, most authentic writing — avoid ghostwritten or heavily edited content.',
  },
  {
    q: 'Can multiple users access the same workspace?',
    a: 'Each user gets their own private workspace — your data is fully isolated. Team workspace sharing is coming in the Teams plan.',
  },
  {
    q: 'What\'s the difference between Free and Pro?',
    a: 'Free gives you Voice Lab, Studio (up to 5 drafts), Engagement, Calendar, and Inbox. Pro unlocks Narrative Analysis, Benchmark, Growth Simulator, Strategy AI, unlimited drafts, and LinkedIn analytics.',
  },
  {
    q: 'Is my LinkedIn password stored?',
    a: 'No. TidePilot uses OAuth — LinkedIn grants us a token, we never see or store your password.',
  },
  {
    q: 'How often should I regenerate my voice profile?',
    a: 'Every 2–3 months, or after any significant shift in your writing style or positioning. Add new samples first, then re-analyze.',
  },
  {
    q: 'Can I cancel my subscription anytime?',
    a: 'Yes. Cancel anytime from Settings → Billing. You keep Pro access until the end of your billing period.',
  },
  {
    q: 'How do I publish a post to LinkedIn?',
    a: 'Connect LinkedIn in Settings, create or open a draft in Studio, then click "Publish to LinkedIn." The post goes live immediately.',
  },
];

function AccordionSection({ icon: Icon, title, color, summary, steps, tips }: typeof SECTIONS[0]) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold">{title}</p>
          <p className="text-sm text-muted-foreground">{summary}</p>
        </div>
        <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 space-y-4 border-t border-border">
          <div className="mt-4 space-y-3">
            {steps.map((s, i) => (
              <div key={i} className="flex gap-3">
                <div className="h-6 w-6 rounded-full gradient-brand flex items-center justify-center text-white text-xs font-bold shrink-0 mt-0.5">{i + 1}</div>
                <div>
                  <p className="font-medium text-sm">{s.title}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-violet-50 border border-violet-100 rounded-lg p-3">
            <p className="text-xs font-semibold text-violet-700 mb-1">Pro tip</p>
            <p className="text-xs text-violet-600">{tips}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-5 text-left hover:bg-muted/30 transition-colors"
      >
        <p className="font-medium text-sm">{q}</p>
        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 border-t border-border">
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function HelpPage() {
  return (
    <div className="max-w-3xl space-y-10">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h1 className="text-2xl font-bold">Help & Documentation</h1>
        </div>
        <p className="text-muted-foreground">Everything you need to get the most out of TidePilot.</p>
      </div>

      {/* Getting started */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Getting started — 5 steps</h2>
        <div className="space-y-3">
          {GETTING_STARTED.map(({ step, title, desc, href }) => (
            <div key={step} className="flex gap-4 p-4 bg-card border border-border rounded-xl hover:border-primary/30 transition-colors group">
              <div className="h-8 w-8 rounded-full gradient-brand flex items-center justify-center text-white text-sm font-bold shrink-0">
                {step}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{title}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{desc}</p>
              </div>
              <Link href={href} className="flex items-center text-primary opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Feature guides */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Feature guides</h2>
        <div className="space-y-2">
          {SECTIONS.map((s) => (
            <AccordionSection key={s.title} {...s} />
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-lg font-semibold mb-4">Frequently asked questions</h2>
        <div className="space-y-2">
          {FAQ.map(({ q, a }) => (
            <FaqItem key={q} q={q} a={a} />
          ))}
        </div>
      </section>

      {/* Contact */}
      <section className="bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 rounded-2xl p-6 text-center">
        <CheckCircle2 className="h-8 w-8 text-violet-500 mx-auto mb-3" />
        <h3 className="font-semibold text-lg mb-1">Still need help?</h3>
        <p className="text-muted-foreground text-sm mb-4">
          Can&apos;t find what you&apos;re looking for? Check our settings page to verify your integrations are configured.
        </p>
        <Link
          href="/app/settings"
          className="inline-flex items-center gap-2 gradient-brand text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Go to Settings
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
