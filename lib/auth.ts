import "server-only";
import { auth } from "@clerk/nextjs/server";
import { db } from "./db";
import { redirect } from "next/navigation";
import { isCurrentUserAdmin } from "./clerk-roles";

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
 * Uses the authoritative role check from clerk-roles.ts
 */
export async function requireAdmin() {
  await requireAuth();
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect("/dashboard");
  }
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
