'use client';

import { useState, useRef } from 'react';
import { addDraftComment, resolveComment, deleteComment } from '@/app/actions/comments';
import type { DraftComment } from '@prisma/client';
import { MessageSquare, CheckCheck, Trash2, Reply, ChevronDown, ChevronUp } from 'lucide-react';

type CommentWithReplies = DraftComment & { replies: DraftComment[] };

interface Props {
  draftId: string;
  initialComments: CommentWithReplies[];
  selection?: { start: number; end: number; text: string } | null;
  onClearSelection?: () => void;
}

function timeAgo(date: Date) {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

function CommentItem({
  comment,
  draftId,
  onUpdate,
}: {
  comment: CommentWithReplies;
  draftId: string;
  onUpdate: () => void;
}) {
  const [showReply, setShowReply] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replyName, setReplyName] = useState('');
  const [replying, setReplying] = useState(false);
  const [resolving, setResolving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function handleReply() {
    if (!replyText.trim()) return;
    setReplying(true);
    await addDraftComment({
      draftId,
      authorName: replyName.trim() || 'You',
      content: replyText.trim(),
      parentId: comment.id,
    });
    setReplying(false);
    setReplyText('');
    setShowReply(false);
    setShowReplies(true);
    onUpdate();
  }

  async function handleResolve() {
    setResolving(true);
    await resolveComment(comment.id, draftId);
    setResolving(false);
    onUpdate();
  }

  async function handleDelete() {
    if (!confirm('Delete this comment?')) return;
    setDeleting(true);
    await deleteComment(comment.id, draftId);
    setDeleting(false);
    onUpdate();
  }

  return (
    <div className={`rounded-lg border p-3 text-sm space-y-2 ${comment.resolved ? 'border-border opacity-60 bg-muted/30' : 'border-border bg-card'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: '#6366f1' }}
          >
            {comment.authorName[0]?.toUpperCase() ?? 'A'}
          </div>
          <span className="font-medium truncate">{comment.authorName}</span>
          <span className="text-xs text-muted-foreground shrink-0">{timeAgo(comment.createdAt)}</span>
          {comment.resolved && (
            <span className="text-xs text-green-600 font-medium shrink-0">✓ Resolved</span>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!comment.resolved && (
            <button
              onClick={() => setShowReply(!showReply)}
              className="rounded p-1 text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
              title="Reply"
            >
              <Reply className="h-3.5 w-3.5" />
            </button>
          )}
          {!comment.resolved && (
            <button
              onClick={handleResolve}
              disabled={resolving}
              className="rounded p-1 text-muted-foreground hover:text-green-600 hover:bg-green-50 transition-colors"
              title="Resolve"
            >
              <CheckCheck className="h-3.5 w-3.5" />
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="rounded p-1 text-muted-foreground hover:text-red-600 hover:bg-red-50 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {comment.selectedText && (
        <div className="rounded bg-amber-50 border border-amber-200 px-2 py-1 text-xs text-amber-800 italic line-clamp-2">
          &ldquo;{comment.selectedText}&rdquo;
        </div>
      )}

      <p className="text-sm leading-relaxed">{comment.content}</p>

      {comment.replies.length > 0 && (
        <button
          onClick={() => setShowReplies(!showReplies)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          {comment.replies.length} {comment.replies.length === 1 ? 'reply' : 'replies'}
        </button>
      )}

      {showReplies && comment.replies.length > 0 && (
        <div className="ml-4 space-y-2 border-l-2 border-border pl-3">
          {comment.replies.map((reply) => (
            <div key={reply.id} className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white bg-violet-500">
                  {reply.authorName[0]?.toUpperCase() ?? 'A'}
                </div>
                <span className="text-xs font-medium">{reply.authorName}</span>
                <span className="text-xs text-muted-foreground">{timeAgo(reply.createdAt)}</span>
              </div>
              <p className="text-xs pl-7">{reply.content}</p>
            </div>
          ))}
        </div>
      )}

      {showReply && (
        <div className="space-y-2 pt-1">
          <input
            type="text"
            placeholder="Your name"
            value={replyName}
            onChange={(e) => setReplyName(e.target.value)}
            className="w-full rounded border border-input bg-background px-2 py-1 text-xs"
          />
          <textarea
            placeholder="Write a reply..."
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            className="min-h-[60px] w-full rounded border border-input bg-background px-2 py-1 text-xs resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleReply();
            }}
          />
          <div className="flex gap-2">
            <button
              onClick={handleReply}
              disabled={replying || !replyText.trim()}
              className="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {replying ? 'Posting…' : 'Reply'}
            </button>
            <button
              onClick={() => setShowReply(false)}
              className="rounded border border-border px-2 py-1 text-xs hover:bg-accent"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export function DraftComments({ draftId, initialComments, selection, onClearSelection }: Props) {
  const [comments, setComments] = useState<CommentWithReplies[]>(initialComments);
  const [newComment, setNewComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [posting, setPosting] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const activeComments = comments.filter((c) => !c.resolved);
  const resolvedComments = comments.filter((c) => c.resolved);

  async function handleAddComment() {
    if (!newComment.trim()) return;
    setPosting(true);
    const result = await addDraftComment({
      draftId,
      authorName: authorName.trim() || 'You',
      content: newComment.trim(),
      selectionStart: selection?.start,
      selectionEnd: selection?.end,
      selectedText: selection?.text,
    });
    setPosting(false);
    if (result.ok && result.comment) {
      setComments((prev) => [result.comment as CommentWithReplies, ...prev]);
      setNewComment('');
      onClearSelection?.();
    }
  }

  function handleUpdate() {
    setRefreshKey((k) => k + 1);
    // Re-fetch by reloading the page data (server action will revalidate)
    window.location.reload();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4" />
          Comments
          {activeComments.length > 0 && (
            <span className="rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
              {activeComments.length}
            </span>
          )}
        </h3>
      </div>

      {/* New comment form */}
      <div className="space-y-2">
        {selection && (
          <div className="flex items-center justify-between rounded bg-amber-50 border border-amber-200 px-2 py-1">
            <span className="text-xs text-amber-800 italic line-clamp-1">
              Commenting on: &ldquo;{selection.text}&rdquo;
            </span>
            <button onClick={onClearSelection} className="text-xs text-amber-600 hover:text-amber-800 ml-2 shrink-0">
              ✕
            </button>
          </div>
        )}
        <input
          type="text"
          placeholder="Your name (optional)"
          value={authorName}
          onChange={(e) => setAuthorName(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
        />
        <textarea
          placeholder="Add a comment... (⌘+Enter to post)"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="min-h-[70px] w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm resize-none"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAddComment();
          }}
        />
        <button
          onClick={handleAddComment}
          disabled={posting || !newComment.trim()}
          className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:opacity-50 transition-opacity"
        >
          {posting ? 'Posting…' : 'Add comment'}
        </button>
      </div>

      {/* Active comments */}
      {activeComments.length > 0 && (
        <div className="space-y-2">
          {activeComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              draftId={draftId}
              onUpdate={handleUpdate}
            />
          ))}
        </div>
      )}

      {activeComments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Select text in the editor to comment on it.
        </p>
      )}

      {/* Resolved comments toggle */}
      {resolvedComments.length > 0 && (
        <div>
          <button
            onClick={() => setShowResolved(!showResolved)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            {showResolved ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {resolvedComments.length} resolved
          </button>
          {showResolved && (
            <div className="mt-2 space-y-2">
              {resolvedComments.map((comment) => (
                <CommentItem
                  key={comment.id}
                  comment={comment}
                  draftId={draftId}
                  onUpdate={handleUpdate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
