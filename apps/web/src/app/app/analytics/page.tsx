import { getDrafts, getEngagementItems } from '@/app/actions';
import { getLinkedInPosts, getLinkedInConnection } from '@/app/actions/linkedin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EngagementChart } from './engagement-chart';
import { TopicClusterChart } from './TopicClusterChart';
import { ContentTypeChart } from './ContentTypeChart';

export default async function AnalyticsPage() {
  const [drafts, engagement, linkedInPosts, linkedInConn] = await Promise.all([
    getDrafts(),
    getEngagementItems(),
    getLinkedInPosts(),
    getLinkedInConnection(),
  ]);

  const replied = engagement.filter((i) => i.status === 'REPLIED').length;
  const pending = engagement.filter((i) => i.status === 'PENDING').length;

  const totalLikes = linkedInPosts.reduce((s, p) => s + p.likes, 0);
  const totalComments = linkedInPosts.reduce((s, p) => s + p.comments, 0);
  const totalShares = linkedInPosts.reduce((s, p) => s + p.shares, 0);

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

      {linkedInConn && (
        <div>
          <h2 className="text-base font-semibold mb-3">
            LinkedIn Performance
            <span className="ml-2 text-xs font-normal text-muted-foreground">
              {linkedInPosts.length} posts imported
            </span>
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total likes</CardTitle>
                <CardDescription>Across imported posts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{totalLikes.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total comments</CardTitle>
                <CardDescription>Across imported posts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{totalComments.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Total shares</CardTitle>
                <CardDescription>Across imported posts</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold">{totalShares.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>
          {linkedInPosts.length > 0 && (
            <div className="mt-4 rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-2 text-left font-medium text-muted-foreground">Post</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">👍</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">💬</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">🔄</th>
                    <th className="px-4 py-2 text-right font-medium text-muted-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {linkedInPosts.slice(0, 5).map((post) => (
                    <tr key={post.id} className="border-b border-border last:border-0">
                      <td className="px-4 py-2 max-w-xs">
                        <p className="line-clamp-1 text-xs">{post.content}</p>
                      </td>
                      <td className="px-4 py-2 text-right text-xs">{post.likes}</td>
                      <td className="px-4 py-2 text-right text-xs">{post.comments}</td>
                      <td className="px-4 py-2 text-right text-xs">{post.shares}</td>
                      <td className="px-4 py-2 text-right text-xs text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {!linkedInConn && (
        <div className="rounded-lg border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted-foreground">
            Connect LinkedIn in{' '}
            <a href="/app/settings" className="text-primary underline">Settings</a>
            {' '}to see post performance analytics.
          </p>
        </div>
      )}

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
