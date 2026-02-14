import { getLatestBrief, getBriefKpis, generateBriefAction } from '@/app/actions';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BriefClient } from './brief-client';
import { BriefKpis } from './BriefKpis';
import { BriefSummaryCard } from './BriefSummaryCard';
import { PostSuggestionsBlock } from './post-suggestions-block';
import { InsightCard } from './InsightCard';
import { ActionsPanel } from './ActionsPanel';
import { ExperimentsPanel } from './ExperimentsPanel';

export default async function AppHomePage() {
  let brief;
  let kpis;
  try {
    [brief, kpis] = await Promise.all([getLatestBrief(), getBriefKpis()]);
  } catch (e) {
    console.error('Failed to load brief:', e);
    throw e;
  }

  const summary = brief?.summary as { doThis?: string; avoidThis?: string; focusOn?: string } | null;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Operator Brief</h1>
          <p className="mt-1 text-muted-foreground">
            Adaptive strategic dashboard — insights, actions, experiments.
          </p>
        </div>
        <BriefClient generateAction={generateBriefAction} />
      </div>

      {kpis && (
        <BriefKpis
          postsThisWeek={kpis.postsThisWeek}
          repliesPending={kpis.repliesPending}
          consistencyScore={kpis.consistencyScore}
          voiceMatchAvg={kpis.voiceMatchAvg}
        />
      )}

      {brief && summary?.doThis && (
        <BriefSummaryCard
          doThis={summary.doThis}
          avoidThis={summary.avoidThis ?? 'Spreading too thin'}
          focusOn={summary.focusOn ?? 'Top-performing content themes'}
        />
      )}

      {!brief ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">No brief yet.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Generate this week&apos;s brief to see objectives, insights, and actions.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Insights</CardTitle>
                <CardDescription>Click to expand evidence and experiments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {(brief.insights as Array<{ id: string; text: string; type?: string; severity?: 'high' | 'medium' | 'low'; evidence?: object }>)?.map((i) => (
                  <InsightCard key={i.id} insight={i} />
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Actions</CardTitle>
                <CardDescription>Checklist with impact and time estimates</CardDescription>
              </CardHeader>
              <CardContent>
                <ActionsPanel
                  briefId={brief.id}
                  actions={(brief.actions as Array<{ id: string; text: string; done?: boolean; impactEstimate?: string; timeEstimate?: string; order?: number }>) ?? []}
                />
              </CardContent>
            </Card>
          </div>
          <div>
            <ExperimentsPanel />
          </div>
        </div>
      )}

      {brief?.postSuggestions && Array.isArray(brief.postSuggestions) && (brief.postSuggestions as string[]).length > 0 && (
        <PostSuggestionsBlock suggestions={brief.postSuggestions as string[]} />
      )}
    </div>
  );
}
