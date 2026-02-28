'use server';

import { db } from '@tidepilot/db';
import { revalidatePath } from 'next/cache';
import { DraftStatus } from '@prisma/client';

async function getWorkspaceId(): Promise<string | null> {
  try {
    const w = await db.workspace.findFirst();
    return w?.id ?? null;
  } catch {
    return null;
  }
}

export async function getLinkedInConnection() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return null;
    return db.linkedInConnection.findUnique({ where: { workspaceId } });
  } catch {
    return null;
  }
}

export async function disconnectLinkedIn() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace' };
    await db.linkedInConnection.deleteMany({ where: { workspaceId } });
    revalidatePath('/app/settings');
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function syncLinkedInPosts() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace', count: 0 };

    const conn = await db.linkedInConnection.findUnique({ where: { workspaceId } });
    if (!conn) return { ok: false, error: 'LinkedIn not connected', count: 0 };

    // Check token expiry
    if (conn.expiresAt < new Date()) {
      return { ok: false, error: 'LinkedIn token expired. Please reconnect.', count: 0 };
    }

    const linkedInId = conn.linkedInId;
    if (!linkedInId) return { ok: false, error: 'LinkedIn profile ID missing', count: 0 };

    // Fetch recent posts from LinkedIn UGC API
    const authorsParam = encodeURIComponent(`List(urn:li:person:${linkedInId})`);
    const postsRes = await fetch(
      `https://api.linkedin.com/v2/ugcPosts?q=authors&authors=${authorsParam}&count=20`,
      {
        headers: {
          Authorization: `Bearer ${conn.accessToken}`,
          'X-Restli-Protocol-Version': '2.0.0',
        },
      }
    );

    if (!postsRes.ok) {
      const errText = await postsRes.text();
      console.error('[LinkedIn sync] Posts fetch failed:', errText);
      // 403 with MEMBER_NOT_FOLLOWING or ACCESS_DENIED means w_member_social not approved yet
      if (postsRes.status === 403 || errText.includes('ACCESS_DENIED') || errText.includes('not enough permissions')) {
        return {
          ok: false,
          error: 'Post access not approved yet. LinkedIn\'s "Share on LinkedIn" product is pending review (1–2 days). You\'ll receive an email when approved. In the meantime, paste posts manually via Inbox.',
          count: 0,
        };
      }
      return { ok: false, error: `LinkedIn API error (${postsRes.status}): ${errText.slice(0, 200)}`, count: 0 };
    }

    const postsData = await postsRes.json();
    const elements: Array<{
      id: string;
      specificContent?: {
        'com.linkedin.ugc.ShareContent'?: {
          shareCommentary?: { text?: string };
        };
      };
      created?: { time?: number };
      socialDetail?: { likes?: { paging?: { total?: number } }; comments?: { paging?: { total?: number } }; totalShares?: number };
    }> = postsData.elements ?? [];

    let imported = 0;
    for (const post of elements) {
      const content =
        post.specificContent?.['com.linkedin.ugc.ShareContent']?.shareCommentary?.text ?? '';
      const publishedAt = post.created?.time ? new Date(post.created.time) : new Date();
      const likes = post.socialDetail?.likes?.paging?.total ?? 0;
      const comments = post.socialDetail?.comments?.paging?.total ?? 0;
      const shares = post.socialDetail?.totalShares ?? 0;

      // Upsert to avoid duplicates
      await db.linkedInPost.upsert({
        where: { linkedInId: post.id },
        create: {
          workspaceId,
          connectionId: conn.id,
          linkedInId: post.id,
          content,
          publishedAt,
          likes,
          comments,
          shares,
        },
        update: {
          likes,
          comments,
          shares,
        },
      });
      imported++;
    }

    // Update lastSync
    await db.linkedInConnection.update({
      where: { id: conn.id },
      data: { lastSync: new Date() },
    });

    revalidatePath('/app/settings');
    revalidatePath('/app/analytics');
    return { ok: true, count: imported };
  } catch (e) {
    console.error('[LinkedIn sync] Error:', e);
    return { ok: false, error: String(e), count: 0 };
  }
}

export async function publishToLinkedIn(draftId: string) {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return { ok: false, error: 'No workspace' };

    const [draft, conn] = await Promise.all([
      db.draft.findUnique({ where: { id: draftId } }),
      db.linkedInConnection.findUnique({ where: { workspaceId } }),
    ]);

    if (!draft) return { ok: false, error: 'Draft not found' };
    if (!conn) return { ok: false, error: 'LinkedIn not connected. Go to Settings to connect.' };
    if (conn.expiresAt < new Date()) {
      return { ok: false, error: 'LinkedIn token expired. Please reconnect in Settings.' };
    }

    const personId = conn.linkedInId;
    if (!personId) return { ok: false, error: 'LinkedIn profile ID missing. Try reconnecting.' };

    const body = {
      author: `urn:li:person:${personId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text: draft.content },
          shareMediaCategory: 'NONE',
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${conn.accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error('[LinkedIn publish] Failed:', errText);
      return { ok: false, error: 'LinkedIn publish failed. Check your connection.' };
    }

    const responseData = await res.json();
    const linkedInPostId: string = responseData.id ?? `urn:li:ugcPost:${Date.now()}`;

    // Store published post and link to draft
    await db.linkedInPost.create({
      data: {
        workspaceId,
        connectionId: conn.id,
        linkedInId: linkedInPostId,
        content: draft.content,
        publishedAt: new Date(),
        draftId,
      },
    });

    // Update draft status to PUBLISHED
    await db.draft.update({
      where: { id: draftId },
      data: { status: DraftStatus.PUBLISHED, updatedAt: new Date() },
    });

    await db.actionEvent.create({
      data: {
        workspaceId,
        actionType: 'LINKEDIN_PUBLISH',
        units: 1,
        metadata: { draftId, linkedInPostId },
      },
    });

    revalidatePath('/app/studio');
    revalidatePath('/app/analytics');
    return { ok: true, linkedInPostId };
  } catch (e) {
    console.error('[LinkedIn publish] Error:', e);
    return { ok: false, error: String(e) };
  }
}

export async function getLinkedInPosts() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return [];
    return db.linkedInPost.findMany({
      where: { workspaceId },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    });
  } catch {
    return [];
  }
}
