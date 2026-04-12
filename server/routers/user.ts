import { TRPCError } from '@trpc/server';
import { createTRPCRouter, protectedProcedure, publicProcedure } from '../trpc';
import { currentUser } from '@clerk/nextjs/server';
import { z } from 'zod';

export const userRouter = createTRPCRouter({
  // Get current user profile with PilotProfile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      return null;
    }
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      include: {
        userPreferences: true,
        pilotProfile: true,
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
        pilotProfile: true,
      },
    });

    const clerkUser = await currentUser();
    const clerkEmail = clerkUser?.emailAddresses?.[0]?.emailAddress ?? '';
    const clerkFirstName = clerkUser?.firstName ?? null;
    const clerkLastName = clerkUser?.lastName ?? null;

    if (!user) {
      // This shouldn't happen since protectedProcedure creates user
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
          pilotProfile: true,
        },
      });
    }

    return user;
  }),

  // Check server health
  health: publicProcedure.query(() => {
    return { status: 'ok', timestamp: new Date() };
  }),

  // Mutation to update the specialized PilotProfile
  updatePilotProfile: protectedProcedure
    .input(
      z.object({
        licenseNumber: z.string().optional(),
        licenseType: z.string().optional(),
        medicalClass: z.number().min(1).max(3).optional(),
        medicalExpiry: z.coerce.date().optional().nullable(),
        lastRestDate: z.coerce.date().optional().nullable(),
        totalHoursGoal: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }
      
      const profile = await ctx.db.pilotProfile.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: {
          ...input,
          userId: ctx.user.id,
        },
      });

      return profile;
    }),

  // Mutation to update basic user name (legacy license field kept for safety)
  updateProfile: protectedProcedure
    .input(
      z.object({
        firstName: z.string().min(1).optional(),
        lastName: z.string().min(1).optional(),
        license: z.string().optional().nullable(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }
      const user = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: input,
        include: {
          userPreferences: true,
          pilotProfile: true,
        },
      });
      return user;
    }),
  
  // Log security events (e.g., inactivity logout) for audit purposes
  logSecurityEvent: protectedProcedure
    .input(
      z.object({
        type: z.enum(['INACTIVITY_LOGOUT', 'HARD_SESSION_LOGOUT', 'MANUAL_LOGOUT']),
        details: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) return null;

      const { createAuditLog } = await import('@/lib/audit-logger');
      
      await createAuditLog({
        userId: ctx.user.id,
        action: 'UPDATE', // Using UPDATE as the closest match for session state changes
        entityType: 'SESSION',
        entityId: ctx.user.id,
        changes: `Security event logged: ${input.type}${input.details ? ` - ${input.details}` : ''}`,
      });

      return { success: true };
    }),
});
