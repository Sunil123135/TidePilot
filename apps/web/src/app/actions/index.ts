'use server';

import { db } from '@tidepilot/db';
import {
  extractVoiceProfile,
  rewriteToVoice,
  suggestReplies,
  generateWeeklyBrief,
  optimizeForReadingAloud,
  generateVideoScript,
  diagnosePost,
} from '@tidepilot/ai';
import { revalidatePath } from 'next/cache';
import { DraftStatus, DraftChannel, EngagementStatus, PublishPlatform, InboxItemType, InboxItemStatus, FileAssetKind, VoicePersonaStatus, VoicePersonaProvider, AudioAssetKind, ConsentType } from '@prisma/client';
import { suggestLinkedInPost, predictSegmentResonance, analyzeReputationRisk } from '@tidepilot/ai';
import { orchestrate } from '@tidepilot/ai/orchestrator';

const MOCK_WORKSPACE_ID = 'demo-workspace-id';

async function getWorkspaceId(): Promise<string | null> {
  try {
    const w = await db.workspace.findFirst();
    return w?.id ?? null;
  } catch {
    return null;
  }
}

export async function createWritingSample(formData: FormData) {
  const text = formData.get('text') as string;
  const source = (formData.get('source') as string) || 'paste';
  if (!text?.trim()) return { ok: false, error: 'Text required' };
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace. Set DATABASE_URL (e.g. Neon/Supabase), then run: pnpm db:push && pnpm db:seed' };
    await db.writingSample.create({
      data: { workspaceId, text: text.trim(), source },
    });
    revalidatePath('/app/voice');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function generateVoiceProfileAction() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace. Set DATABASE_URL (e.g. Neon/Supabase), then run: pnpm db:push && pnpm db:seed' };
    const samples = await db.writingSample.findMany({
      where: { workspaceId },
      take: 20,
      orderBy: { createdAt: 'desc' },
    });
    const texts = samples.map((s) => s.text);
    const result = await extractVoiceProfile(texts);
    await db.voiceProfile.deleteMany({ where: { workspaceId } });
    await db.voiceProfile.create({
      data: {
        workspaceId,
        toneSliders: (result.data.toneSliders as object) ?? undefined,
        forbiddenPhrases: result.data.forbiddenPhrases,
        signatureMoves: result.data.signatureMoves,
        exampleParagraph: result.data.exampleParagraph ?? undefined,
      },
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'VOICE_EXTRACT',
        units: 1,
        metadata: { sampleCount: samples.length },
      },
    });
    revalidatePath('/app/voice');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function getWritingSamples() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return [];
    return db.writingSample.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch {
    return [];
  }
}

export async function getVoiceProfile() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return null;
    return db.voiceProfile.findFirst({ where: { workspaceId } });
  } catch {
    return null;
  }
}

// Studio
export async function getDrafts() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return [];
    return db.draft.findMany({
      where: { workspaceId },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });
  } catch {
    return [];
  }
}

export async function getDraft(id: string) {
  try {
    return db.draft.findUnique({ where: { id } });
  } catch {
    return null;
  }
}

export async function createDraft(formData: FormData) {
  const content = (formData.get('content') as string) || '';
  const channel = (formData.get('channel') as DraftChannel) || DraftChannel.GENERIC;
  const format = formData.get('format') as string | null;
  const meta = format ? { format } : undefined;
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace. Set DATABASE_URL (e.g. Neon/Supabase), then run: pnpm db:push && pnpm db:seed' };
    await db.draft.create({
      data: {
        workspaceId,
        content: content.trim() || 'New draft',
        status: DraftStatus.DRAFT,
        channel,
        meta: meta ?? undefined,
      },
    });
    revalidatePath('/app/studio');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function createDraftFromSuggestion(idea: string) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace. Set DATABASE_URL (e.g. Neon/Supabase), then run: pnpm db:push && pnpm db:seed', draftId: null };
    const draft = await db.draft.create({
      data: {
        workspaceId,
        content: idea.trim() || 'New draft',
        status: DraftStatus.DRAFT,
        channel: DraftChannel.LINKEDIN,
        meta: { format: 'post' },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, draftId: draft.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), draftId: null };
  }
}

