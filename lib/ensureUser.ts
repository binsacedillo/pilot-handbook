import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { deriveRoleFromClerkUser } from "./admin-config";

export async function ensureUser() {
  const { userId } = await auth();
  if (!userId) return;

  const existing = await db.user.findUnique({
    where: { clerkId: userId },
    select: { id: true, role: true, email: true },
  });

  if (existing) return;

  const clerk = await currentUser();
  if (!clerk) return;

  const email = clerk.emailAddresses?.[0]?.emailAddress ?? "";
  const role = deriveRoleFromClerkUser(clerk);
  await db.user.create({
    data: {
      clerkId: clerk.id,
      email,
      firstName: clerk.firstName ?? null,
      lastName: clerk.lastName ?? null,
      role,
    },
  });
}
