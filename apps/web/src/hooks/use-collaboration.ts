'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

export interface Collaborator {
  id: string;
  name: string;
  color: string;
  lastSeen: number;
  cursorPosition?: number;
}

type PresenceMessage =
  | { type: 'join'; collaborator: Collaborator }
  | { type: 'leave'; id: string }
  | { type: 'cursor'; id: string; position: number }
  | { type: 'ping'; collaborator: Collaborator };

const COLORS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b',
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316',
];

function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)];
}

function sessionId() {
  if (typeof window === 'undefined') return 'server';
  const key = '__collaboration_id__';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = Math.random().toString(36).slice(2);
    sessionStorage.setItem(key, id);
  }
  return id;
}

export function useCollaboration(draftId: string, myName = 'You') {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const myIdRef = useRef(sessionId());
  const myColorRef = useRef(randomColor());
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const me = useCallback((): Collaborator => ({
    id: myIdRef.current,
    name: myName,
    color: myColorRef.current,
    lastSeen: Date.now(),
  }), [myName]);

  const broadcast = useCallback((msg: PresenceMessage) => {
    channelRef.current?.postMessage(msg);
  }, []);

  const updateCursor = useCallback((position: number) => {
    broadcast({ type: 'cursor', id: myIdRef.current, position });
  }, [broadcast]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.BroadcastChannel) return;

    const channel = new BroadcastChannel(`tidepilot_draft_${draftId}`);
    channelRef.current = channel;

    // Handle incoming messages
    channel.onmessage = (event: MessageEvent<PresenceMessage>) => {
      const msg = event.data;
      setCollaborators((prev) => {
        switch (msg.type) {
          case 'join':
          case 'ping': {
            const c = msg.type === 'join' ? msg.collaborator : msg.collaborator;
            const exists = prev.find((p) => p.id === c.id);
            if (exists) {
              return prev.map((p) => p.id === c.id ? { ...p, lastSeen: c.lastSeen } : p);
            }
            return [...prev, c];
          }
          case 'leave':
            return prev.filter((p) => p.id !== msg.id);
          case 'cursor':
            return prev.map((p) =>
              p.id === msg.id ? { ...p, cursorPosition: msg.position, lastSeen: Date.now() } : p
            );
          default:
            return prev;
        }
      });
    };

    // Announce join
    broadcast({ type: 'join', collaborator: me() });

    // Ping every 10s so others know we're still here
    pingIntervalRef.current = setInterval(() => {
      broadcast({ type: 'ping', collaborator: me() });
      // Prune stale collaborators (not seen in 30s)
      setCollaborators((prev) => prev.filter((p) => Date.now() - p.lastSeen < 30_000));
    }, 10_000);

    // Announce leave on cleanup
    return () => {
      broadcast({ type: 'leave', id: myIdRef.current });
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      channel.close();
      channelRef.current = null;
    };
  }, [draftId, broadcast, me]);

  return { collaborators, updateCursor, myId: myIdRef.current };
}
