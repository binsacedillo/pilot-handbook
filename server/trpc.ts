import { initTRPC, TRPCError } from '@trpc/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import superjson from 'superjson';
import { ZodError } from 'zod';

/**
 * Create tRPC context
 * This runs for every request and provides auth & db to all procedures
 */
export const createTRPCContext = async () => {
  const session = await auth();
  const userId = session?.userId ?? null;
  
  // Fetch user from database if authenticated
  let user = null;
  if (userId) {
    user = await db.user.findUnique({
      where: { clerkId: userId },
      select: { id: true, email: true, role: true, firstName: true, lastName: true },
    });
  }
  
  return {
    db,
    auth: session,
    userId,
    user,
  };
};

/**
 * Initialize tRPC with context
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
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
 * Export reusable router and procedure helpers
 */
export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

/**
 * Protected procedure - requires authentication
 */
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  
  return next({
    ctx: {
      ...ctx,
      userId: ctx.userId, // Type-safe userId (non-null)
    },
  });
});

/**
 * Admin-only procedure - requires authentication and admin role
 * Checks role from database User model
 */
const enforceUserIsAdmin = t.middleware(({ ctx, next }) => {
  if (!ctx.user || ctx.user.role !== 'ADMIN') {
    throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Admin access required' });
  }

  return next({
    ctx: {
      // infers the `user` as non-nullable with ADMIN role
      user: ctx.user,
    },
  });
});

export const adminProcedure = protectedProcedure.use(enforceUserIsAdmin);
