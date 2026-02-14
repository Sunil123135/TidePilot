'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { scheduleDraft, unscheduleDraft } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Draft, ScheduledPost } from '@prisma/client';

type DraftWithRelation = Draft;
type ScheduledWithDraft = ScheduledPost & { draft: DraftWithRelation };

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getWeekDates(): Date[] {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(today);
  monday.setDate(today.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

function toDateKey(d: Date): string {
  return d.toISOString().split('T')[0];
}

interface CalendarViewProps {
  drafts: DraftWithRelation[];
  scheduledPosts: ScheduledWithDraft[];
  unscheduledDrafts: DraftWithRelation[];
}

export function CalendarView({
  drafts,
  scheduledPosts,
  unscheduledDrafts,
}: CalendarViewProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const weekDates = getWeekDates();
  const scheduledByDate = weekDates.reduce(
    (acc, d) => {
      acc[toDateKey(d)] = scheduledPosts.filter(
        (s) => toDateKey(new Date(s.publishDate)) === toDateKey(d)
      );
      return acc;
    },
    {} as Record<string, ScheduledWithDraft[]>
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const activeDraft = activeId
    ? drafts.find((d) => d.id === activeId) ??
      scheduledPosts.find((s) => s.draftId === activeId)?.draft
    : null;

  function handleDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  async function handleDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const draftId = String(active.id);
    const overId = String(over.id);

    if (overId.startsWith('slot-')) {
      const dateStr = overId.replace('slot-', '');
      await scheduleDraft(draftId, new Date(dateStr));
    } else if (overId === 'unschedule') {
      await unscheduleDraft(draftId);
    }
  }

  const engagementHeatmap = weekDates.map((d) => {
    const count = (scheduledByDate[toDateKey(d)] ?? []).length;
    return { date: toDateKey(d), count };
  });
  const maxCount = Math.max(1, ...engagementHeatmap.map((h) => h.count));

  return (
    <div className="space-y-6">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Weekly planner</CardTitle>
                <CardDescription>
                  Drag drafts into slots to schedule. Drag to &quot;Unscheduled&quot; to remove.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-2">
                  {DAYS.map((day) => (
                    <div
                      key={day}
                      className="text-center text-xs font-medium text-muted-foreground"
                    >
                      {day}
                    </div>
                  ))}
                  {weekDates.map((d) => (
                    <CalendarSlot
                      key={toDateKey(d)}
                      date={d}
                      posts={scheduledByDate[toDateKey(d)] ?? []}
                      dateKey={toDateKey(d)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Engagement heatmap</CardTitle>
                <CardDescription>Posts scheduled per day this week</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  {engagementHeatmap.map(({ date, count }) => (
                    <div
                      key={date}
                      className="flex-1 rounded-md border border-border p-2 text-center"
                      style={{
                        backgroundColor: `hsl(var(--primary) / ${0.1 + (count / maxCount) * 0.4})`,
                      }}
                    >
                      <span className="text-xs font-medium">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Draft pool</CardTitle>
                <CardDescription>Drag to calendar to schedule</CardDescription>
              </CardHeader>
              <CardContent>
                <UnscheduledZone unscheduledDrafts={unscheduledDrafts} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Optimal publish window</CardTitle>
                <CardDescription>AI-suggested best times</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="font-medium">Tue 8:00 AM</span>
                    <span className="text-muted-foreground">— Peak engagement</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium">Thu 9:00 AM</span>
                    <span className="text-muted-foreground">— Second-best</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="font-medium">Wed 7:00 AM</span>
                    <span className="text-muted-foreground">— Morning readers</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <DragOverlay>
          {activeDraft ? (
            <div className="rounded-md border border-border bg-card p-3 shadow-lg opacity-90">
              <p className="line-clamp-2 text-sm">{activeDraft.content.slice(0, 80)}…</p>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

function CalendarSlot({
  date,
  posts,
  dateKey,
}: {
  date: Date;
  posts: ScheduledWithDraft[];
  dateKey: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `slot-${dateKey}` });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] rounded-md border p-2 transition-colors ${
        isOver ? 'border-primary bg-primary/10' : 'border-border'
      }`}
    >
      <span className="text-xs text-muted-foreground">{date.getDate()}</span>
      <div className="mt-1 space-y-1">
        {posts.map((s) => (
          <ScheduledDraftCard key={s.id} scheduled={s} />
        ))}
      </div>
    </div>
  );
}

function UnscheduledZone({ unscheduledDrafts }: { unscheduledDrafts: DraftWithRelation[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'unschedule' });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[80px] rounded-md border-2 border-dashed p-3 transition-colors ${
        isOver ? 'border-primary bg-primary/10' : 'border-muted'
      }`}
    >
      {unscheduledDrafts.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          All drafts scheduled, or create new drafts in Studio.
        </p>
      ) : (
        <div className="space-y-2">
          {unscheduledDrafts.map((d) => (
            <DraftCard key={d.id} draft={d} />
          ))}
        </div>
      )}
    </div>
  );
}

function DraftCard({ draft }: { draft: DraftWithRelation }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: draft.id,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded-md border border-border bg-card px-3 py-2 text-sm active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <Link
        href={`/app/studio/${draft.id}`}
        className="line-clamp-2 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {draft.content.slice(0, 60)}…
      </Link>
    </div>
  );
}

function ScheduledDraftCard({ scheduled }: { scheduled: ScheduledWithDraft }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: scheduled.draftId,
  });

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      className={`cursor-grab rounded border border-border bg-muted/50 px-2 py-1 text-xs active:cursor-grabbing ${
        isDragging ? 'opacity-50' : ''
      }`}
    >
      <Link
        href={`/app/studio/${scheduled.draft.id}`}
        className="line-clamp-2 hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {scheduled.draft.content.slice(0, 40)}…
      </Link>
      <span className="mt-0.5 block text-[10px] text-muted-foreground capitalize">
        {scheduled.platform.toLowerCase()}
      </span>
    </div>
  );
}
