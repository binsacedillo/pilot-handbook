import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
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
const bodySchema = z.object({
  userId: z.string().min(1, "userId is required"),
  role: z.enum(["ADMIN", "PILOT", "USER"]),
});

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

    // Parse and validate request body
    const parsedBody = bodySchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json(
        { error: "Invalid body", details: parsedBody.error.flatten() },
        { status: 400 }
      );
    }

    // Verify admin status against application database (defense in depth)
    const requester = await db.user.findUnique({
      where: { clerkId: userId },
      select: { role: true },
    });

    if (requester?.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Admin access required" },
        { status: 403 }
      );
    }

    const { userId: targetUserId, role } = parsedBody.data;

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
