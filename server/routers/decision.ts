import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";

const logSnapshotSchema = z.object({
  type: z.enum(['DENSITY_ALTITUDE', 'WEIGHT_BALANCE', 'FUEL']),
  aircraftId: z.string().optional().nullable(),
  inputs: z.record(z.string(), z.any()),
  results: z.record(z.string(), z.any()),
  status: z.string(),
  reason: z.string().optional().nullable(),
  recommendation: z.string().optional().nullable(),
});

export const decisionRouter = createTRPCRouter({
  /**
   * Logs a performance/safety calculation snapshot.
   * This provides an audit trail for liability and safety tracking.
   */
  logSnapshot: protectedProcedure
    .input(logSnapshotSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User session required" });
      }

      try {
        const snapshot = await ctx.db.safetySnapshot.create({
          data: {
            type: input.type,
            userId: ctx.user.id,
            aircraftId: input.aircraftId,
            inputs: input.inputs,
            results: input.results,
            status: input.status,
            reason: input.reason,
            recommendation: input.recommendation,
          },
        });

        return { success: true, id: snapshot.id };
      } catch (error) {
        console.error("Failed to log safety snapshot:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Could not save safety snapshot",
        });
      }
    }),

  /**
   * Retrieves snapshots for the current user.
   */
  getHistory: protectedProcedure
    .input(z.object({ limit: z.number().min(1).max(50).default(10) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.user) return [];

      return ctx.db.safetySnapshot.findMany({
        where: { userId: ctx.user.id },
        orderBy: { calculatedAt: 'desc' },
        take: input.limit,
      });
    }),
});
