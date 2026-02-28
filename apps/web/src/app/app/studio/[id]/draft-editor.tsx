'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  rewriteDraftToVoice,
  acceptRewriteToVoice,
  updateDraft,
  updateDraftStatus,
  suggestHashtagsForDraft,
  generateLinkedInFromIdea,
  optimizeDraftForReadingAloud,
  generateVideoScriptForDraft,
  runQualityCheck,
  generateTtsForDraft,
} from '@/app/actions';
import { publishToLinkedIn } from '@/app/actions/linkedin';
import { SegmentResonancePanel } from '../../SegmentResonancePanel';
import { ReputationRiskPanel } from '../../ReputationRiskPanel';
import { DraftChannel, DraftStatus } from '@prisma/client';
import { HookGenerator } from '../../HookGenerator';
import { PredictiveScore } from '../../PredictiveScore';
import { HookIntelligencePanel } from '../../HookIntelligencePanel';
import { Volume2 } from 'lucide-react';

const LINKEDIN_MAX_CHARS = 3000;

type VideoScene = { title: string; text: string; durationSeconds: number };
type VideoScriptData = {
  hook: string;
  scenes: VideoScene[];
  cta: string;
  totalDurationSeconds?: number;
};

function defaultVideoScript(): VideoScriptData {
  return {
    hook: '',
    scenes: [{ title: 'Scene 1', text: '', durationSeconds: 10 }],
    cta: '',
  };
}

function scriptFromMeta(meta: Record<string, unknown> | null): VideoScriptData | null {
  const s = meta?.script as VideoScriptData | undefined;
  if (!s || typeof s.hook !== 'string') return null;
  return {
    hook: s.hook,
    scenes: Array.isArray(s.scenes)
      ? s.scenes.map((sc: unknown) => {
          const x = sc as { title?: string; text?: string; durationSeconds?: number };
          return {
            title: typeof x.title === 'string' ? x.title : 'Scene',
            text: typeof x.text === 'string' ? x.text : '',
            durationSeconds: typeof x.durationSeconds === 'number' ? x.durationSeconds : 10,
          };
        })
      : [{ title: 'Scene 1', text: '', durationSeconds: 10 }],
    cta: typeof s.cta === 'string' ? s.cta : '',
    totalDurationSeconds: typeof s.totalDurationSeconds === 'number' ? s.totalDurationSeconds : undefined,
  };
}

export interface TextSelection {
  start: number;
  end: number;
  text: string;
}

