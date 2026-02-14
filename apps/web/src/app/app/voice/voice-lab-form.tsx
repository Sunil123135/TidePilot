'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createWritingSample, generateVoiceProfileAction } from '@/app/actions';

export function VoiceLabForm({
  createSample,
  generateAction,
}: {
  createSample: (formData: FormData) => Promise<{ ok: boolean; error?: string }>;
  generateAction: () => Promise<{ ok: boolean; error?: string }>;
}) {
  const router = useRouter();
  const [addError, setAddError] = useState<string | null>(null);
  const [genError, setGenError] = useState<string | null>(null);
  const [genLoading, setGenLoading] = useState(false);

  async function handleAdd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setAddError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('source', 'paste');
    const r = await createSample(formData);
    if (r.ok) {
      form.reset();
      router.refresh();
    } else setAddError(r.error ?? 'Failed');
  }

  async function handleGenerate() {
    setGenError(null);
    setGenLoading(true);
    const r = await generateAction();
    setGenLoading(false);
    if (r.ok) router.refresh();
    else setGenError(r.error ?? 'Failed');
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
        <label className="text-sm font-medium">Add sample</label>
        <textarea
          name="text"
          rows={4}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="Paste or type writing in your voice…"
        />
        <div className="flex items-center gap-2">
          <label htmlFor="voice-source" className="text-xs text-muted-foreground">Source:</label>
          <select
            id="voice-source"
            name="source"
            className="rounded-md border border-input bg-background px-2 py-1 text-xs"
            defaultValue="paste"
            aria-label="Source"
          >
            <option value="paste">Paste</option>
            <option value="linkedin">LinkedIn</option>
            <option value="email">Email</option>
            <option value="notes">Notes</option>
            <option value="import">Import</option>
          </select>
        </div>
        <Button type="submit">Add sample</Button>
        {addError && <p className="text-sm text-destructive">{addError}</p>}
      </form>
      <div>
        <Button onClick={handleGenerate} disabled={genLoading}>
          {genLoading ? 'Generating…' : 'Generate Voice Profile'}
        </Button>
        {genError && <p className="mt-2 text-sm text-destructive">{genError}</p>}
      </div>
    </div>
  );
}
