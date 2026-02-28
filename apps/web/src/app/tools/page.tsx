import Link from 'next/link';

export default function ToolsPage() {
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
        <h1 className="text-3xl font-bold">Tools directory</h1>
        <p className="mt-2 text-muted-foreground">
          Free tools: hook generator, post formatter, previewer, and more.
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold">Hook Generator</h2>
            <p className="mt-1 text-sm text-muted-foreground">Generate 5 hook variants from any idea — question, contrarian, data-led, story, framework.</p>
            <Link href="/app/studio" className="mt-3 inline-block rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">Open in Studio →</Link>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold">Voice Rewriter</h2>
            <p className="mt-1 text-sm text-muted-foreground">Paste any draft. Rewrite it in your captured voice — tone, forbidden phrases, signature moves applied.</p>
            <Link href="/app/studio" className="mt-3 inline-block rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">Open in Studio →</Link>
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-semibold">Engagement Replies</h2>
            <p className="mt-1 text-sm text-muted-foreground">Paste a comment. Get 3 reply suggestions — warm, concise, bold — all matched to your voice.</p>
            <Link href="/app/engagement" className="mt-3 inline-block rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90">Open Engagement →</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
