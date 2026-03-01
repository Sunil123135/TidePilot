import Link from 'next/link';
import { getDrafts } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FeatureGuide } from '@/components/feature-guide';
import { StudioClient } from './studio-client';

const STUDIO_STEPS = [
  { title: 'Create a new draft', description: 'Click "New Draft" to open the editor. Write your idea, paste content, or start from a brief suggestion.' },
  { title: 'Write or edit your content', description: 'Use the draft editor to craft your post. Aim for a strong hook in the first line.' },
  { title: 'Rewrite to Voice', description: 'Click "Rewrite to Voice" to have AI rewrite your draft in your exact style using your Voice Lab profile.' },
  { title: 'Check voice score', description: 'See how closely the draft matches your voice profile. Scores above 0.8 are publication-ready.' },
  { title: 'Schedule or publish', description: 'Send to your publishing calendar or post directly to LinkedIn via the Settings connection.' },
];

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

      <FeatureGuide
        feature="Studio"
        steps={STUDIO_STEPS}
        agentNote="GPT-4 Turbo rewrites your content to match your voice profile — preserving your ideas while applying your exact tone, structure, and style."
      />

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
