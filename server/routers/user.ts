import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.userId },
      include: {
        userPreferences: true,
      },
    });
    return user;
  }),

  // Get or create user (called on sign-in)
  getOrCreate: protectedProcedure.query(async ({ ctx }) => {
    let user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.userId },
      include: {
        userPreferences: true,
      },
    });

    if (!user) {
      // User doesn't exist yet, create from Clerk session
      user = await ctx.db.user.create({
        data: {
          clerkId: ctx.userId,
          email: ctx.auth.sessionClaims?.email as string ?? '',
          firstName: ctx.auth.sessionClaims?.firstName as string ?? null,
          lastName: ctx.auth.sessionClaims?.lastName as string ?? null,
        },
        include: {
          userPreferences: true,
        },
      });

      // Create default preferences
      if (!user.userPreferences) {
        await ctx.db.userPreferences.create({
          data: {
            userId: user.id,
          },
        });
      }
    }

    return user;
  }),

  // Check server health
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date() };
  }),
});
