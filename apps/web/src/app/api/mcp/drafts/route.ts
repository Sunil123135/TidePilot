import { NextRequest, NextResponse } from 'next/server';
import { db } from '@tidepilot/db';
import { DraftStatus } from '@prisma/client';

function checkAuth(req: NextRequest) {
  const key = req.headers.get('x-mcp-api-key');
  return key === process.env.MCP_API_KEY;
}

async function getWorkspaceId() {
  const w = await db.workspace.findFirst();
  return w?.id ?? null;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return NextResponse.json([]);

    const status = req.nextUrl.searchParams.get('status') as DraftStatus | null;
    const drafts = await db.draft.findMany({
      where: {
        workspaceId,
        ...(status ? { status } : {}),
      },
      orderBy: { updatedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        content: true,
        status: true,
        voiceScore: true,
        channel: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(drafts);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return NextResponse.json({ error: 'No workspace' }, { status: 400 });

    const body = await req.json();
    const draft = await db.draft.create({
      data: {
        workspaceId,
        content: body.content ?? '',
        status: DraftStatus.DRAFT,
      },
    });
    return NextResponse.json({ ok: true, id: draft.id });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
