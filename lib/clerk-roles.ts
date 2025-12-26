import "server-only";
import { currentUser, auth } from "@clerk/nextjs/server";
import { db } from "./db";

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
  const role = (userData.public_metadata?.role as UserRole) || "USER";

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
      role,
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
