import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { db } from '@tidepilot/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' });

export async function POST() {
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
