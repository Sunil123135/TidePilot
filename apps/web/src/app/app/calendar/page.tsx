import { getDrafts, getScheduledPosts } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarView } from './CalendarView';

export default async function CalendarPage() {
  const [drafts, scheduled] = await Promise.all([
    getDrafts(),
    getScheduledPosts(),
  ]);

  const unscheduledDrafts = drafts.filter(
    (d) => !scheduled.some((s) => s.draftId === d.id)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Content Calendar</h1>
        <p className="mt-1 text-muted-foreground">
          Weekly planner, content slot suggestions, drag-and-drop scheduling.
        </p>
      </div>

      <CalendarView
        drafts={drafts}
        scheduledPosts={scheduled}
        unscheduledDrafts={unscheduledDrafts}
      />
    </div>
  );
}
