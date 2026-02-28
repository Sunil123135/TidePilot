'use client';

import { useCollaboration } from '@/hooks/use-collaboration';

interface Props {
  draftId: string;
  myName?: string;
}

export function CollaborationPresence({ draftId, myName = 'You' }: Props) {
  const { collaborators } = useCollaboration(draftId, myName);

  if (collaborators.length === 0) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Also editing:</span>
      <div className="flex items-center -space-x-1.5">
        {collaborators.slice(0, 5).map((c) => (
          <div
            key={c.id}
            className="relative flex h-6 w-6 items-center justify-center rounded-full border-2 border-background text-xs font-bold text-white"
            style={{ backgroundColor: c.color }}
            title={c.name}
          >
            {c.name[0]?.toUpperCase() ?? '?'}
          </div>
        ))}
        {collaborators.length > 5 && (
          <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-background bg-muted text-xs font-medium text-muted-foreground">
            +{collaborators.length - 5}
          </div>
        )}
      </div>
      {collaborators.map((c) => (
        <span key={c.id} className="text-xs" style={{ color: c.color }}>
          {c.name}
        </span>
      ))}
    </div>
  );
}
