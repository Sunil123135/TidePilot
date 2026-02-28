import { NextRequest, NextResponse } from 'next/server';
import { db } from '@tidepilot/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error || !code) {
    return NextResponse.redirect(
      new URL(`/app/settings?linkedin=error&reason=${error ?? 'no_code'}`, req.url)
    );
  }

  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
  const redirectUri =
    process.env.LINKEDIN_REDIRECT_URI ??
    `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/auth/linkedin/callback`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(
      new URL('/app/settings?linkedin=error&reason=missing_credentials', req.url)
    );
  }

  try {
    // Exchange code for access token
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: redirectUri,
        client_id: clientId,
        client_secret: clientSecret,
      }),
    });

    if (!tokenRes.ok) {
      const errBody = await tokenRes.text();
      console.error('[LinkedIn OAuth] Token exchange failed:', errBody);
      return NextResponse.redirect(
        new URL('/app/settings?linkedin=error&reason=token_exchange', req.url)
      );
    }

    const tokenData = await tokenRes.json();
    const { access_token, refresh_token, expires_in } = tokenData;
    const expiresAt = new Date(Date.now() + (expires_in ?? 5184000) * 1000);

    // Fetch LinkedIn profile info
    const profileRes = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    let linkedInId: string | undefined;
    let name: string | undefined;

    if (profileRes.ok) {
      const profile = await profileRes.json();
      linkedInId = profile.sub;
      name = profile.name ?? `${profile.given_name ?? ''} ${profile.family_name ?? ''}`.trim();
    }

    // Get the workspace (use first available)
    const workspace = await db.workspace.findFirst();
    if (!workspace) {
      return NextResponse.redirect(
        new URL('/app/settings?linkedin=error&reason=no_workspace', req.url)
      );
    }

    // Upsert LinkedIn connection
    await db.linkedInConnection.upsert({
      where: { workspaceId: workspace.id },
      create: {
        workspaceId: workspace.id,
        accessToken: access_token,
        refreshToken: refresh_token ?? null,
        expiresAt,
        linkedInId: linkedInId ?? null,
        name: name ?? null,
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token ?? null,
        expiresAt,
        linkedInId: linkedInId ?? null,
        name: name ?? null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.redirect(new URL('/app/settings?linkedin=connected', req.url));
  } catch (e) {
    console.error('[LinkedIn OAuth] Callback error:', e);
    return NextResponse.redirect(
      new URL('/app/settings?linkedin=error&reason=internal', req.url)
    );
  }
}
