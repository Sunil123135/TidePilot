import Link from 'next/link';

export default function LearnPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold">TidePilot</Link>
          <Link href="/app" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
            Open app
          </Link>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold">Learn</h1>
        <p className="mt-2 text-muted-foreground">
          Voice modeling, content strategy, engagement, weekly brief methodology.
        </p>
        <ul className="mt-8 space-y-2">
          <li><Link href="/learn/voice" className="text-primary hover:underline">Voice modeling</Link></li>
          <li><Link href="/learn/content" className="text-primary hover:underline">Content strategy</Link></li>
          <li><Link href="/learn/engagement" className="text-primary hover:underline">Comment responses</Link></li>
          <li><Link href="/learn/brief" className="text-primary hover:underline">Weekly brief methodology</Link></li>
        </ul>
      </main>
    </div>
  );
}
