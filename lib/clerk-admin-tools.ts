import { clerkClient } from "@clerk/nextjs/server";

/**
 * Admin tool to manage user roles via Clerk Backend SDK
 * Use this to update user roles in Clerk's public metadata
 * 
 * This requires a backend secret key and should only be called from protected admin routes
 */

export type UserRole = "ADMIN" | "PILOT" | "USER";

/**
 * Updates a user's role in Clerk public metadata
 * 
 * @param clerkUserId - The Clerk user ID
 * @param role - The new role to assign
 */
export async function setUserRole(clerkUserId: string, role: UserRole) {
  try {
    const client = await clerkClient();
    
    const user = await client.users.updateUser(clerkUserId, {
      publicMetadata: {
        role,
      },
    });

    return {
      success: true,
      userId: user.id,
      role: user.publicMetadata?.role,
    };
  } catch (error) {
    console.error("Error updating user role:", error);
    throw new Error(`Failed to update user role: ${error}`);
  }
}

/**
 * Gets a user's metadata from Clerk
 */
export async function getUserMetadata(clerkUserId: string) {
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(clerkUserId);

    return {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.publicMetadata?.role || "USER",
    };
  } catch (error) {
    console.error("Error fetching user metadata:", error);
    throw new Error(`Failed to fetch user metadata: ${error}`);
  }
}

/**
 * Promotes a user to admin
 */
export async function promoteToAdmin(clerkUserId: string) {
  return setUserRole(clerkUserId, "ADMIN");
}

/**
 * Demotes a user from admin
 */
export async function demoteFromAdmin(clerkUserId: string) {
  return setUserRole(clerkUserId, "USER");
}

/**
 * Sets user role to pilot
 */
export async function setPilotRole(clerkUserId: string) {
  return setUserRole(clerkUserId, "PILOT");
}
