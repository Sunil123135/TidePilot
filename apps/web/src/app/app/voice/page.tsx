import Link from 'next/link';
import { getWritingSamples, getVoiceProfile, createWritingSample, generateVoiceProfileAction } from '@/app/actions';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VoiceLabForm } from './voice-lab-form';

export default async function VoiceLabPage() {
  const [samples, profile] = await Promise.all([getWritingSamples(), getVoiceProfile()]);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Voice Lab</h1>
          <p className="mt-1 text-muted-foreground">
            Upload or paste writing samples. Generate a voice profile to drive drafts and rewrites.
          </p>
        </div>
        <Link href="/app/voice/audio" className={buttonVariants({ variant: 'outline' })}>
          Create voice persona
        </Link>
      </div>

      <VoiceLabForm generateAction={generateVoiceProfileAction} createSample={createWritingSample} />

      <section>
        <h2 className="mb-2 text-lg font-medium">Samples</h2>
        {samples.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              No samples yet. Paste or upload text above.
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-2">
            {samples.map((s) => (
              <li key={s.id} className="rounded-md border border-border bg-card px-4 py-2 text-sm">
                <span className="font-medium text-muted-foreground">{s.source}</span>
                <p className="mt-1 line-clamp-2">{s.text.slice(0, 200)}…</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {profile && (
        <Card>
          <CardHeader>
            <CardTitle>Voice profile</CardTitle>
            <CardDescription>Tone, forbidden phrases, signature moves</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.toneSliders && typeof profile.toneSliders === 'object' && (
              <div>
                <h3 className="text-sm font-medium">Tone sliders</h3>
                <pre className="mt-1 rounded bg-muted p-2 text-xs">
                  {JSON.stringify(profile.toneSliders, null, 2)}
                </pre>
              </div>
            )}
            {profile.forbiddenPhrases?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium">Forbidden phrases</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {profile.forbiddenPhrases.join(', ')}
                </p>
              </div>
            )}
            {profile.signatureMoves?.length > 0 && (
              <div>
                <h3 className="text-sm font-medium">Signature moves</h3>
                <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
                  {profile.signatureMoves.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}
            {profile.exampleParagraph && (
              <div>
                <h3 className="text-sm font-medium">Example in your voice</h3>
                <p className="mt-1 text-sm italic text-muted-foreground">{profile.exampleParagraph}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
