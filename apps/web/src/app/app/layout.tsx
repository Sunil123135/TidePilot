import Link from 'next/link';

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed left-0 top-0 z-40 h-screen w-56 border-r border-border bg-card">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/app" className="font-semibold">TidePilot</Link>
        </div>
        <nav className="space-y-1 p-4">
          <Link href="/app" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Home (Brief)
          </Link>
          <Link href="/app/studio" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Studio
          </Link>
          <Link href="/app/calendar" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Calendar
          </Link>
          <Link href="/app/strategy" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Strategy
          </Link>
          <Link href="/app/narrative" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Narrative
          </Link>
          <Link href="/app/benchmark" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Benchmark
          </Link>
          <Link href="/app/ideas" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Ideas
          </Link>
          <Link href="/app/simulator" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Simulator
          </Link>
          <Link href="/app/engagement" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Engagement
          </Link>
          <Link href="/app/analytics" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Analytics
          </Link>
          <Link href="/app/inbox" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Inbox
          </Link>
          <Link href="/app/voice" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Voice Lab
          </Link>
          <Link href="/app/growth" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Growth
          </Link>
          <Link href="/app/knowledge" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Knowledge
          </Link>
          <Link href="/app/goals" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Goals
          </Link>
          <Link href="/app/learn" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Learning Hub
          </Link>
          <Link href="/app/settings" className="block rounded-md px-3 py-2 text-sm hover:bg-accent">
            Settings
          </Link>
        </nav>
      </aside>
      <div className="pl-56">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-border bg-background/95 px-6 backdrop-blur">
          <span className="text-sm text-muted-foreground">Search (⌘K)</span>
          <span className="text-sm text-muted-foreground">Create Draft</span>
          <span className="text-sm text-muted-foreground">Import Writing</span>
        </header>
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