export async function updateDraft(
  id: string,
  content: string,
  meta?: Record<string, unknown> | null,
  status?: DraftStatus
) {
  try {
    const draft = await db.draft.findUnique({ where: { id } });
    if (!draft) return { ok: false, error: 'Draft not found' };
    const nextMeta = meta !== undefined ? meta : (draft.meta as Record<string, unknown> | null);
    await db.draft.update({
      where: { id },
      data: {
        content,
        meta: nextMeta != null ? (nextMeta as object) : undefined,
        status: status ?? draft.status,
        updatedAt: new Date(),
      },
    });
    revalidatePath('/app/studio');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function updateDraftStatus(id: string, status: DraftStatus) {
  try {
    await db.draft.update({ where: { id }, data: { status, updatedAt: new Date() } });
    revalidatePath('/app/studio');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function suggestHashtagsForDraft(draftId: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', data: null };
    const workspaceId = draft.workspaceId;
    const result = suggestLinkedInPost({ content: draft.content });
    const existingMeta = (draft.meta as Record<string, unknown>) || {};
    const newMeta = { ...existingMeta, suggestedHashtags: result.data.suggestedHashtags };
    await db.draft.update({
      where: { id: draftId },
      data: { meta: newMeta, updatedAt: new Date() },
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'LINKEDIN_SUGGEST',
        units: 1,
        metadata: { draftId },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: result.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

export async function generateLinkedInFromIdea(draftId: string, idea: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', data: null };
    const workspaceId = draft.workspaceId;
    const result = suggestLinkedInPost({ idea: idea.trim() });
    const existingMeta = (draft.meta as Record<string, unknown>) || {};
    const newMeta = {
      ...existingMeta,
      suggestedHashtags: result.data.suggestedHashtags,
      hookType: result.data.hookType,
    };
    await db.draft.update({
      where: { id: draftId },
      data: {
        content: result.data.content,
        meta: newMeta,
        updatedAt: new Date(),
      },
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'DRAFT_GENERATE',
        units: 1,
        metadata: { draftId, source: 'idea' },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: result.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

export async function rewriteDraftToVoice(draftId: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found' };
    const workspaceId = draft.workspaceId;

    // Get voice profile for this workspace
    const voiceProfile = await db.voiceProfile.findFirst({ where: { workspaceId } });

    const result = await rewriteToVoice({
      content: draft.content,
      voiceProfile: voiceProfile ? {
        toneSliders: voiceProfile.toneSliders as Record<string, number> | undefined,
        forbiddenPhrases: voiceProfile.forbiddenPhrases,
        signatureMoves: voiceProfile.signatureMoves,
        exampleParagraph: voiceProfile.exampleParagraph ?? undefined,
      } : undefined,
    });
    // Don't update draft yet - return diff for user to accept/reject
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'REWRITE_TO_VOICE',
        units: 1,
        metadata: { draftId },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: result.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function acceptRewriteToVoice(draftId: string, rewritten: string, changes?: string[]) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found' };
    await db.draft.update({
      where: { id: draftId },
      data: {
        content: rewritten,
        voiceScore: 0.9,
        meta: { ...(draft.meta as object ?? {}), lastRewrite: changes },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function optimizeDraftForReadingAloud(draftId: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', data: null };
    const workspaceId = draft.workspaceId;
    const result = optimizeForReadingAloud({ content: draft.content });
    const existingMeta = (draft.meta as Record<string, unknown>) || {};
    const newMeta = {
      ...existingMeta,
      pauseMarkers: result.data.pauseMarkers,
      emphasis: result.data.emphasis,
      readingPace: result.data.readingPace,
    };
    await db.draft.update({
      where: { id: draftId },
      data: {
        content: result.data.content,
        meta: newMeta,
        updatedAt: new Date(),
      },
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'OPTIMIZE_READING_ALOUD',
        units: 1,
        metadata: { draftId },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: result.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

export async function generateVideoScriptForDraft(
  draftId: string,
  options: { idea?: string; fromCurrentContent?: boolean }
) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', data: null };
    const workspaceId = draft.workspaceId;
    const result = generateVideoScript({
      idea: options.idea,
      sourceContent: options.fromCurrentContent ? draft.content : undefined,
    });
    const script = result.data;
    const summaryContent = [script.hook, ...script.scenes.map((s) => s.text), script.cta].join('\n\n');
    const existingMeta = (draft.meta as Record<string, unknown>) || {};
    await db.draft.update({
      where: { id: draftId },
      data: {
        content: summaryContent,
        meta: {
          ...existingMeta,
          script: {
            hook: script.hook,
            scenes: script.scenes,
            cta: script.cta,
            totalDurationSeconds: script.totalDurationSeconds,
          },
        },
        updatedAt: new Date(),
      },
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'VIDEO_SCRIPT_GENERATE',
        units: 1,
        metadata: { draftId },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: script };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

// Engagement
export async function getEngagementItems() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return [];
    return db.engagementItem.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch {
    return [];
  }
}

export async function updateEngagementStatus(id: string, status: EngagementStatus) {
  try {
    await db.engagementItem.update({ where: { id }, data: { status } });
    revalidatePath('/app/engagement');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function suggestEngagementReplies(commentId: string) {
  try {
    const item = await db.engagementItem.findUnique({ where: { id: commentId } });
    if (!item) return { ok: false, error: 'Not found' };
    const workspaceId = item.workspaceId;

    // Get voice profile for this workspace
    const voiceProfile = await db.voiceProfile.findFirst({ where: { workspaceId } });

    const result = await suggestReplies({
      comment: item.comment,
      context: item.metadata ? JSON.stringify(item.metadata) : undefined,
      voiceProfile: voiceProfile ? {
        toneSliders: voiceProfile.toneSliders as Record<string, number> | undefined,
        forbiddenPhrases: voiceProfile.forbiddenPhrases,
        signatureMoves: voiceProfile.signatureMoves,
      } : undefined,
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'COMMENT_REPLY_SUGGEST',
        units: 1,
        metadata: { engagementItemId: commentId },
      },
    });
    return { ok: true, data: result.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

// Brief KPIs
export async function getBriefKpis() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return null;
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const [draftsThisWeek, pendingReplies, draftsWithVoice] = await Promise.all([
      db.draft.count({
        where: {
          workspaceId,
          status: { in: ['PUBLISHED', 'READY'] },
          updatedAt: { gte: weekStart, lt: weekEnd },
        },
      }),
      db.engagementItem.count({
        where: { workspaceId, status: 'PENDING' },
      }),
      db.draft.findMany({
        where: { workspaceId, voiceScore: { not: null } },
        select: { voiceScore: true },
        take: 20,
      }),
    ]);

    const voiceMatchAvg = draftsWithVoice.length > 0
      ? draftsWithVoice.reduce((s, d) => s + (d.voiceScore ?? 0), 0) / draftsWithVoice.length
      : 0.75;
    const consistencyScore = Math.min(100, 60 + draftsThisWeek * 10 + (pendingReplies < 5 ? 15 : 0));

    return {
      postsThisWeek: draftsThisWeek,
      repliesPending: pendingReplies,
      consistencyScore,
      voiceMatchAvg,
    };
  } catch {
    return null;
  }
}

// Weekly Brief
export async function getLatestBrief() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return null;
    return db.weeklyBrief.findFirst({
      where: { workspaceId },
      orderBy: { weekStart: 'desc' },
    });
  } catch {
    return null;
  }
}

export async function generateBriefAction() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace. Set DATABASE_URL (e.g. Neon/Supabase), then run: pnpm db:push && pnpm db:seed' };

    // Fetch recent posts and comments for context
    const recentPosts = await db.draft.findMany({
      where: {
        workspaceId,
        status: 'PUBLISHED',
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
      },
      select: {
        content: true,
        createdAt: true,
        meta: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    const recentComments = await db.engagementItem.findMany({
      where: {
        workspaceId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
      select: {
        author: true,
        comment: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const result = await generateWeeklyBrief({
      workspaceId,
      recentPosts: recentPosts.map(p => ({
        title: (p.content?.slice(0, 50) || 'Untitled') + (p.content && p.content.length > 50 ? '...' : ''),
        content: p.content,
        engagement: (p.meta as any)?.engagement || 0,
        publishedAt: p.createdAt,
      })),
      recentComments: recentComments.map(c => ({
        author: c.author,
        text: c.comment,
        engagement: 1,
      })),
    });
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1));
    weekStart.setHours(0, 0, 0, 0);
    const insights = (result.data.insights as Array<Record<string, unknown>>) ?? [];
    const enrichedInsights = insights.map((i, idx) => ({
      ...i,
      recommendedAction: idx === 0 ? 'Try 3 question hook variants this week' : idx === 1 ? 'Post Tuesday or Thursday' : 'Double down on operations content',
      expectedLift: idx === 0 ? '~2x engagement on question hooks' : idx === 1 ? '~1.5x vs other days' : 'Stronger authority signal',
    }));
    await db.weeklyBrief.create({
      data: {
        workspaceId,
        weekStart,
        insights: enrichedInsights as object[],
        actions: result.data.actions as object[],
        postSuggestions: result.data.postSuggestions as string[] | undefined,
        engageWith: result.data.engageWith as object[] | undefined,
        summary: {
          doThis: 'Post one strong thought-leadership piece',
          avoidThis: 'Spreading too thin across topics',
          focusOn: 'Question hooks and operations content',
        } as object,
      },
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'BRIEF_GENERATE',
        units: 1,
        metadata: { weekStart: weekStart.toISOString() },
      },
    });
    revalidatePath('/app');
    revalidatePath('/app/app');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function toggleBriefActionDone(briefId: string, actionId: string) {
  try {
    const brief = await db.weeklyBrief.findUnique({ where: { id: briefId } });
    if (!brief || !brief.actions) return { ok: false };
    const actions = brief.actions as Array<{ id: string; text: string; done?: boolean }>;
    const updated = actions.map((a) =>
      a.id === actionId ? { ...a, done: !a.done } : a
    );
    await db.weeklyBrief.update({
      where: { id: briefId },
      data: { actions: updated as object[] },
    });
    revalidatePath('/app');
    revalidatePath('/app/app');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function runQualityCheck(draftId: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', data: null };
    const workspaceId = draft.workspaceId;
    const result = diagnosePost({ content: draft.content });
    const existingMeta = (draft.meta as Record<string, unknown>) || {};
    const newMeta = {
      ...existingMeta,
      qualityScores: {
        hookStrength: result.data.hookStrength,
        clarity: result.data.clarity,
        specificity: result.data.specificity,
        ctaSoftness: result.data.ctaSoftness,
        isGeneric: result.data.isGeneric,
        isVague: result.data.isVague,
        suggestions: result.data.suggestions,
      },
    };
    await db.draft.update({
      where: { id: draftId },
      data: { meta: newMeta, updatedAt: new Date() },
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'POST_DIAGNOSTIC',
        units: 1,
        metadata: { draftId },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: result.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

// Content Calendar
export async function getScheduledPosts() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return [];
    return db.scheduledPost.findMany({
      where: { workspaceId },
      include: { draft: true },
      orderBy: [{ publishDate: 'asc' }, { slotOrder: 'asc' }],
    });
  } catch {
    return [];
  }
}

export async function scheduleDraft(draftId: string, publishDate: Date, platform: PublishPlatform = PublishPlatform.LINKEDIN) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace' };
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found' };
    await db.scheduledPost.upsert({
      where: { draftId },
      create: {
        workspaceId,
        draftId,
        publishDate: new Date(publishDate),
        platform,
      },
      update: {
        publishDate: new Date(publishDate),
        platform,
        updatedAt: new Date(),
      },
    });
    revalidatePath('/app/calendar');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function unscheduleDraft(draftId: string) {
  try {
    await db.scheduledPost.deleteMany({ where: { draftId } });
    revalidatePath('/app/calendar');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function runReputationRiskCheck(draftId: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', data: null };
    const result = analyzeReputationRisk({ content: draft.content });
    const existingMeta = (draft.meta as Record<string, unknown>) || {};
    await db.draft.update({
      where: { id: draftId },
      data: {
        meta: { ...existingMeta, reputationRisk: result.data },
        updatedAt: new Date(),
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: result.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

export async function predictDraftResonance(draftId: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', data: null };
    const result = predictSegmentResonance({ content: draft.content });
    const existingMeta = (draft.meta as Record<string, unknown>) || {};
    await db.draft.update({
      where: { id: draftId },
      data: {
        meta: { ...existingMeta, segmentResonance: result.data },
        updatedAt: new Date(),
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: result.data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

// Strategy Agent (orchestrator)
export type StrategicPositioningData = {
  topSignals: Array<{ theme: string; strength: number; evidence?: string }>;
  driftDetected: boolean;
  driftSummary?: string;
  authorityRoadmap: Array<{ phase: string; actions: string[]; timeframe: string }>;
  narrativeGaps: Array<{ gap: string; suggestedAngle: string }>;
  contentStrategy30Days: Array<{ week: number; focus: string; postThemes: string[] }>;
  confidence_score: number;
};

export async function getStrategicPositioning(): Promise<StrategicPositioningData | null> {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return null;
    const [samples, drafts] = await Promise.all([
      db.writingSample.findMany({ where: { workspaceId }, take: 20, orderBy: { createdAt: 'desc' } }),
      db.draft.findMany({ where: { workspaceId }, take: 20, orderBy: { updatedAt: 'desc' } }),
    ]);
    const contentHistory = [...samples.map((s) => s.text), ...drafts.map((d) => d.content)];
    const result = await orchestrate('STRATEGIC_POSITIONING_ANALYSIS', { contentHistory }, {
      workspaceId,
      logAgentAction: async (p) => {
        await db.agentLog.create({
          data: {
            workspaceId: p.workspaceId,
            agentName: p.agentName,
            actionType: p.actionType,
            confidenceScore: p.confidenceScore ?? undefined,
            costEstimate: p.costEstimate ?? undefined,
            metadata: p.metadata as object | undefined,
          },
        });
      },
    });
    if (result.ok && result.data) {
      const contract = result.data as { data: StrategicPositioningData };
      return contract.data ?? null;
    }
    return null;
  } catch {
    return null;
  }
}

export async function refreshStrategicPositioning() {
  const data = await getStrategicPositioning();
  revalidatePath('/app/strategy');
  return data ? { ok: true as const, data } : { ok: false as const, error: 'Failed to get positioning' };
}

// Hook Agent (orchestrator)
export async function runHookIntelligence(draftId: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', data: null };
    const workspaceId = draft.workspaceId;
    const result = await orchestrate('HOOK_SCORE', { content: draft.content }, {
      workspaceId,
      logAgentAction: async (p) => {
        await db.agentLog.create({
          data: {
            workspaceId: p.workspaceId,
            agentName: p.agentName,
            actionType: p.actionType,
            confidenceScore: p.confidenceScore ?? undefined,
            costEstimate: p.costEstimate ?? undefined,
            metadata: p.metadata as object | undefined,
          },
        });
      },
    });
    if (!result.ok) return { ok: false, error: result.error, data: null };
    const hookData = (result.data as { data: unknown }).data;
    const existingMeta = (draft.meta as Record<string, unknown>) || {};
    await db.draft.update({
      where: { id: draftId },
      data: { meta: { ...existingMeta, hookIntelligence: hookData } as object, updatedAt: new Date() },
    });
    revalidatePath('/app/studio');
    return { ok: true, data: hookData };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

// Relationship Agent (orchestrator)
export async function getReengagementSuggestions() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, data: null };
    const result = await orchestrate('REENGAGEMENT_SUGGESTION', { workspaceId }, {
      workspaceId,
      logAgentAction: async (p) => {
        await db.agentLog.create({
          data: {
            workspaceId: p.workspaceId,
            agentName: p.agentName,
            actionType: p.actionType,
            confidenceScore: p.confidenceScore ?? undefined,
            costEstimate: p.costEstimate ?? undefined,
            metadata: p.metadata as object | undefined,
          },
        });
      },
    });
    if (!result.ok) return { ok: false, data: null };
    const data = (result.data as { data: unknown }).data;
    return { ok: true, data };
  } catch {
    return { ok: false, data: null };
  }
}

// Growth Agent (orchestrator)
export async function runGrowthSimulation(params: { postsPerWeek?: number; months?: number }) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace', data: null };
    const result = await orchestrate('GROWTH_SIMULATE', params, {
      workspaceId,
      logAgentAction: async (p) => {
        await db.agentLog.create({
          data: {
            workspaceId: p.workspaceId,
            agentName: p.agentName,
            actionType: p.actionType,
            confidenceScore: p.confidenceScore ?? undefined,
            costEstimate: p.costEstimate ?? undefined,
            metadata: p.metadata as object | undefined,
          },
        });
      },
    });
    if (!result.ok) return { ok: false, error: result.error, data: null };
    const data = (result.data as { data: unknown }).data;
    return { ok: true, data };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), data: null };
  }
}

// Knowledge Agent (orchestrator)
export async function getKnowledgeGraph() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, data: null };
    const result = await orchestrate('KNOWLEDGE_GRAPH_BUILD', { workspaceId }, {
      workspaceId,
      logAgentAction: async (p) => {
        await db.agentLog.create({
          data: {
            workspaceId: p.workspaceId,
            agentName: p.agentName,
            actionType: p.actionType,
            confidenceScore: p.confidenceScore ?? undefined,
            costEstimate: p.costEstimate ?? undefined,
            metadata: p.metadata as object | undefined,
          },
        });
      },
    });
    if (!result.ok) return { ok: false, data: null };
    const data = (result.data as { data: unknown }).data;
    return { ok: true, data };
  } catch {
    return { ok: false, data: null };
  }
}

// Inbox / OCR
export async function getInboxItems() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return [];
    return db.inboxItem.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  } catch {
    return [];
  }
}

export async function createInboxItemFromOcr(params: {
  type: InboxItemType;
  title?: string;
  source?: string;
  rawText: string;
  cleanedText?: string;
  confidenceJson?: object;
}) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace', id: null };
    const item = await db.inboxItem.create({
      data: {
        workspaceId,
        type: params.type,
        title: params.title ?? 'OCR extract',
        source: params.source,
        rawText: params.rawText,
        cleanedText: params.cleanedText ?? params.rawText,
        confidenceJson: params.confidenceJson as object | undefined,
        status: InboxItemStatus.PROCESSED,
      },
    });
    revalidatePath('/app/inbox');
    return { ok: true, id: item.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), id: null };
  }
}

export async function convertInboxToDraft(inboxId: string) {
  try {
    const item = await db.inboxItem.findUnique({ where: { id: inboxId } });
    if (!item) return { ok: false, error: 'Not found', draftId: null };
    const workspaceId = item.workspaceId;
    const text = item.cleanedText ?? item.rawText ?? '';
    if (!text.trim()) return { ok: false, error: 'No text to convert', draftId: null };
    const draft = await db.draft.create({
      data: {
        workspaceId,
        content: text,
        status: DraftStatus.DRAFT,
        channel: DraftChannel.LINKEDIN,
        meta: { source: 'inbox', inboxItemId: inboxId },
      },
    });
    await db.inboxItem.update({
      where: { id: inboxId },
      data: { status: InboxItemStatus.ARCHIVED },
    });
    revalidatePath('/app/inbox');
    revalidatePath('/app/studio');
    return { ok: true, draftId: draft.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), draftId: null };
  }
}

export async function convertInboxToSample(inboxId: string) {
  try {
    const item = await db.inboxItem.findUnique({ where: { id: inboxId } });
    if (!item) return { ok: false, error: 'Not found' };
    const text = item.cleanedText ?? item.rawText ?? '';
    if (!text.trim()) return { ok: false, error: 'No text to convert' };
    await db.writingSample.create({
      data: {
        workspaceId: item.workspaceId,
        text,
        source: 'inbox',
      },
    });
    await db.inboxItem.update({
      where: { id: inboxId },
      data: { status: InboxItemStatus.ARCHIVED },
    });
    revalidatePath('/app/inbox');
    revalidatePath('/app/voice');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function convertInboxToEngagement(inboxId: string) {
  try {
    const item = await db.inboxItem.findUnique({ where: { id: inboxId } });
    if (!item) return { ok: false, error: 'Not found' };
    const text = item.cleanedText ?? item.rawText ?? '';
    if (!text.trim()) return { ok: false, error: 'No text to convert' };
    const lines = text.split('\n').filter(Boolean);
    const author = lines[0]?.slice(0, 100) ?? 'Unknown';
    const comment = (lines.slice(1).join('\n') || lines[0]) ?? text;
    await db.engagementItem.create({
      data: {
        workspaceId: item.workspaceId,
        comment,
        author,
        status: EngagementStatus.PENDING,
      },
    });
    await db.inboxItem.update({
      where: { id: inboxId },
      data: { status: InboxItemStatus.ARCHIVED },
    });
    revalidatePath('/app/inbox');
    revalidatePath('/app/engagement');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}

export async function processOcrUpload(formData: FormData) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace', id: null };
    const file = formData.get('file') as File | null;
    const type = (formData.get('type') as string) || 'OCR_IMAGE';
    if (!file) return { ok: false, error: 'No file', id: null };
    const buffer = Buffer.from(await file.arrayBuffer());
    const { extractTextFromImage, extractTextFromPdfImages } = await import('@tidepilot/ai/ocr');
    const result = type === 'OCR_PDF'
      ? await extractTextFromPdfImages(buffer)
      : await extractTextFromImage(buffer);
    if (!result.ok) return { ok: false, error: result.error, id: null };
    const { fullText, blocks, confidence_score } = result.data;
    const { cleanOcrText } = await import('@tidepilot/ai/ocr');
    const cleanResult = await cleanOcrText(fullText);
    const cleanedText = cleanResult.ok ? cleanResult.data.cleanedText : fullText;
    const createResult = await createInboxItemFromOcr({
      type: type as InboxItemType,
      title: file.name,
      source: file.name,
      rawText: fullText,
      cleanedText,
      confidenceJson: { blocks, confidence_score },
    });
    return createResult;
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), id: null };
  }
}

export async function createInboxFromPaste(text: string) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace', id: null };
    const item = await db.inboxItem.create({
      data: {
        workspaceId,
        type: InboxItemType.PASTE_TEXT,
        title: 'Pasted text',
        rawText: text,
        cleanedText: text,
        status: InboxItemStatus.PROCESSED,
      },
    });
    revalidatePath('/app/inbox');
    return { ok: true, id: item.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), id: null };
  }
}

// Voice Persona
export async function getVoicePersonas() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return [];
    return db.voicePersona.findMany({
      where: { workspaceId },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

export async function createVoicePersona(params: {
  name: string;
  consentStatement: string;
}) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace', id: null };
    await db.consentLog.create({
      data: {
        workspaceId,
        consentType: ConsentType.VOICE_PERSONA,
        statementText: params.consentStatement,
      },
    });
    const persona = await db.voicePersona.create({
      data: {
        workspaceId,
        name: params.name,
        status: VoicePersonaStatus.READY,
        provider: VoicePersonaProvider.STUB,
        metadataJson: { duration: 90, qualityScore: 0.9 },
      },
    });
    revalidatePath('/app/voice');
    revalidatePath('/app/voice/audio');
    return { ok: true, id: persona.id };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), id: null };
  }
}

export async function generateTtsForDraft(draftId: string) {
  try {
    const draft = await db.draft.findUnique({ where: { id: draftId } });
    if (!draft) return { ok: false, error: 'Draft not found', url: null };
    const workspaceId = draft.workspaceId;
    const persona = await db.voicePersona.findFirst({ where: { workspaceId, status: 'READY' } });
    const audioUrl = persona
      ? `/api/audio/stub/${draftId}` // Stub: would be real TTS URL
      : null;
    await db.audioAsset.create({
      data: {
        workspaceId,
        voicePersonaId: persona?.id,
        kind: AudioAssetKind.NARRATION,
        textSourceId: draftId,
        path: audioUrl ?? 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=', // Silent WAV stub
        duration: draft.content.split(/\s+/).length * 0.5,
      },
    });
    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'TTS_GENERATE',
        units: 1,
        metadata: { draftId, agent_name: 'voice' },
      },
    });
    revalidatePath('/app/studio');
    return { ok: true, url: audioUrl ?? 'stub' };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e), url: null };
  }
}

export async function reorderScheduledPost(draftId: string, newDate: Date, slotOrder: number) {
  try {
    await db.scheduledPost.updateMany({
      where: { draftId },
      data: {
        publishDate: new Date(newDate),
        slotOrder,
        updatedAt: new Date(),
      },
    });
    revalidatePath('/app/calendar');
    return { ok: true };
  } catch (e) {
    console.error(e);
    return { ok: false, error: String(e) };
  }
}
