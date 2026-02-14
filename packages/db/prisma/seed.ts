import { PrismaClient, DraftStatus, EngagementStatus, InboxItemType, InboxItemStatus } from '@prisma/client';

const prisma = new PrismaClient();

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@tidepilot.demo' },
    update: {},
    create: {
      email: 'demo@tidepilot.demo',
      name: 'Demo User',
    },
  });

  let workspace = await prisma.workspace.findFirst({ where: { name: 'Personal' } });
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: { name: 'Personal', plan: 'PRO' },
    });
  }

  let membership = await prisma.membership.findFirst({
    where: { userId: user.id, workspaceId: workspace.id },
  });
  if (!membership) {
    await prisma.membership.create({
      data: { userId: user.id, workspaceId: workspace.id, role: 'owner' },
    });
  }

  const wsId = workspace.id;

  await prisma.writingSample.deleteMany({ where: { workspaceId: wsId } });
  await prisma.writingSample.createMany({
    data: [
      { workspaceId: wsId, source: 'paste', text: 'Shipping fast means saying no. We focus on one outcome: clarity for the operator.' },
      { workspaceId: wsId, source: 'paste', text: 'The best content doesn’t sell. It teaches. If someone learns something, they remember you.' },
      { workspaceId: wsId, source: 'import', text: 'I’ve seen too many teams optimize for activity instead of impact. Metrics that matter are leading indicators, not vanity.' },
      { workspaceId: wsId, source: 'paste', text: 'Your voice is a product. Invest in it. Consistency beats virality every time.' },
      { workspaceId: wsId, source: 'paste', text: 'We built this for people who run their brand like a system. Not a side hustle—an operation.' },
    ],
  });

  await prisma.voiceProfile.deleteMany({ where: { workspaceId: wsId } });
  await prisma.voiceProfile.create({
    data: {
      workspaceId: wsId,
      toneSliders: { assertive: 0.7, concise: 0.8, empathetic: 0.5 },
      forbiddenPhrases: ['synergy', 'leverage', 'disrupt'],
      signatureMoves: ['Short sentences.', 'Concrete examples.', 'One clear CTA.'],
      exampleParagraph: 'Shipping fast means saying no. We focus on one outcome: clarity for the operator. The best content doesn’t sell—it teaches.',
    },
  });

  await prisma.draft.deleteMany({ where: { workspaceId: wsId } });
  const draftTitles = [
    'Why I say no to 90% of feature requests',
    'The one metric that actually predicts retention',
    'How we run weekly briefs without meetings',
  ];
  for (let i = 0; i < 10; i++) {
    await prisma.draft.create({
      data: {
        workspaceId: wsId,
        content: `${draftTitles[i % 3]}\n\nDemo draft content for seed. This would be your real post.`,
        status: i < 2 ? DraftStatus.PUBLISHED : DraftStatus.DRAFT,
        voiceScore: 0.85,
        meta: { hookStrength: 0.8, specificity: 0.7 },
      },
    });
  }

  await prisma.engagementItem.deleteMany({ where: { workspaceId: wsId } });
  const comments = [
    { author: 'Alex Chen', comment: 'This resonates. We’ve been thinking the same.' },
    { author: 'Jordan Lee', comment: 'Would love to hear how you prioritize.' },
    { author: 'Sam Taylor', comment: 'Great point on leading vs lagging metrics.' },
  ];
  for (let i = 0; i < 30; i++) {
    const c = comments[i % 3];
    await prisma.engagementItem.create({
      data: {
        workspaceId: wsId,
        comment: c.comment,
        author: c.author,
        threadId: `thread-${i}`,
        status: i < 10 ? EngagementStatus.PENDING : EngagementStatus.REPLIED,
        metadata: { sentiment: 'positive' },
        relationshipScore: i < 3 ? 0.92 : (i < 10 ? 0.78 : 0.65),
        replyCount: i < 3 ? 4 : (i < 6 ? 2 : 0),
      },
    });
  }

  await prisma.weeklyBrief.deleteMany({ where: { workspaceId: wsId } });
  const now = new Date();
  for (let w = 0; w < 4; w++) {
    const d = new Date(now);
    d.setDate(d.getDate() - 7 * (3 - w));
    const start = getWeekStart(d);
    await prisma.weeklyBrief.create({
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
                { title: 'What if the best metric isn\'t what you track?', engagement: 124 },
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
          {
            id: '3',
            text: 'Topic cluster "operations" resonates most.',
            type: 'topic',
            severity: 'high',
            evidence: {
              supportingPosts: [{ title: 'How we run weekly briefs', engagement: 156 }],
              suggestedExperiments: ['Double down on operations content'],
            },
          },
        ],
        actions: [
          { id: 'a1', text: 'Post one thought-leadership piece', done: w < 3, impactEstimate: 'high', timeEstimate: '30 min', order: 1 },
          { id: 'a2', text: 'Reply to 5 high-value comments', done: w < 2, impactEstimate: 'medium', timeEstimate: '15 min', order: 2 },
          { id: 'a3', text: 'Review Voice Lab and refine phrases', done: w < 1, impactEstimate: 'low', timeEstimate: '10 min', order: 3 },
        ],
        postSuggestions: [
          'Why we say no to 90% of feature requests',
          'The one metric that predicts retention',
          'How to run your brand like an operating system',
        ],
        engageWith: [
          { name: 'Alex Chen', reason: 'Frequent engager, 2 comments this week' },
          { name: 'Jordan Lee', reason: 'High-value connection' },
          { name: 'Sam Taylor', reason: 'Active in operations discussions' },
        ],
        summary: { doThis: 'Post one thought-leadership piece', avoidThis: 'Spreading too thin', focusOn: 'Question hooks and operations' },
      },
    });
  }

  await prisma.inboxItem.deleteMany({ where: { workspaceId: wsId } });
  await prisma.inboxItem.createMany({
    data: [
      { workspaceId: wsId, type: InboxItemType.PASTE_TEXT, title: 'Meeting notes', rawText: 'Key takeaway: focus on operations content. Action: draft post on weekly briefs.', cleanedText: 'Key takeaway: focus on operations content. Action: draft post on weekly briefs.', status: InboxItemStatus.PROCESSED },
      { workspaceId: wsId, type: InboxItemType.OCR_IMAGE, title: 'screenshot.png', source: 'screenshot.png', rawText: 'Sample OCR extract from image.', cleanedText: 'Sample OCR extract from image.', status: InboxItemStatus.NEW },
      { workspaceId: wsId, type: InboxItemType.PASTE_TEXT, title: 'Thread reply', rawText: 'Alex Chen: Great point on metrics.\nJordan: Would love to hear more.', cleanedText: 'Alex Chen: Great point on metrics.\nJordan: Would love to hear more.', status: InboxItemStatus.PROCESSED },
    ],
  });

  console.log('Seed completed: user, workspace, 5 samples, voice profile, 10 drafts, 30 engagement items, 4 briefs, 3 inbox items.');
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
