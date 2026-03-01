import { NextRequest, NextResponse } from 'next/server';
import { db } from '@tidepilot/db';
import { DraftStatus, EngagementStatus, InboxItemType, InboxItemStatus } from '@prisma/client';

// One-time protected seed route for production DB (Neon).
// Call with: POST /api/admin/seed -H "x-seed-secret: <SEED_SECRET>"
// Disable or delete after seeding.

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get('x-seed-secret');
  if (!secret || secret !== process.env.SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await db.user.upsert({
      where: { email: 'demo@tidepilot.demo' },
      update: {},
      create: { email: 'demo@tidepilot.demo', name: 'Demo User' },
    });

    let workspace = await db.workspace.findFirst({ where: { name: 'Personal' } });
    if (!workspace) {
      workspace = await db.workspace.create({ data: { name: 'Personal', plan: 'PRO' } });
    }

    const existingMembership = await db.membership.findFirst({
      where: { userId: user.id, workspaceId: workspace.id },
    });
    if (!existingMembership) {
      await db.membership.create({
        data: { userId: user.id, workspaceId: workspace.id, role: 'owner' },
      });
    }

    const wsId = workspace.id;

    await db.writingSample.deleteMany({ where: { workspaceId: wsId } });
    await db.writingSample.createMany({
      data: [
        { workspaceId: wsId, source: 'paste', text: 'Shipping fast means saying no. We focus on one outcome: clarity for the operator.' },
        { workspaceId: wsId, source: 'paste', text: 'The best content doesn\u2019t sell. It teaches. If someone learns something, they remember you.' },
        { workspaceId: wsId, source: 'import', text: 'I\u2019ve seen too many teams optimize for activity instead of impact. Metrics that matter are leading indicators, not vanity.' },
        { workspaceId: wsId, source: 'paste', text: 'Your voice is a product. Invest in it. Consistency beats virality every time.' },
        { workspaceId: wsId, source: 'paste', text: 'We built this for people who run their brand like a system. Not a side hustle\u2014an operation.' },
      ],
    });

    await db.voiceProfile.deleteMany({ where: { workspaceId: wsId } });
    await db.voiceProfile.create({
      data: {
        workspaceId: wsId,
        toneSliders: { assertive: 0.7, concise: 0.8, empathetic: 0.5 },
        forbiddenPhrases: ['synergy', 'leverage', 'disrupt'],
        signatureMoves: ['Short sentences.', 'Concrete examples.', 'One clear CTA.'],
        exampleParagraph: 'Shipping fast means saying no. We focus on one outcome: clarity for the operator.',
      },
    });

    await db.draft.deleteMany({ where: { workspaceId: wsId } });
    const draftTitles = [
      'Why I say no to 90% of feature requests',
      'The one metric that actually predicts retention',
      'How we run weekly briefs without meetings',
    ];
    for (let i = 0; i < 10; i++) {
      await db.draft.create({
        data: {
          workspaceId: wsId,
          content: `${draftTitles[i % 3]}\n\nDemo draft content for seed. This would be your real post.`,
          status: i < 2 ? DraftStatus.PUBLISHED : DraftStatus.DRAFT,
          voiceScore: 0.85,
          meta: { hookStrength: 0.8, specificity: 0.7 },
        },
      });
    }

    await db.engagementItem.deleteMany({ where: { workspaceId: wsId } });
    const comments = [
      { author: 'Alex Chen', comment: 'This resonates. We\u2019ve been thinking the same.' },
      { author: 'Jordan Lee', comment: 'Would love to hear how you prioritize.' },
      { author: 'Sam Taylor', comment: 'Great point on leading vs lagging metrics.' },
    ];
    for (let i = 0; i < 30; i++) {
      const c = comments[i % 3];
      await db.engagementItem.create({
        data: {
          workspaceId: wsId,
          comment: c.comment,
          author: c.author,
          threadId: `thread-${i}`,
          status: i < 10 ? EngagementStatus.PENDING : EngagementStatus.REPLIED,
          metadata: { sentiment: 'positive' },
          relationshipScore: i < 3 ? 0.92 : i < 10 ? 0.78 : 0.65,
          replyCount: i < 3 ? 4 : i < 6 ? 2 : 0,
        },
      });
    }

    await db.weeklyBrief.deleteMany({ where: { workspaceId: wsId } });
    const now = new Date();
    for (let w = 0; w < 4; w++) {
      const d = new Date(now);
      d.setDate(d.getDate() - 7 * (3 - w));
      const start = getWeekStart(d);
      await db.weeklyBrief.create({
        data: {
          workspaceId: wsId,
          weekStart: start,
          insights: [
            {
              id: '1',
              text: 'Question hooks performed 2x better this week.',
              type: 'hook',
              severity: 'high',
              evidence: {
                supportingPosts: [
                  { title: 'What if the best metric isn\u2019t what you track?', engagement: 124 },
                  { title: 'Why do most teams optimize for the wrong thing?', engagement: 98 },
                ],
                avgEngagementComparison: 'Question hooks: 2.1x vs statement hooks',
                suggestedExperiments: ['Try 3 question variants this week'],
              },
            },
            {
              id: '2',
              text: 'Engagement up on Tuesday posts.',
              type: 'timing',
              severity: 'medium',
              evidence: {
                supportingPosts: [{ title: 'Tuesday post', engagement: 89 }],
                avgEngagementComparison: 'Tue avg 82 vs Mon 45',
              },
            },
          ],
          actions: [
            { id: 'a1', text: 'Post one thought-leadership piece', done: w < 3, impactEstimate: 'high', timeEstimate: '30 min', order: 1 },
            { id: 'a2', text: 'Reply to 5 high-value comments', done: w < 2, impactEstimate: 'medium', timeEstimate: '15 min', order: 2 },
          ],
          postSuggestions: [
            'Why we say no to 90% of feature requests',
            'The one metric that predicts retention',
          ],
          engageWith: [
            { name: 'Alex Chen', reason: 'Frequent engager, 2 comments this week' },
            { name: 'Jordan Lee', reason: 'High-value connection' },
          ],
          summary: { doThis: 'Post one thought-leadership piece', avoidThis: 'Spreading too thin', focusOn: 'Question hooks and operations' },
        },
      });
    }

    await db.inboxItem.deleteMany({ where: { workspaceId: wsId } });
    await db.inboxItem.createMany({
      data: [
        { workspaceId: wsId, type: InboxItemType.PASTE_TEXT, title: 'Meeting notes', rawText: 'Key takeaway: focus on operations content.', cleanedText: 'Key takeaway: focus on operations content.', status: InboxItemStatus.PROCESSED },
        { workspaceId: wsId, type: InboxItemType.OCR_IMAGE, title: 'screenshot.png', source: 'screenshot.png', rawText: 'Sample OCR extract from image.', cleanedText: 'Sample OCR extract from image.', status: InboxItemStatus.NEW },
        { workspaceId: wsId, type: InboxItemType.PASTE_TEXT, title: 'Thread reply', rawText: 'Alex Chen: Great point on metrics.', cleanedText: 'Alex Chen: Great point on metrics.', status: InboxItemStatus.PROCESSED },
      ],
    });

    return NextResponse.json({
      ok: true,
      message: 'Seeded: user, workspace, 5 writing samples, voice profile, 10 drafts, 30 engagement items, 4 weekly briefs, 3 inbox items.',
    });
  } catch (error) {
    console.error('[seed] Error:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
