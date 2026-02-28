import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.LINKEDIN_CLIENT_ID;
  const redirectUri = process.env.LINKEDIN_REDIRECT_URI ?? `${process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'}/api/auth/linkedin/callback`;

  if (!clientId) {
    return NextResponse.json({ error: 'LINKEDIN_CLIENT_ID not configured' }, { status: 500 });
  }

  // Generate a random state value for CSRF protection
  const state = Math.random().toString(36).substring(2);

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    state,
    // openid+profile+email: requires "Sign In with LinkedIn using OpenID Connect" product (instant approval)
    // w_member_social: requires "Share on LinkedIn" product (1-2 day review)
    scope: 'openid profile email w_member_social',
  });

  const authUrl = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;

  return NextResponse.redirect(authUrl);
}
