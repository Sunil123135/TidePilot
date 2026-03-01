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
    if (!workspace) return NextResponse.json(null);

    const profile = await db.voiceProfile.findFirst({
      where: { workspaceId: workspace.id },
      select: {
        toneSliders: true,
        forbiddenPhrases: true,
        signatureMoves: true,
        exampleParagraph: true,
        updatedAt: true,
      },
    });
    return NextResponse.json(profile);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
