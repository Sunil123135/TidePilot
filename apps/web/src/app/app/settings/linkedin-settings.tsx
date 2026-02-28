'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { disconnectLinkedIn, syncLinkedInPosts } from '@/app/actions/linkedin';
import type { LinkedInConnection, LinkedInPost } from '@prisma/client';

interface Props {
  connection: LinkedInConnection | null;
  posts: LinkedInPost[];
  isLinkedInConfigured: boolean;
}

export function LinkedInSettingsPanel({ connection, posts, isLinkedInConfigured }: Props) {
  const [syncing, setSyncing] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const router = useRouter();

  // Show status from OAuth redirect
  const searchParams = useSearchParams();
  const linkedinParam = searchParams.get('linkedin');
  const reason = searchParams.get('reason');

  function errorMessage(r: string | null): string {
    if (r === 'no_code') {
      return 'LinkedIn did not return an authorization code. The Redirect URI in your LinkedIn app does not exactly match: http://localhost:3001/api/auth/linkedin/callback — check LinkedIn Developer App → Auth tab.';
    }
    if (r === 'invalid_scope_error') {
      return 'Scope not authorized. Go to your LinkedIn Developer App → Products tab and request: "Sign In with LinkedIn using OpenID Connect" (instant) and "Share on LinkedIn" (1–2 day review). Then try again.';
    }
    if (r === 'token_exchange') {
      return 'Token exchange failed. Double-check your Client ID and Client Secret are correct.';
    }
    if (r === 'missing_credentials') {
      return 'LinkedIn credentials (Client ID or Secret) are missing from .env.';
    }
    return `Connection failed: ${r ?? 'unknown error'}`;
  }

  const statusMessage =
    linkedinParam === 'connected'
      ? { type: 'success' as const, text: 'LinkedIn connected successfully!' }
      : linkedinParam === 'error'
      ? { type: 'error' as const, text: errorMessage(reason) }
      : null;

  const displayMessage = message ?? statusMessage;

  const handleSync = async () => {
    setSyncing(true);
    setMessage(null);
    const result = await syncLinkedInPosts();
    setSyncing(false);
    if (result.ok) {
      setMessage({ type: 'success', text: `Synced ${result.count} posts from LinkedIn.` });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Sync failed' });
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Disconnect LinkedIn? This will remove your access token and imported posts will remain.')) return;
    setDisconnecting(true);
    setMessage(null);
    const result = await disconnectLinkedIn();
    setDisconnecting(false);
    if (result.ok) {
      setMessage({ type: 'success', text: 'LinkedIn disconnected.' });
      router.refresh();
    } else {
      setMessage({ type: 'error', text: result.error ?? 'Failed to disconnect' });
    }
  };

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <div className="flex items-center gap-3">
        {/* LinkedIn logo */}
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#0077b5] text-white font-bold text-sm shrink-0">
          in
        </div>
        <div className="flex-1">
          <p className="font-medium text-sm">LinkedIn</p>
          <p className="text-xs text-muted-foreground">
            {connection
              ? `Connected as ${connection.name ?? 'Unknown'}${connection.lastSync ? ` · Last sync: ${new Date(connection.lastSync).toLocaleDateString()}` : ''}`
              : 'Connect to import posts and publish directly.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {connection ? (
            <>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="rounded-md border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors disabled:opacity-50"
              >
                {syncing ? 'Syncing…' : 'Sync posts'}
              </button>
              <button
                onClick={handleDisconnect}
                disabled={disconnecting}
                className="rounded-md border border-red-200 bg-background px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {disconnecting ? 'Disconnecting…' : 'Disconnect'}
              </button>
            </>
          ) : (
            <a
              href="/api/auth/linkedin"
              className="rounded-md bg-[#0077b5] px-3 py-1.5 text-xs font-medium text-white hover:opacity-90 transition-opacity"
            >
              Connect LinkedIn
            </a>
          )}
        </div>
      </div>

      {displayMessage && (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            displayMessage.type === 'success'
              ? 'bg-green-50 text-green-700 border border-green-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}
        >
          {displayMessage.text}
          {displayMessage.type === 'error' && (
            <div className="mt-2">
              <a
                href="/app/inbox"
                className="underline font-medium text-xs"
              >
                → Go to Inbox to paste posts manually
              </a>
            </div>
          )}
        </div>
      )}

      {connection && !connection.lastSync && (
        <div className="rounded-md bg-blue-50 border border-blue-200 px-3 py-2 text-xs text-blue-800">
          <strong>Connected!</strong> Post syncing requires LinkedIn&apos;s &ldquo;Share on LinkedIn&rdquo; product approval (1–2 days).
          While you wait, paste your existing posts in{' '}
          <a href="/app/inbox" className="underline font-medium">Inbox</a>{' '}
          to train your voice profile.
        </div>
      )}

      {!isLinkedInConfigured && !connection && (
        <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800">
          <strong>Setup required:</strong> Add{' '}
          <code className="font-mono">LINKEDIN_CLIENT_ID</code>,{' '}
          <code className="font-mono">LINKEDIN_CLIENT_SECRET</code>, and{' '}
          <code className="font-mono">LINKEDIN_REDIRECT_URI</code> to your{' '}
          <code className="font-mono">apps/web/.env</code> file. Register your app at{' '}
          <a
            href="https://www.linkedin.com/developers/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            linkedin.com/developers
          </a>
          .
        </div>
      )}

      {connection && posts.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
            Imported posts ({posts.length})
          </p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {posts.map((post) => (
              <div key={post.id} className="rounded-md border border-border bg-background px-3 py-2">
                <p className="text-xs line-clamp-2">{post.content}</p>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  <span>👍 {post.likes}</span>
                  <span>💬 {post.comments}</span>
                  <span>🔄 {post.shares}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {connection && posts.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No posts imported yet. Click &ldquo;Sync posts&rdquo; to import your recent LinkedIn activity.
        </p>
      )}
    </div>
  );
}
