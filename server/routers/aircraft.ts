import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { idSchema } from '@/src/lib/shared-schemas';

export const aircraftRouter = createTRPCRouter({
  // Get all aircraft for the current user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const aircraft = await ctx.db.aircraft.findMany({
      where: { userId: ctx.userId },
      orderBy: { createdAt: 'desc' },
    });
    return aircraft;
  }),

  // Get a single aircraft by ID
  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      const aircraft = await ctx.db.aircraft.findFirst({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });
      return aircraft;
    }),

  // Create a new aircraft
  create: protectedProcedure
    .input(
      z.object({
        make: z.string().min(1),
        model: z.string().min(1),
        registration: z.string().min(1),
        imageUrl: z.string().url().optional(),
        status: z.string().default('operational'),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const aircraft = await ctx.db.aircraft.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
      });
      return aircraft;
    }),

  // Update an aircraft
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        make: z.string().min(1).optional(),
        model: z.string().min(1).optional(),
        registration: z.string().min(1).optional(),
        imageUrl: z.string().url().optional(),
        status: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      const aircraft = await ctx.db.aircraft.updateMany({
        where: {
          id,
          userId: ctx.userId,
        },
        data,
      });

      return aircraft;
    }),

  // Delete an aircraft
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const aircraft = await ctx.db.aircraft.deleteMany({
        where: {
          id: input.id,
          userId: ctx.userId,
        },
      });

      return aircraft;
    }),
});
