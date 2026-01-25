import "server-only";
import { auth } from "@clerk/nextjs/server";
import type { User as ClerkUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { deriveRoleFromClerkUser } from "./admin-config";

/**
 * User role type from Clerk public metadata
 */
export type UserRole = "ADMIN" | "PILOT" | "USER";

/**
 * Checks if the current user is an admin
 * Queries the database to get the current user's role
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const { userId } = await auth();
  
  if (!userId) {
    return false;
  }

  const user = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });

  return user?.role === "ADMIN";
}

/**
 * Syncs user data from Clerk to Prisma
 * Call this from Clerk webhook handler (user.updated, user.created)
 * 
 * @param clerkUserId - The Clerk user ID
 * @param userData - User data from Clerk webhook
 */
export async function syncClerkUserToPrisma(
  clerkUserId: string,
  userData: {
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    public_metadata?: Record<string, unknown>;
  }
) {
  const primaryEmail = userData.email_addresses?.[0]?.email_address || "";

  // Always prefer database role if present; only use Clerk metadata if database role is missing
  const existing = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { role: true },
  });

  let role: UserRole = "USER";
  if (existing?.role) {
    role = existing.role;
  } else {
    const metadataRole = (userData.public_metadata?.role as UserRole) || undefined;
    role = metadataRole ?? deriveRoleFromClerkUser({
      id: clerkUserId,
      emailAddresses: [{ emailAddress: primaryEmail }],
      privateMetadata: userData.public_metadata ?? {},
      publicMetadata: userData.public_metadata ?? {},
    } as Partial<ClerkUser>) ?? "USER";
  }

  const user = await db.user.upsert({
    where: { clerkId: clerkUserId },
    create: {
      clerkId: clerkUserId,
      email: primaryEmail,
      firstName: userData.first_name || null,
      lastName: userData.last_name || null,
      role,
    },
    update: {
      email: primaryEmail,
      firstName: userData.first_name || null,
      lastName: userData.last_name || null,
      // Only update role if not already ADMIN (prevents accidental demotion)
      role: existing?.role === "ADMIN" ? "ADMIN" : role,
    },
  });

  // Auto-create UserPreferences with defaults if they don't exist
  await db.userPreferences.upsert({
    where: { userId: user.id },
    update: {}, // No updates needed if already exists
    create: {
      userId: user.id,
      // Defaults are set in schema: theme=SYSTEM, unitSystem=METRIC, currency=USD
    },
  });

  return user;
}

/**
 * Syncs database user role to Clerk public metadata
 * Call this after changing a user's role in the database
 * 
 * @param clerkUserId - The Clerk user ID
 */
export async function syncPrismaRoleToClerk(clerkUserId: string): Promise<void> {
  // Get the user's role from database
  const user = await db.user.findUnique({
    where: { clerkId: clerkUserId },
    select: { role: true },
  });

  if (!user) {
    throw new Error(`User not found: ${clerkUserId}`);
  }

  // Import here to avoid circular dependencies at module load time
  const { clerkClient } = await import("@clerk/nextjs/server");
  const client = await clerkClient();

  // Sync role to Clerk's public metadata
  await client.users.updateUser(clerkUserId, {
    publicMetadata: { role: user.role },
  });
}
