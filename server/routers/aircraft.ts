import { TRPCError } from '@trpc/server';
import { Aircraft } from '@prisma/client';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { idSchema, createAircraftSchema, updateAircraftSchema, createAircraftCommandSchema, updateAircraftCommandSchema, deleteAircraftCommandSchema } from '@/lib/shared-schemas';
import { createAuditLog } from '@/lib/audit-logger';
import { CommandService } from '../services/command-service';

export const aircraftRouter = createTRPCRouter({
  // Restore (unarchive) an aircraft
  restore: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }

      // Fetch aircraft before restoring for audit trail
      const aircraftToRestore = await ctx.db.aircraft.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          make: true,
          model: true,
          registration: true,
          userId: true,
        },
      });

      if (!aircraftToRestore || aircraftToRestore.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Aircraft not found or unauthorized',
        });
      }

      const aircraft = await ctx.db.aircraft.update({
        where: {
          id: input.id,
          userId: ctx.user.id, // Security Check!
        },
        data: {
          isArchived: false,
        },
      });

      // Audit log: Aircraft restoration
      await createAuditLog({
        userId: ctx.user.id,
        action: 'RESTORE',
        entityType: 'Aircraft',
        entityId: input.id,
        oldValues: { isArchived: true },
        newValues: { isArchived: false },
        changes: `Restored aircraft: ${aircraftToRestore.make} ${aircraftToRestore.model} (${aircraftToRestore.registration})`,
      });

      return aircraft;
    }),
  // Get all aircraft for the current user
  getAll: protectedProcedure
    .input(
      // Optional input: includeArchived (default false)
      z.object({ includeArchived: z.boolean().optional() }).optional()
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.user || !ctx.user.id) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User ID missing in context' });
      }
      const includeArchived = input?.includeArchived ?? false;
      const aircraft = await ctx.db.aircraft.findMany({
        where: {
          userId: ctx.user.id,
          ...(includeArchived ? {} : { isArchived: false }),
        },
        select: {
          id: true,
          registration: true,
          make: true,
          model: true,
          status: true,
          imageUrl: true,
          isArchived: true,
          flightHours: true,
          version: true,
        },
        orderBy: { createdAt: 'desc' },
      });
      return aircraft;
    }),

  // Get a single aircraft by ID
  getById: protectedProcedure
    .input(idSchema)
    .query(async ({ ctx, input }) => {
      if (!ctx.user) {
        return null;
      }

      const aircraft = await ctx.db.aircraft.findFirst({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });
      return aircraft;
    }),

  // Create a new aircraft (Refactored to Command Pattern)
  create: protectedProcedure
    .input(createAircraftCommandSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
      }

      return CommandService.createAircraft(ctx.db, ctx.user.id, input) as Promise<Aircraft>;
    }),

  // Update an aircraft (Refactored to Command Pattern)
  update: protectedProcedure
    .input(updateAircraftCommandSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }

      return CommandService.updateAircraft(ctx.db, ctx.user.id, input) as Promise<Aircraft>;
    }),

  // Archive (soft delete) an aircraft (Refactored to Command Pattern)
  delete: protectedProcedure
    .input(deleteAircraftCommandSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found' });
      }

      return CommandService.deleteAircraft(ctx.db, ctx.user.id, input) as Promise<Aircraft>;
    }),

  // Permanent delete with safety check
  deletePermanent: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }
      // Count flights associated with this aircraft
      const flightCount = await ctx.db.flight.count({
        where: {
          aircraftId: input.id,
          userId: ctx.user.id,
        },
      });
      if (flightCount > 0) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Cannot permanently delete an aircraft with active flight logs. Please archive it instead.',
        });
      }
      // No flights, safe to delete
      const deleted = await ctx.db.aircraft.delete({
        where: {
          id: input.id,
          userId: ctx.user.id,
        },
      });
      return deleted;
    }),
});
