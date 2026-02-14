import Link from 'next/link';

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <span className="text-lg font-semibold">TidePilot</span>
          <nav className="flex gap-6">
            <Link href="/learn" className="text-muted-foreground hover:text-foreground">
              Learn
            </Link>
            <Link href="/tools" className="text-muted-foreground hover:text-foreground">
              Tools
            </Link>
            <Link href="/pricing" className="text-muted-foreground hover:text-foreground">
              Pricing
            </Link>
            <Link
              href="/app"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
            >
              Open app
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-16">
        <section className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Your voice, operationalized.
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            A personal brand operating system for professionals. Build your voice model, run your
            engagement cockpit, and act on your weekly Operator Brief.
          </p>
          <Link
            href="/app"
            className="mt-8 inline-block rounded-md bg-primary px-6 py-3 text-primary-foreground hover:opacity-90"
          >
            Generate your first brief
          </Link>
        </section>
      </main>
      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          TidePilot — Capstone demo. No scraping. Import-only integrations.
        </div>
      </footer>
    </div>
  );
}
