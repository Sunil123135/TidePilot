import { getDrafts, getEngagementItems } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DraftStatus } from '@prisma/client';
import { ProgressFill } from './progress-fill';

export default async function GoalsPage() {
  const [drafts, engagement] = await Promise.all([
    getDrafts(),
    getEngagementItems(),
  ]);

  // Weekly targets (configurable - for demo, using defaults)
  const weeklyTargets = {
    posts: 2,
    comments: 5,
    conversations: 3,
  };

  // Current week progress
  const now = new Date();
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - now.getDay() + (now.getDay() === 0 ? -6 : 1));
  weekStart.setHours(0, 0, 0, 0);

  const publishedThisWeek = drafts.filter(
    (d) => d.status === DraftStatus.PUBLISHED && new Date(d.updatedAt) >= weekStart
  ).length;

  const repliedThisWeek = engagement.filter(
    (e) => e.status === 'REPLIED' && new Date(e.updatedAt) >= weekStart
  ).length;

  const conversationsThisWeek = Math.floor(repliedThisWeek / 2); // Rough estimate

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Goals</h1>
        <p className="mt-1 text-muted-foreground">
          Weekly targets, progress, effort vs outcome.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Posts</CardTitle>
            <CardDescription>Published this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{publishedThisWeek}</span>
                <span className="text-sm text-muted-foreground">/ {weeklyTargets.posts}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <ProgressFill
                  percent={Math.min((publishedThisWeek / weeklyTargets.posts) * 100, 100)}
                  className="goals-progress-fill h-full bg-primary transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Comments</CardTitle>
            <CardDescription>Replied this week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{repliedThisWeek}</span>
                <span className="text-sm text-muted-foreground">/ {weeklyTargets.comments}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <ProgressFill
                  percent={Math.min((repliedThisWeek / weeklyTargets.comments) * 100, 100)}
                  className="goals-progress-fill h-full bg-primary transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Conversations</CardTitle>
            <CardDescription>Meaningful exchanges</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-semibold">{conversationsThisWeek}</span>
                <span className="text-sm text-muted-foreground">/ {weeklyTargets.conversations}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <ProgressFill
                  percent={Math.min((conversationsThisWeek / weeklyTargets.conversations) * 100, 100)}
                  className="goals-progress-fill h-full bg-primary transition-all"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
