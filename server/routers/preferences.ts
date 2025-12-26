import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { UnitSystem, Theme } from '@prisma/client';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const defaultPreferences = {
  theme: Theme.SYSTEM,
  unitSystem: UnitSystem.METRIC,
  currency: 'USD' as const,
  defaultAircraftId: null as string | null,
};

const updatePreferencesSchema = z.object({
  theme: z.nativeEnum(Theme).optional(),
  unitSystem: z.nativeEnum(UnitSystem).optional(),
  currency: z.string().min(1).optional(),
  defaultAircraftId: z.string().optional().nullable(),
});

export const preferencesRouter = createTRPCRouter({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { clerkId: ctx.session.user },
      select: { id: true },
    });

    if (!user) {
      throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
    }

    const prefs = await ctx.db.userPreferences.findUnique({
      where: { userId: user.id },
    });

    return prefs ?? defaultPreferences;
  }),

  updatePreferences: protectedProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.db.user.findUnique({
        where: { clerkId: ctx.session.user },
        select: { id: true, clerkId: true },
      });

      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }

      // Update Clerk public metadata for theme/units
      try {
        // Only run on server
        const { clerkClient } = await import('@clerk/nextjs/server');
        await clerkClient.users.updateUser(user.clerkId, {
          publicMetadata: {
            theme: input.theme,
            unitSystem: input.unitSystem,
          },
        });
      } catch (err) {
        // Log but don't block
        console.error('Failed to update Clerk metadata:', err);
      }

      return ctx.db.userPreferences.upsert({
        where: { userId: user.id },
        update: input,
        create: {
          userId: user.id,
          theme: input.theme ?? defaultPreferences.theme,
          unitSystem: input.unitSystem ?? defaultPreferences.unitSystem,
          currency: input.currency ?? defaultPreferences.currency,
          defaultAircraftId: input.defaultAircraftId ?? defaultPreferences.defaultAircraftId,
        },
      });
    }),
});
