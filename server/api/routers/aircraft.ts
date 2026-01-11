import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { TRPCError } from "@trpc/server";

export const aircraftRouter = createTRPCRouter({
  toggleArchive: protectedProcedure
    .input(z.object({ id: z.string(), isArchived: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const updated = await ctx.db.aircraft.update({
        where: { id: input.id },
        data: { isArchived: input.isArchived },
      });
      return updated;
    }),

  deleteAircraft: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Count flights associated with this aircraft
      const count = await ctx.db.flight.count({
        where: { aircraftId: input.id },
      });
      if (count > 0) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "Cannot delete aircraft with active flight logs. Please archive it instead.",
        });
      }
      // Safe to delete
      return ctx.db.aircraft.delete({
        where: { id: input.id },
      });
    }),

  getAll: protectedProcedure
    .input(z.object({ includeArchived: z.boolean().optional() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.aircraft.findMany({
        where: input?.includeArchived ? {} : { isArchived: false },
        orderBy: { createdAt: "desc" },
      });
    }),
});
