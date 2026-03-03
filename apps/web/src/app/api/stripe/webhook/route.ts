import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { db } from '@tidepilot/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? '', { apiVersion: '2026-02-25.clover' });

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature') ?? '';

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET ?? '');
  } catch (err) {
    console.error('[Stripe webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const workspaceId = session.metadata?.workspaceId;
        if (workspaceId && session.subscription) {
          const sub = await stripe.subscriptions.retrieve(session.subscription as string);
          await db.workspace.update({
            where: { id: workspaceId },
            data: {
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0]?.price.id ?? null,
              subscriptionStatus: sub.status,
              plan: resolvePlan(sub.items.data[0]?.price.id),
            },
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const workspace = await db.workspace.findFirst({
          where: { stripeCustomerId: sub.customer as string },
        });
        if (workspace) {
          await db.workspace.update({
            where: { id: workspace.id },
            data: {
              stripeSubscriptionId: sub.id,
              stripePriceId: sub.items.data[0]?.price.id ?? null,
              subscriptionStatus: sub.status,
              plan: resolvePlan(sub.items.data[0]?.price.id),
            },
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const workspace = await db.workspace.findFirst({
          where: { stripeCustomerId: sub.customer as string },
        });
        if (workspace) {
          await db.workspace.update({
            where: { id: workspace.id },
            data: { subscriptionStatus: 'canceled', plan: 'FREE', stripeSubscriptionId: null, stripePriceId: null },
          });
        }
        break;
      }
    }
  } catch (err) {
    console.error('[Stripe webhook] Handler error:', err);
  }

  return NextResponse.json({ received: true });
}

function resolvePlan(priceId?: string | null): string {
  if (!priceId) return 'FREE';
  if (priceId === process.env.STRIPE_TEAMS_PRICE_ID) return 'TEAMS';
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) return 'PRO';
  return 'PRO';
}
