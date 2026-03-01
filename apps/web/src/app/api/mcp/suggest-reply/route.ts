import { NextRequest, NextResponse } from 'next/server';
import { db } from '@tidepilot/db';
import { suggestReplies } from '@tidepilot/ai';

function checkAuth(req: NextRequest) {
  return req.headers.get('x-mcp-api-key') === process.env.MCP_API_KEY;
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const { engagementItemId } = await req.json();
    if (!engagementItemId) {
      return NextResponse.json({ error: 'engagementItemId required' }, { status: 400 });
    }

    const item = await db.engagementItem.findUnique({ where: { id: engagementItemId } });
    if (!item) return NextResponse.json({ error: 'Engagement item not found' }, { status: 404 });

    const voiceProfile = await db.voiceProfile.findFirst({ where: { workspaceId: item.workspaceId } });

    const result = await suggestReplies({
      comment: item.comment,
      author: item.author ?? undefined,
      voiceProfile: voiceProfile
        ? {
            toneSliders: voiceProfile.toneSliders as Record<string, number>,
            forbiddenPhrases: voiceProfile.forbiddenPhrases,
            signatureMoves: voiceProfile.signatureMoves,
          }
        : undefined,
    });

    return NextResponse.json({ ok: true, replies: result.data.suggestions });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
