
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth, currentUser } from "@clerk/nextjs/server"; // <--- IMPORT THIS
import { db } from "@/lib/db"; // Ensure this matches your db path
import { deriveRoleFromClerkUser } from "@/lib/admin-config";

/**
 * 1. CONTEXT
 * This section defines the "contexts" that are available in the backend API.
 */
export const createTRPCContext = async (opts: { req: Request }) => {
  // Get the session from Clerk
  const { userId } = await auth();

  return {
    db,
    session: {
      userId: userId || null,
    },
    headers: opts.req.headers,
  };
};

/**
 * 2. INITIALIZATION
 */
export const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * 3. ROUTER & PROCEDURE (Helpers)
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

// PROTECTED PROCEDURE
// Fetches or creates the user in the database
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = ctx.session;
  if (!session || !session.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // Fetch user from database
  let user = await ctx.db.user.findUnique({
    where: { clerkId: session.userId },
    select: { id: true, role: true, email: true },
  });

  // Create user if doesn't exist
  if (!user) {
    const clerk = await currentUser();
    if (!clerk) {
      throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found in Clerk" });
    }

    const email = clerk.emailAddresses?.[0]?.emailAddress ?? "";
    const role = deriveRoleFromClerkUser(clerk);
    
    user = await ctx.db.user.create({
      data: {
        clerkId: clerk.id,
        email,
        firstName: clerk.firstName ?? null,
        lastName: clerk.lastName ?? null,
        role,
      },
      select: { id: true, role: true, email: true },
    });
  }

  return next({
    ctx: {
      session,
      user, // Now user is the database user object
    },
  });
});

/**
 * Admin Procedure (Logged in + Admin Role)
 */
export const adminProcedure = t.procedure.use(async ({ ctx, next }) => {
  const session = ctx.session;
  // 1. Ensure user is logged in
  if (!session || !session.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }

  // 2. Fetch user from database to ensure they're an admin
  const user = await ctx.db.user.findUnique({
    where: { clerkId: session.userId },
    select: { id: true, role: true, email: true },
  });

  if (!user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "User not found in database" });
  }

  if (user.role !== "ADMIN") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Admin access required" });
  }

  return next({
    ctx: {
      session,
      user, // Database user object with id, role, email
    },
  });
});
