import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.user },
      include: {
        userPreferences: true,
      },
    });
    return user;
  }),

  // Get or create user (called on sign-in)
  getOrCreate: protectedProcedure.query(async ({ ctx }) => {
    let user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.user },
      include: {
        userPreferences: true,
      },
    });

    const clerkUser = await currentUser();
    const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
    const clerkFirstName = clerkUser?.firstName ?? null;
    const clerkLastName = clerkUser?.lastName ?? null;

    if (!user) {
      // User doesn't exist yet, create from Clerk
      user = await ctx.db.user.create({
        data: {
          clerkId: ctx.session.user,
          email: clerkEmail,
          firstName: clerkFirstName,
          lastName: clerkLastName,
        },
        include: {
          userPreferences: true,
        },
      });
    } else if (!user.firstName || !user.lastName || !user.email) {
      // User exists but is missing name/email - update from Clerk
      user = await ctx.db.user.update({
        where: { clerkId: ctx.session.user },
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
      const user = await ctx.db.user.update({
        where: { clerkId: ctx.session.user },
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
