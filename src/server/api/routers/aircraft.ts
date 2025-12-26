import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/trpc";
import { db } from "@/lib/db";

export const aircraftRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // List all aircraft for the current user
    const userId = ctx.session?.user;
    if (!userId) throw new Error("Unauthorized");
    return db.aircraft.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
  }),

  create: protectedProcedure
    .input(
      z.object({
        make: z.string(),
        model: z.string(),
        registration: z.string(),
        imageUrl: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user;
      if (!userId) throw new Error("Unauthorized");
      return db.aircraft.create({
        data: {
          ...input,
          userId,
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        status: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session?.user;
      if (!userId) throw new Error("Unauthorized");
      // Only allow updating status for user's own aircraft
      return db.aircraft.update({
        where: { id: input.id, userId },
        data: { status: input.status },
      });
    }),
});
