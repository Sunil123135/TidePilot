import Link from 'next/link';

const TOPICS = [
  {
    title: 'Voice Modeling',
    description: 'Capture your unique writing style from samples. Build a voice profile that guides all AI-assisted content.',
    href: '/app/voice',
    cta: 'Go to Voice Lab',
  },
  {
    title: 'Content Strategy',
    description: 'Plan your posts with the Ideas miner, topic gap analysis, and narrative positioning.',
    href: '/app/strategy',
    cta: 'Go to Strategy',
  },
  {
    title: 'Engagement & Replies',
    description: 'Respond to comments in your voice. Prioritize high-value conversations and draft DM openers.',
    href: '/app/engagement',
    cta: 'Go to Engagement',
  },
  {
    title: 'Weekly Operator Brief',
    description: 'Your personalized weekly brief: what worked, what to post next, who to engage with.',
    href: '/app',
    cta: 'View my brief',
  },
];

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold">TidePilot</Link>
          <Link href="/app" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground hover:opacity-90">
            Open app
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold">Learn TidePilot</h1>
        <p className="mt-2 text-muted-foreground">
          Everything you need to build a consistent, authentic personal brand.
        </p>
        <div className="mt-10 grid gap-6 sm:grid-cols-2">
          {TOPICS.map((topic) => (
            <div key={topic.title} className="rounded-lg border border-border bg-card p-6">
              <h2 className="font-semibold">{topic.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{topic.description}</p>
              <Link
                href={topic.href}
                className="mt-4 inline-block rounded-md bg-primary px-4 py-1.5 text-sm text-primary-foreground hover:opacity-90"
              >
                {topic.cta} →
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
