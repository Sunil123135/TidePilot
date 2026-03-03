'use server';

import { db } from '@tidepilot/db';
import { getWorkspaceId } from './workspace';

export type Plan = 'FREE' | 'PRO' | 'TEAMS';

export async function getWorkspacePlan(): Promise<Plan> {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return 'FREE';
    const ws = await db.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true, subscriptionStatus: true },
    });
    if (!ws) return 'FREE';
    if (ws.subscriptionStatus !== 'active') return 'FREE';
    if (ws.plan === 'TEAMS') return 'TEAMS';
    if (ws.plan === 'PRO') return 'PRO';
    return 'FREE';
  } catch {
    return 'FREE';
  }
}

export async function getWorkspaceBillingInfo() {
  try {
    const workspaceId = await getWorkspaceId();
    if (!workspaceId) return null;
    return db.workspace.findUnique({
      where: { id: workspaceId },
      select: { plan: true, subscriptionStatus: true, stripeCustomerId: true, stripeSubscriptionId: true },
    });
  } catch {
    return null;
  }
}
