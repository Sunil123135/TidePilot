import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isPublicRoute = createRouteMatcher([
  '/',
  '/learn(.*)',
  '/tools(.*)',
  '/pricing(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/auth/linkedin(.*)',
]);

// Clerk publishable keys follow the pattern pk_test_<base64> or pk_live_<base64>
// Placeholder keys like "pk_test_replace_with_your_key" lack the proper base64 encoded portion
function isValidClerkKey(key: string | undefined): boolean {
  if (!key) return false;
  const match = key.match(/^pk_(test|live)_(.+)$/);
  if (!match) return false;
  // Valid Clerk keys have a long encoded section (>20 chars) ending in $
  return match[2].length > 20 && match[2].endsWith('$');
}

const clerkKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

const clerkAuth = isValidClerkKey(clerkKey)
  ? clerkMiddleware(async (auth, req) => {
      if (!isPublicRoute(req)) {
        await auth.protect();
      }
    })
  : null;

export default function middleware(req: NextRequest, evt: Parameters<typeof clerkAuth extends null ? never : NonNullable<typeof clerkAuth>>[1]) {
  if (clerkAuth) {
    return clerkAuth(req, evt);
  }
  // Dev mode: Clerk not configured, allow all requests
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
