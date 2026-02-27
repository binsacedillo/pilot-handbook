import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { UnitSystem, Theme } from '@prisma/client';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const defaultPreferences = {
  theme: Theme.SYSTEM,
  unitSystem: UnitSystem.METRIC,
  currency: 'USD' as const,
  defaultAircraftId: null as string | null,
  favoriteAirport: 'KJFK' as string | null,
};

const updatePreferencesSchema = z.object({
  theme: z.nativeEnum(Theme).optional(),
  unitSystem: z.nativeEnum(UnitSystem).optional(),
  currency: z.string().min(1).optional(),
  defaultAircraftId: z.string().optional().nullable(),
  favoriteAirport: z.string().min(4).max(4).toUpperCase().optional().nullable(),
});

export const preferencesRouter = createTRPCRouter({
  getPreferences: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
    }

    const prefs = await ctx.db.userPreferences.findUnique({
      where: { userId: ctx.user.id },
    });

    return prefs ?? defaultPreferences;
  }),

  updatePreferences: protectedProcedure
    .input(updatePreferencesSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }

      // Update Clerk public metadata for theme/units (Read-Modify-Write, Clerk v6 compliant)
      try {
        // Only run on server
        const { clerkClient } = await import('@clerk/nextjs/server');
        const client = await clerkClient();
        const userId = ctx.session.userId || "";
        const user = await client.users.getUser(userId);
        const currentMeta = user.publicMetadata || {};
        const mergedMeta = {
          ...currentMeta,
          theme: input.theme,
          unitSystem: input.unitSystem,
        };
        await client.users.updateUser(userId, {
          publicMetadata: mergedMeta,
        });
      } catch (err) {
        // Log but don't block
        if (process.env.NODE_ENV !== 'test') {
          console.error('Failed to update Clerk metadata:', err);
        }
      }

      return ctx.db.userPreferences.upsert({
        where: { userId: ctx.user.id },
        update: input,
        create: {
          userId: ctx.user.id,
          theme: input.theme ?? defaultPreferences.theme,
          unitSystem: input.unitSystem ?? defaultPreferences.unitSystem,
          currency: input.currency ?? defaultPreferences.currency,
          defaultAircraftId: input.defaultAircraftId ?? defaultPreferences.defaultAircraftId,
          favoriteAirport: input.favoriteAirport ?? 'KJFK',
        },
      });
    }),
});
