'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { createVoicePersona } from '@/app/actions';
import { Mic, CheckCircle, Shield, Loader2 } from 'lucide-react';
import { VoiceRecorder } from '@/components/voice-recorder';

const CONSENT_STATEMENT =
  'I confirm this is my voice or I have explicit rights to use it. I understand TidePilot will not support cloning third-party voices.';

const LIVENESS_PHRASE = 'Today is ___, TidePilot voice check';

export default function VoiceAudioPage() {
  const router = useRouter();
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [personaName, setPersonaName] = useState('My Voice');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [creating, setCreating] = useState(false);

  async function handleCreate() {
    if (!consentAccepted || !audioBlob) return;
    setCreating(true);

    // TODO: Upload audioBlob to storage and get URL
    // For now, we'll just create the persona without the audio file
    const r = await createVoicePersona({
      name: personaName.trim() || 'My Voice',
      consentStatement: CONSENT_STATEMENT,
    });

    setCreating(false);
    if (r.ok) {
      router.push('/app/voice');
      router.refresh();
    }
  }

  function handleRecordingComplete(blob: Blob) {
    setAudioBlob(blob);
    console.log('Recording complete:', {
      size: `${(blob.size / 1024).toFixed(2)} KB`,
      type: blob.type,
    });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Voice Personalization</h1>
        <p className="mt-1 text-muted-foreground">
          Create a voice persona from your own recordings. User-owned voice only — no third-party cloning.
        </p>
      </div>

      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Shield className="h-4 w-4 text-emerald-600" />
            Safety & consent
          </CardTitle>
          <CardDescription>
            You must confirm ownership before creating a voice persona.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={consentAccepted}
              onChange={(e) => setConsentAccepted(e.target.checked)}
              className="mt-1 rounded border-input"
            />
            <span className="text-sm">
              {CONSENT_STATEMENT}
            </span>
          </label>
          {!consentAccepted && (
            <p className="text-xs text-amber-600">
              You must accept to continue. We do not support cloning celebrities or third parties.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Mic className="h-4 w-4" />
            Record your voice
          </CardTitle>
          <CardDescription>
            Record 30–90 seconds. Include the liveness phrase: &quot;{LIVENESS_PHRASE}&quot;
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium">Persona name</label>
            <input
              type="text"
              className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="My Voice"
              value={personaName}
              onChange={(e) => setPersonaName(e.target.value)}
            />
          </div>

          <VoiceRecorder
            onRecordingComplete={handleRecordingComplete}
            minDuration={30}
            maxDuration={90}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button
          onClick={handleCreate}
          disabled={!consentAccepted || !audioBlob || creating}
        >
          {creating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <CheckCircle className="h-4 w-4 mr-2" />
          )}
          Create voice persona
        </Button>
      </div>
    </div>
  );
}
