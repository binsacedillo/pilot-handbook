import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { setUserRole } from "@/lib/clerk-admin-tools";
import { rateLimit, getRateLimitKey } from "@/lib/rate-limit";

/**
 * POST /api/admin/set-role
 * Updates a user's role (admin-only)
 * Rate limited to 20 requests per minute per IP
 * Max body size: 5KB
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

// Request size limit: 5KB
const MAX_BODY_SIZE = 5 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Enforce request body size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_BODY_SIZE) {
      return NextResponse.json(
        { error: "Request body too large (max 5KB)" },
        { status: 413 }
      );
    }

    // Rate limit: 20 role changes per minute per IP
    const key = getRateLimitKey(request);
    const rateResult = rateLimit(key, 20, 60000);

    if (!rateResult.success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429, headers: { 'Retry-After': String(Math.ceil((rateResult.resetTime - Date.now()) / 1000)) } }
      );
    }

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
    if (error instanceof Error && error.message.includes('payload')) {
      return NextResponse.json(
        { error: "Request body too large" },
        { status: 413 }
      );
    }
    console.error("Error in set-role endpoint:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
