import Link from 'next/link';
import { getDrafts } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StudioClient } from './studio-client';

export default async function StudioPage() {
  const drafts = await getDrafts();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Studio</h1>
          <p className="mt-1 text-muted-foreground">
            Drafts, hook generator, carousel builder, rewrite to voice.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/app/studio/carousel"
            className="rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
          >
            Carousel Builder
          </Link>
          <StudioClient />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <h2 className="mb-2 text-sm font-medium text-muted-foreground">Drafts</h2>
          {drafts.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-sm text-muted-foreground">
                No drafts. Create one to get started.
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-1">
              {drafts.map((d) => (
                <li key={d.id}>
                  <Link
                    href={`/app/studio/${d.id}`}
                    className="block rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-accent"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="line-clamp-1 flex-1">{d.content.slice(0, 50)}…</span>
                      <span className="text-xs text-muted-foreground capitalize">{d.status.toLowerCase()}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:col-span-2">
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Select a draft from the list or create a new one.
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
