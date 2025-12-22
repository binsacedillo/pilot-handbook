import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { setUserRole } from "@/lib/clerk-admin-tools";

/**
 * POST /api/admin/set-role
 * Updates a user's role (admin-only)
 * 
 * Body:
 * {
 *   "userId": "user_...",
 *   "role": "ADMIN" | "PILOT" | "USER"
 * }
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check admin role from Clerk public metadata
    const clerkUser = await currentUser();
    const adminRole = clerkUser?.publicMetadata?.role as string | undefined;
    if (adminRole !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { userId: targetUserId, role } = body;

    if (!targetUserId || !role) {
      return NextResponse.json(
        { error: "Missing userId or role" },
        { status: 400 }
      );
    }

    if (!["ADMIN", "PILOT", "USER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 }
      );
    }

    // Update user role
    const result = await setUserRole(targetUserId, role);

    return NextResponse.json({
      success: true,
      message: `User ${targetUserId} role updated to ${role}`,
      result,
    });
  } catch (error) {
    console.error("Error in set-role endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
