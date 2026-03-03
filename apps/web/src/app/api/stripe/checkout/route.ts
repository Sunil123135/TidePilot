import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { auth } from '@clerk/nextjs/server';
import { db } from '@tidepilot/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2024-06-20' });

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { priceId } = await req.json();
  if (!priceId) return NextResponse.json({ error: 'priceId required' }, { status: 400 });

  const membership = await db.membership.findFirst({
    where: { user: { clerkId } },
    include: { workspace: true },
  });
  if (!membership) return NextResponse.json({ error: 'No workspace' }, { status: 400 });

  const { workspace } = membership;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

  // Get or create Stripe customer
  let customerId = workspace.stripeCustomerId;
  if (!customerId) {
    const user = await db.user.findUnique({ where: { clerkId } });
    const customer = await stripe.customers.create({
      email: user?.email,
      name: user?.name ?? undefined,
      metadata: { workspaceId: workspace.id, clerkId },
    });
    customerId = customer.id;
    await db.workspace.update({
      where: { id: workspace.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${appUrl}/app/settings?billing=success`,
    cancel_url: `${appUrl}/pricing?billing=canceled`,
    metadata: { workspaceId: workspace.id },
  });

  return NextResponse.json({ url: session.url });
}
