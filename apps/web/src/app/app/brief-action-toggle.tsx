'use client';

import { useRouter } from 'next/navigation';
import { toggleBriefActionDone } from '@/app/actions';

export function BriefActionToggle({
  briefId,
  actionId,
  done,
}: {
  briefId: string;
  actionId: string;
  done: boolean;
}) {
  const router = useRouter();

  async function handleToggle() {
    await toggleBriefActionDone(briefId, actionId);
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      className="flex h-5 w-5 items-center justify-center rounded border border-border bg-background text-xs"
      aria-label={done ? 'Mark undone' : 'Mark done'}
    >
      {done ? '✓' : ''}
    </button>
  );
}
