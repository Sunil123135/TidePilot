import { NextRequest, NextResponse } from 'next/server';
import { db } from '@tidepilot/db';

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

    const samples = await db.writingSample.findMany({
      where: { workspaceId: workspace.id },
      orderBy: { createdAt: 'desc' },
      select: { id: true, text: true, source: true, createdAt: true },
    });
    return NextResponse.json(samples);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
