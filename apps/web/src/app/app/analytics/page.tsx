import { getDrafts, getEngagementItems } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EngagementChart } from './engagement-chart';
import { TopicClusterChart } from './TopicClusterChart';
import { ContentTypeChart } from './ContentTypeChart';

export default async function AnalyticsPage() {
  const [drafts, engagement] = await Promise.all([
    getDrafts(),
    getEngagementItems(),
  ]);

  const replied = engagement.filter((i) => i.status === 'REPLIED').length;
  const pending = engagement.filter((i) => i.status === 'PENDING').length;

  // Group engagement by date for chart
  const engagementByDate = engagement.reduce((acc, item) => {
    const date = new Date(item.createdAt).toISOString().split('T')[0];
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(engagementByDate)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Strategic Analytics</h1>
        <p className="mt-1 text-muted-foreground">
          Topic clusters, content type performance, engagement trends.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Drafts</CardTitle>
            <CardDescription>Total drafts</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{drafts.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Engagement</CardTitle>
            <CardDescription>Replied vs pending</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Replied: <span className="font-medium text-foreground">{replied}</span>
              {' · '}
              Pending: <span className="font-medium text-foreground">{pending}</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Hook strength index</CardTitle>
            <CardDescription>Pattern + clarity + curiosity</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">78%</p>
            <p className="text-xs text-muted-foreground mt-1">Based on recent drafts</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Topic cluster</CardTitle>
            <CardDescription>Size = engagement, color = topic</CardDescription>
          </CardHeader>
          <CardContent>
            <TopicClusterChart />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Content type performance</CardTitle>
            <CardDescription>Story vs Framework vs Contrarian vs Data</CardDescription>
          </CardHeader>
          <CardContent>
            <ContentTypeChart />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Engagement volume</CardTitle>
          <CardDescription>Comments received over time (last 7 days)</CardDescription>
        </CardHeader>
        <CardContent>
          <EngagementChart data={chartData} />
        </CardContent>
      </Card>
    </div>
  );
}
