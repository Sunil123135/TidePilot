import { NextRequest, NextResponse } from 'next/server';
import { db } from '@tidepilot/db';
import { EngagementStatus } from '@prisma/client';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-mcp-api-key') === process.env.MCP_API_KEY;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const workspace = await db.workspace.findFirst();
    if (!workspace) return NextResponse.json([]);

    const status = req.nextUrl.searchParams.get('status') as EngagementStatus | null;
    const items = await db.engagementItem.findMany({
      where: {
        workspaceId: workspace.id,
        ...(status ? { status } : { status: EngagementStatus.PENDING }),
      },
      orderBy: { relationshipScore: 'desc' },
      take: 20,
      select: {
        id: true,
        author: true,
        comment: true,
        status: true,
        relationshipScore: true,
        replyCount: true,
        createdAt: true,
      },
    });
    return NextResponse.json(items);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
