'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { db } from '@tidepilot/db';

export async function getWorkspaceId(): Promise<string | null> {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) return null;

    const membership = await db.membership.findFirst({
      where: { user: { clerkId } },
      select: { workspaceId: true },
    });
    if (membership) return membership.workspaceId;

    // First visit: auto-provision user + workspace
    const clerkUser = await currentUser();
    const email = clerkUser?.emailAddresses[0]?.emailAddress ?? `${clerkId}@tidepilot.app`;
    const name = clerkUser?.firstName
      ? `${clerkUser.firstName} ${clerkUser.lastName ?? ''}`.trim()
      : 'My';

    const user = await db.user.upsert({
      where: { clerkId },
      create: { clerkId, email, name },
      update: {},
    });

    const workspace = await db.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        memberships: { create: { userId: user.id, role: 'owner' } },
      },
    });

    return workspace.id;
  } catch {
    return null;
  }
}
