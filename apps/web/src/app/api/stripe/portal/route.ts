import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { db } from '@tidepilot/db';

export async function POST() {
  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) return NextResponse.json({ error: 'Stripe not configured' }, { status: 503 });
  const stripe = new Stripe(stripeKey, { apiVersion: '2026-02-25.clover' });

  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const membership = await db.membership.findFirst({
    where: { user: { clerkId } },
    include: { workspace: true },
  });

  const customerId = membership?.workspace.stripeCustomerId;
  if (!customerId) return NextResponse.json({ error: 'No subscription found' }, { status: 400 });

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${appUrl}/app/settings`,
  });

  return NextResponse.json({ url: session.url });
}
