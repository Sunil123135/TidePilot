'use server';

import { db } from '@tidepilot/db';
import { revalidatePath } from 'next/cache';

export async function getDraftComments(draftId: string) {
  try {
    return db.draftComment.findMany({
      where: { draftId, parentId: null },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  } catch {
    return [];
  }
}

export async function addDraftComment(params: {
  draftId: string;
  authorName: string;
  content: string;
  selectionStart?: number;
  selectionEnd?: number;
  selectedText?: string;
  parentId?: string;
}) {
  try {
    const comment = await db.draftComment.create({
      data: {
        draftId: params.draftId,
        authorName: params.authorName.trim() || 'Anonymous',
        content: params.content.trim(),
        selectionStart: params.selectionStart ?? null,
        selectionEnd: params.selectionEnd ?? null,
        selectedText: params.selectedText ?? null,
        parentId: params.parentId ?? null,
      },
      include: { replies: true },
    });
    revalidatePath(`/app/studio/${params.draftId}`);
    return { ok: true, comment };
  } catch (e) {
    return { ok: false, error: String(e), comment: null };
  }
}

export async function resolveComment(commentId: string, draftId: string) {
  try {
    await db.draftComment.update({
      where: { id: commentId },
      data: { resolved: true },
    });
    revalidatePath(`/app/studio/${draftId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

export async function deleteComment(commentId: string, draftId: string) {
  try {
    await db.draftComment.delete({ where: { id: commentId } });
    revalidatePath(`/app/studio/${draftId}`);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}
