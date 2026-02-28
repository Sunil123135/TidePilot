'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { createDraft, createDraftFromSuggestion } from '@/app/actions';
import { useState } from 'react';
import { DraftChannel } from '@prisma/client';
import { Sparkles, PenLine, Loader2 } from 'lucide-react';

export function StudioClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'idle' | 'blank' | 'voice'>('idle');
  const [idea, setIdea] = useState('');
  const [channel, setChannel] = useState<DraftChannel>(DraftChannel.LINKEDIN);

  async function handleBlankDraft() {
    setLoading(true);
    const formData = new FormData();
    formData.set('content', '');
    formData.set('channel', channel);
    formData.set('format', 'post');
    const r = await createDraft(formData);
    setLoading(false);
    if (r.ok) { setMode('idle'); router.refresh(); }
  }

  async function handleWriteInVoice() {
    if (!idea.trim()) return;
    setLoading(true);
    const r = await createDraftFromSuggestion(idea.trim());
    setLoading(false);
    if (r.ok && r.draftId) {
      setMode('idle');
      setIdea('');
      router.push(`/app/studio/${r.draftId}?autoRewrite=true`);
    }
  }

  if (mode === 'idle') {
    return (
      <div className="flex gap-2">
        <Button onClick={() => setMode('voice')} className="gap-2">
          <Sparkles className="h-4 w-4" />
          Write in my voice
        </Button>
        <Button variant="outline" onClick={() => setMode('blank')} className="gap-2">
          <PenLine className="h-4 w-4" />
          Blank draft
        </Button>
      </div>
    );
  }

  if (mode === 'voice') {
    return (
      <div className="rounded-lg border border-border bg-card p-4 space-y-3 max-w-2xl">
        <div>
          <p className="text-sm font-medium">What do you want to write about?</p>
          <p className="text-xs text-muted-foreground mt-0.5">Describe your idea — AI will generate a full post in your voice</p>
        </div>
        <textarea
          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          rows={3}
          placeholder="e.g. Why I stopped using slide decks in investor meetings and what I use instead..."
          value={idea}
          onChange={(e) => setIdea(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleWriteInVoice(); }}
          autoFocus
        />
        <div className="flex items-center gap-2">
          <select
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
            value={channel}
            onChange={(e) => setChannel(e.target.value as DraftChannel)}
          >
            <option value="LINKEDIN">LinkedIn post</option>
            <option value="GENERIC">Generic</option>
            <option value="VOICE">Voice script</option>
          </select>
          <Button onClick={handleWriteInVoice} disabled={loading || !idea.trim()} className="gap-2">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            {loading ? 'Generating…' : 'Generate in my voice'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setMode('idle'); setIdea(''); }}>Cancel</Button>
        </div>
        <p className="text-xs text-muted-foreground">Tip: ⌘+Enter to generate · Make sure your Voice Profile is set up first</p>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-border bg-card p-3 max-w-md">
      <label className="flex flex-col gap-1 text-sm">
        Channel
        <select
          className="rounded-md border border-input bg-background px-2 py-1.5 text-sm"
          value={channel}
          onChange={(e) => setChannel(e.target.value as DraftChannel)}
        >
          <option value="LINKEDIN">LinkedIn</option>
          <option value="GENERIC">Generic</option>
          <option value="VOICE">Voice script</option>
          <option value="VIDEO_SCRIPT">Video script</option>
        </select>
      </label>
      <Button size="sm" onClick={handleBlankDraft} disabled={loading}>
        {loading ? 'Creating…' : 'Create blank'}
      </Button>
      <Button variant="ghost" size="sm" onClick={() => setMode('idle')}>Cancel</Button>
    </div>
  );
}