export function DraftEditor({
  draftId,
  initialContent,
  channel,
  status: initialStatus,
  meta: initialMeta,
  onTextSelection,
}: {
  draftId: string;
  initialContent: string;
  channel: DraftChannel;
  status: DraftStatus;
  meta: Record<string, unknown> | null;
  onTextSelection?: (sel: TextSelection | null) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [content, setContent] = useState(initialContent);
  const [status, setStatus] = useState<DraftStatus>(initialStatus);
  const [meta, setMeta] = useState<Record<string, unknown> | null>(initialMeta ?? null);
  const [rewriteLoading, setRewriteLoading] = useState(false);

  // Auto-trigger rewrite when opened from "Write in my voice"
  useEffect(() => {
    if (searchParams.get('autoRewrite') === 'true') {
      handleRewrite();
    }
  }, []);
  const [saveLoading, setSaveLoading] = useState(false);
  const [hashtagLoading, setHashtagLoading] = useState(false);
  const [ideaLoading, setIdeaLoading] = useState(false);
  const [ideaInput, setIdeaInput] = useState('');
  const [optimizeLoading, setOptimizeLoading] = useState(false);
  const [rewriteDiff, setRewriteDiff] = useState<{ original: string; rewritten: string; changes?: string[] } | null>(null);
  const [qualityLoading, setQualityLoading] = useState(false);
  const [showPredictiveScore, setShowPredictiveScore] = useState(true);
  const [listenLoading, setListenLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [publishResult, setPublishResult] = useState<{ ok: boolean; message: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleTextareaMouseUp() {
    const ta = textareaRef.current;
    if (!ta || !onTextSelection) return;
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    if (start === end) {
      onTextSelection(null);
      return;
    }
    const text = content.slice(start, end).trim();
    if (text.length > 0) {
      onTextSelection({ start, end, text });
    } else {
      onTextSelection(null);
    }
  }

  const suggestedHashtags = (meta?.suggestedHashtags as string[] | undefined) ?? [];
  const pauseMarkers = (meta?.pauseMarkers as string[] | undefined) ?? [];
  const emphasis = (meta?.emphasis as string[] | undefined) ?? [];
  const segmentResonance = meta?.segmentResonance as { segments?: Array<{ name: string; score: number; reason?: string }> } | undefined;
  const reputationRisk = meta?.reputationRisk as { risks?: Array<{ type: string; severity: string; phrase?: string; suggestion?: string }>; overallScore?: number } | undefined;
  const hookIntelligence = meta?.hookIntelligence as {
    overallScore?: number;
    emotionalTriggerScore?: number;
    curiosityGapScore?: number;
    improvementSuggestions?: string[];
    confidence_score?: number;
  } | undefined;
  const qualityScores = meta?.qualityScores as {
    hookStrength?: number;
    clarity?: number;
    specificity?: number;
    ctaSoftness?: number;
    isGeneric?: boolean;
    isVague?: boolean;
    suggestions?: string[];
  } | undefined;
  const isLinkedIn = channel === DraftChannel.LINKEDIN;
  const isVoice = channel === DraftChannel.VOICE;
  const isVideo = channel === DraftChannel.VIDEO_SCRIPT;

  const initialVideoScript = useMemo(() => scriptFromMeta(initialMeta ?? null), [initialMeta]);
  const [videoScript, setVideoScript] = useState<VideoScriptData>(
    initialVideoScript ?? defaultVideoScript()
  );
  const [videoGenLoading, setVideoGenLoading] = useState(false);
  const [videoIdeaInput, setVideoIdeaInput] = useState('');
  const [videoFromDraftLoading, setVideoFromDraftLoading] = useState(false);

  async function handleRewrite() {
    setRewriteLoading(true);
    const r = await rewriteDraftToVoice(draftId);
    setRewriteLoading(false);
    if (r.ok && r.data) {
      setRewriteDiff({
        original: r.data.original,
        rewritten: r.data.rewritten,
        changes: r.data.changes,
      });
    }
  }

  async function handleAcceptRewrite() {
    if (!rewriteDiff) return;
    setSaveLoading(true);
    const r = await acceptRewriteToVoice(draftId, rewriteDiff.rewritten, rewriteDiff.changes);
    setSaveLoading(false);
    if (r.ok) {
      setContent(rewriteDiff.rewritten);
      setRewriteDiff(null);
      router.refresh();
    }
  }

  function handleRejectRewrite() {
    setRewriteDiff(null);
  }

  async function handleQualityCheck() {
    setQualityLoading(true);
    const r = await runQualityCheck(draftId);
    setQualityLoading(false);
    if (r.ok && r.data) {
      setMeta((m) => ({
        ...m,
        qualityScores: {
          hookStrength: r.data!.hookStrength,
          clarity: r.data!.clarity,
          specificity: r.data!.specificity,
          ctaSoftness: r.data!.ctaSoftness,
          isGeneric: r.data!.isGeneric,
          isVague: r.data!.isVague,
          suggestions: r.data!.suggestions,
        },
      }));
      router.refresh();
    }
  }

  async function handleListen() {
    if (!content.trim()) return;
    setListenLoading(true);
    const r = await generateTtsForDraft(draftId);
    setListenLoading(false);
    if (r.ok) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance(content);
        u.rate = 0.9;
        window.speechSynthesis.speak(u);
      }
      router.refresh();
    }
  }

  async function handlePublishToLinkedIn() {
    setPublishLoading(true);
    setPublishResult(null);
    const r = await publishToLinkedIn(draftId);
    setPublishLoading(false);
    if (r.ok) {
      setStatus(DraftStatus.PUBLISHED);
      setPublishResult({ ok: true, message: 'Published to LinkedIn!' });
      router.refresh();
    } else {
      setPublishResult({ ok: false, message: r.error ?? 'Publish failed' });
    }
  }

  async function handleSave() {
    setSaveLoading(true);
    const r = await updateDraft(draftId, content, meta ?? undefined, status);
    setSaveLoading(false);
    if (r.ok) router.refresh();
  }

  async function handleStatusChange(newStatus: DraftStatus) {
    setStatus(newStatus);
    await updateDraftStatus(draftId, newStatus);
    router.refresh();
  }

  async function handleSuggestHashtags() {
    setHashtagLoading(true);
    const r = await suggestHashtagsForDraft(draftId);
    setHashtagLoading(false);
    if (r.ok && r.data) {
      setMeta((m) => ({ ...m, suggestedHashtags: r.data!.suggestedHashtags }));
      router.refresh();
    }
  }

  async function handleGenerateFromIdea() {
    if (!ideaInput.trim()) return;
    setIdeaLoading(true);
    const r = await generateLinkedInFromIdea(draftId, ideaInput);
    setIdeaLoading(false);
    if (r.ok && r.data) {
      setContent(r.data.content);
      setMeta((m) => ({
        ...m,
        suggestedHashtags: r.data!.suggestedHashtags,
        hookType: r.data!.hookType,
      }));
      setIdeaInput('');
      router.refresh();
    }
  }

  async function handleOptimizeForReading() {
    setOptimizeLoading(true);
    const r = await optimizeDraftForReadingAloud(draftId);
    setOptimizeLoading(false);
    if (r.ok && r.data) {
      setContent(r.data.content);
      setMeta((m) => ({
        ...m,
        pauseMarkers: r.data!.pauseMarkers,
        emphasis: r.data!.emphasis,
        readingPace: r.data!.readingPace,
      }));
      router.refresh();
    }
  }

  async function handleGenerateVideoFromIdea() {
    setVideoGenLoading(true);
    const r = await generateVideoScriptForDraft(draftId, {
      idea: videoIdeaInput.trim() || undefined,
    });
    setVideoGenLoading(false);
    if (r.ok && r.data) {
      setVideoScript({
        hook: r.data.hook,
        scenes: r.data.scenes,
        cta: r.data.cta,
        totalDurationSeconds: r.data.totalDurationSeconds,
      });
      setContent([r.data.hook, ...r.data.scenes.map((s) => s.text), r.data.cta].join('\n\n'));
      setMeta((m) => ({
        ...m,
        script: {
          hook: r.data!.hook,
          scenes: r.data!.scenes,
          cta: r.data!.cta,
          totalDurationSeconds: r.data!.totalDurationSeconds,
        },
      }));
      setVideoIdeaInput('');
      router.refresh();
    }
  }

  async function handleGenerateVideoFromDraft() {
    setVideoFromDraftLoading(true);
    const r = await generateVideoScriptForDraft(draftId, { fromCurrentContent: true });
    setVideoFromDraftLoading(false);
    if (r.ok && r.data) {
      setVideoScript({
        hook: r.data.hook,
        scenes: r.data.scenes,
        cta: r.data.cta,
        totalDurationSeconds: r.data.totalDurationSeconds,
      });
      setContent([r.data.hook, ...r.data.scenes.map((s) => s.text), r.data.cta].join('\n\n'));
      setMeta((m) => ({
        ...m,
        script: {
          hook: r.data!.hook,
          scenes: r.data!.scenes,
          cta: r.data!.cta,
          totalDurationSeconds: r.data!.totalDurationSeconds,
        },
      }));
      router.refresh();
    }
  }

  async function handleSaveVideo() {
    const total = videoScript.scenes.reduce((s, sc) => s + sc.durationSeconds, 0);
    const scriptMeta = {
      ...videoScript,
      totalDurationSeconds: total,
    };
    const summary = [videoScript.hook, ...videoScript.scenes.map((s) => s.text), videoScript.cta].join('\n\n');
    setSaveLoading(true);
    const r = await updateDraft(draftId, summary, { ...meta, script: scriptMeta } as Record<string, unknown>);
    setSaveLoading(false);
    if (r.ok) {
      setMeta((m) => ({ ...m, script: scriptMeta }));
      setContent(summary);
      router.refresh();
    }
  }

  const saveHandler = isVideo ? handleSaveVideo : handleSave;

  return (
    <div className="space-y-3">
      {isLinkedIn && (
        <p className="text-right text-sm text-muted-foreground" aria-live="polite">
          {content.length}/{LINKEDIN_MAX_CHARS}
        </p>
      )}
      {isVideo ? (
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">Hook</label>
            <textarea
              className="min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={videoScript.hook}
              onChange={(e) => setVideoScript((s) => ({ ...s, hook: e.target.value }))}
              placeholder="Opening line (first 3–5 seconds)"
            />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-medium text-muted-foreground">Scenes</p>
            <ul className="space-y-3">
              {videoScript.scenes.map((scene, i) => (
                <li key={i} className="rounded-md border border-border bg-muted/30 p-3">
                  <div className="mb-2 flex gap-2">
                    <input
                      type="text"
                      className="flex-1 rounded border border-input bg-background px-2 py-1 text-sm"
                      placeholder="Scene title"
                      value={scene.title}
                      onChange={(e) =>
                        setVideoScript((s) => ({
                          ...s,
                          scenes: s.scenes.map((sc, j) =>
                            j === i ? { ...sc, title: e.target.value } : sc
                          ),
                        }))
                      }
                    />
                    <input
                      type="number"
                      min={1}
                      className="w-16 rounded border border-input bg-background px-2 py-1 text-sm"
                      placeholder="Sec"
                      value={scene.durationSeconds}
                      onChange={(e) =>
                        setVideoScript((s) => ({
                          ...s,
                          scenes: s.scenes.map((sc, j) =>
                            j === i ? { ...sc, durationSeconds: Number(e.target.value) || 0 } : sc
                          ),
                        }))
                      }
                    />
                  </div>
                  <textarea
                    className="min-h-[60px] w-full rounded border border-input bg-background px-2 py-1.5 text-sm"
                    placeholder="Scene text"
                    value={scene.text}
                    onChange={(e) =>
                      setVideoScript((s) => ({
                        ...s,
                        scenes: s.scenes.map((sc, j) =>
                          j === i ? { ...sc, text: e.target.value } : sc
                        ),
                      }))
                    }
                  />
                </li>
              ))}
            </ul>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1"
              onClick={() =>
                setVideoScript((s) => ({
                  ...s,
                  scenes: [...s.scenes, { title: `Scene ${s.scenes.length + 1}`, text: '', durationSeconds: 10 }],
                }))
              }
            >
              Add scene
            </Button>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-muted-foreground">CTA</label>
            <textarea
              className="min-h-[50px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={videoScript.cta}
              onChange={(e) => setVideoScript((s) => ({ ...s, cta: e.target.value }))}
              placeholder="Call to action (last 3–5 seconds)"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              className="rounded-md border border-input bg-background px-2 py-1.5 text-sm w-56"
              placeholder="One-line idea for video..."
              value={videoIdeaInput}
              onChange={(e) => setVideoIdeaInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleGenerateVideoFromIdea()}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateVideoFromIdea}
              disabled={videoGenLoading}
            >
              {videoGenLoading ? 'Generating…' : 'Generate from idea'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateVideoFromDraft}
              disabled={videoFromDraftLoading}
            >
              {videoFromDraftLoading ? 'Generating…' : 'From this draft'}
            </Button>
          </div>
          {videoScript.scenes.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Total: {videoScript.scenes.reduce((s, sc) => s + sc.durationSeconds, 0)}s
            </p>
          )}
        </div>
      ) : rewriteDiff ? (
        <div className="space-y-3 rounded-md border border-border bg-card p-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Rewrite preview</h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleRejectRewrite}>
                Reject
              </Button>
              <Button size="sm" onClick={handleAcceptRewrite} disabled={saveLoading}>
                {saveLoading ? 'Accepting…' : 'Accept'}
              </Button>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Original</p>
              <div className="min-h-[200px] rounded border border-border bg-muted/30 p-3 text-sm whitespace-pre-wrap">
                {rewriteDiff.original}
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-muted-foreground">Rewritten</p>
              <div className="min-h-[200px] rounded border border-border bg-background p-3 text-sm whitespace-pre-wrap">
                {rewriteDiff.rewritten}
              </div>
            </div>
          </div>
          {rewriteDiff.changes && rewriteDiff.changes.length > 0 && (
            <div className="rounded bg-muted/50 p-2 text-xs">
              <p className="font-medium text-muted-foreground">Changes:</p>
              <ul className="mt-1 list-inside list-disc space-y-0.5">
                {rewriteDiff.changes.map((c, i) => (
                  <li key={i}>{c}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <>
          {isLinkedIn && (
            <>
              <div className="mb-4">
                <HookGenerator
                  onSelect={(text) => setContent((c) => (c ? `${text}\n\n${c}` : text))}
                />
              </div>
              <div className="mb-4">
                <HookIntelligencePanel
                  draftId={draftId}
                  content={content}
                  initialData={hookIntelligence ?? undefined}
                />
              </div>
            </>
          )}
          {isLinkedIn && content.length > 50 && showPredictiveScore && (
            <div className="mb-4">
              <PredictiveScore
                content={content}
                onClose={() => setShowPredictiveScore(false)}
              />
            </div>
          )}
          <div className="mb-4 space-y-3">
            <SegmentResonancePanel
              draftId={draftId}
              segments={segmentResonance?.segments ?? null}
              onUpdate={() => router.refresh()}
            />
            <ReputationRiskPanel
              draftId={draftId}
              riskData={reputationRisk ?? null}
              onUpdate={() => router.refresh()}
            />
          </div>
          <label htmlFor="draft-editor-content" className="sr-only">
            Draft content
          </label>
          <textarea
            id="draft-editor-content"
            ref={textareaRef}
            className="min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onMouseUp={handleTextareaMouseUp}
            onKeyUp={handleTextareaMouseUp}
            placeholder="Enter or edit your draft... (select text to add a comment)"
            title="Draft content"
          />
        </>
      )}
      {isLinkedIn && suggestedHashtags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 text-sm">
          <span className="text-muted-foreground">Suggested hashtags:</span>
          {suggestedHashtags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted px-2 py-0.5 font-medium text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
      {isVoice && (pauseMarkers.length > 0 || emphasis.length > 0) && (
        <div className="rounded-md border border-border bg-muted/50 p-3 text-sm">
          <p className="mb-1.5 font-medium text-muted-foreground">Reading cues</p>
          {pauseMarkers.length > 0 && (
            <p><span className="text-muted-foreground">Pauses: </span>{pauseMarkers.join(' · ')}</p>
          )}
          {emphasis.length > 0 && (
            <p><span className="text-muted-foreground">Emphasis: </span>{emphasis.join(', ')}</p>
          )}
        </div>
      )}
      {qualityScores && (
        <div className="rounded-md border border-border bg-muted/50 p-3 text-sm">
          <p className="mb-2 font-medium text-muted-foreground">Quality scores</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <span className="text-muted-foreground">Hook: </span>
              <span className="font-medium">{(qualityScores.hookStrength ?? 0) * 100}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Clarity: </span>
              <span className="font-medium">{(qualityScores.clarity ?? 0) * 100}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">Specificity: </span>
              <span className="font-medium">{(qualityScores.specificity ?? 0) * 100}%</span>
            </div>
            <div>
              <span className="text-muted-foreground">CTA softness: </span>
              <span className="font-medium">{(qualityScores.ctaSoftness ?? 0) * 100}%</span>
            </div>
          </div>
          {(qualityScores.isGeneric || qualityScores.isVague) && (
            <div className="mt-2 rounded bg-destructive/10 p-2 text-xs text-destructive">
              {qualityScores.isGeneric && <p>⚠️ Too generic</p>}
              {qualityScores.isVague && <p>⚠️ Too vague</p>}
            </div>
          )}
          {qualityScores.suggestions && qualityScores.suggestions.length > 0 && (
            <ul className="mt-2 list-inside list-disc text-xs text-muted-foreground">
              {qualityScores.suggestions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          )}
        </div>
      )}
      {isLinkedIn && (
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            className="rounded-md border border-input bg-background px-2 py-1.5 text-sm w-64"
            placeholder="One-line idea..."
            value={ideaInput}
            onChange={(e) => setIdeaInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleGenerateFromIdea()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleGenerateFromIdea}
            disabled={ideaLoading || !ideaInput.trim()}
          >
            {ideaLoading ? 'Generating…' : 'Generate from idea'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSuggestHashtags}
            disabled={hashtagLoading}
          >
            {hashtagLoading ? 'Suggesting…' : 'Suggest hashtags'}
          </Button>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <label htmlFor="draft-status-select" className="text-sm text-muted-foreground">Status:</label>
        <select
          id="draft-status-select"
          aria-label="Draft status"
          className="rounded-md border border-input bg-background px-2 py-1 text-xs"
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as DraftStatus)}
        >
          <option value={DraftStatus.IDEA}>Idea</option>
          <option value={DraftStatus.DRAFT}>Draft</option>
          <option value={DraftStatus.READY}>Ready</option>
          <option value={DraftStatus.PUBLISHED}>Published</option>
          <option value={DraftStatus.ARCHIVED}>Archived</option>
        </select>
        {isVoice && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleOptimizeForReading}
            disabled={optimizeLoading}
          >
            {optimizeLoading ? 'Optimizing…' : 'Optimize for reading aloud'}
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleListen} disabled={listenLoading || !content.trim()}>
          {listenLoading ? 'Generating…' : <><Volume2 className="h-3.5 w-3 mr-1" />Listen</>}
        </Button>
        <Button variant="outline" size="sm" onClick={handleQualityCheck} disabled={qualityLoading}>
          {qualityLoading ? 'Checking…' : 'Quality check'}
        </Button>
        <Button variant="outline" size="sm" onClick={handleRewrite} disabled={rewriteLoading || !!rewriteDiff}>
          {rewriteLoading ? 'Rewriting…' : 'Rewrite to voice'}
        </Button>
        <Button size="sm" onClick={saveHandler} disabled={saveLoading}>
          {saveLoading ? 'Saving…' : 'Save'}
        </Button>
        {isLinkedIn && (
          <Button
            size="sm"
            variant="outline"
            onClick={handlePublishToLinkedIn}
            disabled={publishLoading || !content.trim() || status === DraftStatus.PUBLISHED}
            className="border-[#0077b5] text-[#0077b5] hover:bg-[#0077b5] hover:text-white"
          >
            {publishLoading ? 'Publishing…' : status === DraftStatus.PUBLISHED ? 'Published ✓' : 'Publish to LinkedIn'}
          </Button>
        )}
      </div>
      {publishResult && (
        <div className={`rounded-md px-3 py-2 text-sm ${
          publishResult.ok
            ? 'bg-green-50 text-green-700 border border-green-200'
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {publishResult.message}
          {!publishResult.ok && (
            <span className="ml-2 text-xs">
              <a href="/app/settings" className="underline">Go to Settings</a> to connect LinkedIn.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
