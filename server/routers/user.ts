import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        userPreferences: true,
      },
    });
    return user;
  }),

  // Get or create user (called on sign-in)
  getOrCreate: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }
    
    let user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        userPreferences: true,
      },
    });

    const clerkUser = await currentUser();
    const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
    const clerkFirstName = clerkUser?.firstName ?? null;
    const clerkLastName = clerkUser?.lastName ?? null;

    if (!user) {
      // This shouldn't happen since protectedProcedure creates user
      // But just in case, return ctx.user
      return ctx.user;
    } else if (!user.firstName || !user.lastName || !user.email) {
      // User exists but is missing name/email - update from Clerk
      user = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          email: user.email || clerkEmail,
          firstName: user.firstName || clerkFirstName,
          lastName: user.lastName || clerkLastName,
        },
        include: {
          userPreferences: true,
        },
      });
    }

    return user;
  }),

  // Check server health
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date() };
  }),

  // Update user profile (name and license)
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1, 'First name required').optional(),
        lastName: z.string().min(1, 'Last name required').optional(),
        license: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }
      const user = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          firstName: input.firstName,
          lastName: input.lastName,
          license: input.license,
        },
        include: {
          userPreferences: true,
        },
      });
      return user;
    }),
});
