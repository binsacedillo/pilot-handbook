import "server-only";
import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";

/**
 * Gets the current authenticated user from the database
 * Use this in server components to access the logged-in user
 */
export async function getCurrentUser() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  return await db.user.findUnique({
    where: { clerkId: userId },
  });
}

/**
 * Gets the current user and redirects to sign-in if not authenticated
 * Use this for protected pages that require authentication
 */
export async function requireAuth() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  return user;
}

/**
 * Ensures the current user is an admin or redirects
 */
export async function requireAdmin() {
  const user = await requireAuth();
  
  const clerkUser = await currentUser();
  const clerkRole = clerkUser?.publicMetadata?.role as string | undefined;
  
  // Check both Clerk metadata AND database role
  // This handles cases where webhook hasn't fired yet or session is cached
  const isAdminInClerk = clerkRole === "ADMIN";
  const isAdminInDb = user?.role === "ADMIN";
  
  if (!isAdminInClerk && !isAdminInDb) {
    redirect("/dashboard");
  }
  
  return clerkUser;
}

/**
 * Convenience helper to check admin role (server-only)
 * Checks both Clerk metadata and database for redundancy
 */
export async function isAdmin() {
  const { userId } = await auth();
  
  if (!userId) {
    return false;
  }
  
  // Check Clerk metadata
  const clerkUser = await currentUser();
  const clerkRole = clerkUser?.publicMetadata?.role as string | undefined;
  
  if (clerkRole === "ADMIN") {
    return true;
  }
  
  // Fallback to database check (in case webhook hasn't fired or session is cached)
  const dbUser = await db.user.findUnique({
    where: { clerkId: userId },
    select: { role: true },
  });
  
  return dbUser?.role === "ADMIN";
}

/**
 * Gets the current user with their flights
 */
export async function getCurrentUserWithFlights() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  return await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      flights: {
        orderBy: { date: "desc" },
      },
    },
  });
}

/**
 * Gets the current user with their aircraft
 */
export async function getCurrentUserWithAircraft() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  return await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      aircraft: {
        orderBy: { createdAt: "desc" },
      },
    },
  });
}

/**
 * Gets the current user with all relations (flights, aircraft, preferences)
 */
export async function getCurrentUserFull() {
  const { userId } = await auth();
  
  if (!userId) {
    return null;
  }

  return await db.user.findUnique({
    where: { clerkId: userId },
    include: {
      flights: {
        orderBy: { date: "desc" },
      },
      aircraft: {
        orderBy: { createdAt: "desc" },
      },
      userPreferences: true,
    },
  });
}
