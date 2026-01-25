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


