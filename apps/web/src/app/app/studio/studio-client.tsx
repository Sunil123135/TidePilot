'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createDraft } from '@/app/actions';
import { useState } from 'react';
import { DraftChannel } from '@prisma/client';

const CHANNEL_LABELS: Record<DraftChannel, string> = {
  GENERIC: 'Generic',
  LINKEDIN: 'LinkedIn',
  VOICE: 'Voice script',
  VIDEO_SCRIPT: 'Video script',
};

const FORMAT_OPTIONS: Record<string, string[]> = {
  GENERIC: ['post'],
  LINKEDIN: ['post', 'article', 'carousel'],
  VOICE: ['voice_script'],
  VIDEO_SCRIPT: ['video'],
};

export function StudioClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [channel, setChannel] = useState<DraftChannel>(DraftChannel.GENERIC);
  const [format, setFormat] = useState('post');

  async function handleNewDraft() {
    setLoading(true);
    const formData = new FormData();
    formData.set('content', '');
    formData.set('channel', channel);
    formData.set('format', format);
    const r = await createDraft(formData);
    setLoading(false);
    if (r.ok) {
      setShowForm(false);
      router.refresh();
    }
  }

  const formats = FORMAT_OPTIONS[channel] ?? ['post'];

  return (
    <div className="flex flex-col gap-2">
      {!showForm ? (
        <Button onClick={() => setShowForm(true)}>New draft</Button>
      ) : (
        <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-3">
          <label className="flex flex-col gap-1 text-sm">
            Channel
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={channel}
              onChange={(e) => {
                const c = e.target.value as DraftChannel;
                setChannel(c);
                setFormat((FORMAT_OPTIONS[c] ?? ['post'])[0]);
              }}
            >
              {(Object.keys(CHANNEL_LABELS) as DraftChannel[]).map((c) => (
                <option key={c} value={c}>{CHANNEL_LABELS[c]}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Format
            <select
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
            >
              {formats.map((f) => (
                <option key={f} value={f}>{f.replace('_', ' ')}</option>
              ))}
            </select>
          </label>
          <Button size="sm" onClick={handleNewDraft} disabled={loading}>
            {loading ? 'Creating…' : 'Create'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>Cancel</Button>
        </div>
      )}
    </div>
  );
}
