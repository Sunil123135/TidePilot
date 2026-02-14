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
        <ul className="mt-8 space-y-2">
          <li><Link href="/tools/hook-generator" className="text-primary hover:underline">Hook generator</Link></li>
          <li><Link href="/tools/post-formatter" className="text-primary hover:underline">Post formatter</Link></li>
          <li><Link href="/tools/previewer" className="text-primary hover:underline">Post previewer</Link></li>
        </ul>
      </main>
    </div>
  );
}
