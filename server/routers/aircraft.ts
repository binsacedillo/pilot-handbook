import { TRPCError } from '@trpc/server';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { idSchema, createAircraftSchema, updateAircraftSchema } from '@/src/lib/shared-schemas';
import { createAuditLog } from '@/lib/audit-logger';

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

  // Create a new aircraft
  create: protectedProcedure
    .input(createAircraftSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }

      const aircraft = await ctx.db.aircraft.create({
        data: {
          ...input,
          userId: ctx.user.id,
        },
      });

      // Audit log: Aircraft creation
      await createAuditLog({
        userId: ctx.user.id,
        action: 'CREATE',
        entityType: 'Aircraft',
        entityId: aircraft.id,
        newValues: {
          make: aircraft.make,
          model: aircraft.model,
          registration: aircraft.registration,
          status: aircraft.status,
        },
        changes: `Created aircraft: ${aircraft.make} ${aircraft.model} (${aircraft.registration})`,
      });

      return aircraft;
    }),

  // Update an aircraft
  update: protectedProcedure
    .input(updateAircraftSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }

      const { id, ...data } = input;

      // Use update instead of updateMany for better error handling
      const aircraft = await ctx.db.aircraft.update({
        where: {
          id,
          userId: ctx.user.id, // Security Check!
        },
        data,
      });

      return aircraft;
    }),

  // Archive (soft delete) an aircraft
  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'User not found in database' });
      }

      // Fetch aircraft before archiving for audit trail
      const aircraftToDelete = await ctx.db.aircraft.findUnique({
        where: { id: input.id },
        select: {
          id: true,
          make: true,
          model: true,
          registration: true,
          status: true,
          userId: true,
        },
      });

      if (!aircraftToDelete || aircraftToDelete.userId !== ctx.user.id) {
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'Aircraft not found or unauthorized',
        });
      }

      // Soft delete: set isArchived to true
      const aircraft = await ctx.db.aircraft.update({
        where: {
          id: input.id,
          userId: ctx.user.id, // Security Check!
        },
        data: {
          isArchived: true,
        },
      });

      // Audit log: Aircraft archive/deletion
      await createAuditLog({
        userId: ctx.user.id,
        action: 'DELETE',
        entityType: 'Aircraft',
        entityId: input.id,
        oldValues: {
          make: aircraftToDelete.make,
          model: aircraftToDelete.model,
          registration: aircraftToDelete.registration,
          isArchived: false,
        },
        newValues: {
          isArchived: true,
        },
        changes: `Archived aircraft: ${aircraftToDelete.make} ${aircraftToDelete.model} (${aircraftToDelete.registration})`,
      });

      return aircraft;
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
