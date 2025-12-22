import "server-only";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "./db";

/**
 * User role type from Clerk public metadata
 */
export type UserRole = "ADMIN" | "PILOT" | "USER";

/**
 * Gets the current user's role from Clerk public metadata
 * This is the recommended way to access roles
 */
export async function getUserRole(): Promise<UserRole | null> {
  const user = await currentUser();
  
  if (!user) {
    return null;
  }

  const role = user.publicMetadata?.role as UserRole | undefined;
  return role || "USER"; // Default to USER if no role is set
}

/**
 * Checks if the current user is an admin
 */
export async function isCurrentUserAdmin(): Promise<boolean> {
  const role = await getUserRole();
  return role === "ADMIN";
}

/**
 * Gets a user's role by their Clerk ID
 * Useful for server-to-server operations
 */
export async function getUserRoleByClerkId(clerkId: string): Promise<UserRole | null> {
  try {
    const user = await db.user.findUnique({
      where: { clerkId },
      select: { role: true },
    });
    return (user?.role as UserRole) || null;
  } catch {
    return null;
  }
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
      // Defaults are set in schema: darkMode=false, unitSystem=KG, currency=USD
    },
  });

  return user;
}
