
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";
import { auth } from "@clerk/nextjs/server"; // <--- IMPORT THIS
import { db } from "@/lib/db"; // Ensure this matches your db path

/**
 * 1. CONTEXT
 * This section defines the "contexts" that are available in the backend API.
 */
export const createTRPCContext = async (opts: { headers: Headers }) => {
  // Get the session from Clerk
  const session = await auth();

  return {
    db,
    session, // session is now the resolved object
    ...opts,
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
// This is likely where your 401 is coming from. 
// It checks if session.userId exists.

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  const session = ctx.session;
  if (!session || !session.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: { ...session, user: session.userId },
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

  // 2. (Optional) Check for Admin Role
  // If you store roles in Clerk metadata, check it here.
  // const role = session.claims?.metadata?.role;
  // if (role !== 'admin') { throw new TRPCError({ code: "FORBIDDEN" }); }

  return next({
    ctx: {
      session: { ...session, user: session.userId },
    },
  });
});
