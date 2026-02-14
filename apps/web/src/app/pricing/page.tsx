import Link from 'next/link';

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto flex h-14 items-center justify-between px-4">
          <Link href="/" className="text-lg font-semibold">TidePilot</Link>
          <nav className="flex gap-6">
            <Link href="/app" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
              Open app
            </Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto max-w-4xl px-4 py-16">
        <h1 className="text-3xl font-bold">Pricing</h1>
        <p className="mt-2 text-muted-foreground">
          Individual plan + team plan. Metered by Operator Actions.
        </p>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Individual</h2>
            <p className="mt-2 text-muted-foreground">N Operator Actions per month. Overages: action packs.</p>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <h2 className="text-xl font-semibold">Team</h2>
            <p className="mt-2 text-muted-foreground">Pooled actions, workspace roles. Contact for custom.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
