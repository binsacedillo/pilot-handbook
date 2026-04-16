import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { weatherService } from "@/lib/weather-service";

/**
 * Weather Router
 * Handles all TRPC endpoints for aviation weather data.
 * delegates core logic to weatherService.
 */
export const weatherRouter = createTRPCRouter({
  // Public: Get METAR for any 4-letter ICAO airport
  getMetar: publicProcedure
    .input(z.object({ icao: z.string().min(4).max(4).toUpperCase() }))
    .query(async ({ input }) => {
      return await weatherService.getMetar(input.icao);
    }),

  // Protected: Get METAR for user's primary/favorite airport
  getFavoriteAirportMetar: protectedProcedure.query(async ({ ctx }) => {
    try {
      const prefs = await ctx.db.userPreferences.findUnique({
        where: { userId: ctx.user.id },
      });

      const icao = prefs?.favoriteAirport || "KJFK";
      return await weatherService.getMetar(icao);
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      
      if (process.env.NODE_ENV !== 'test') {
        console.error("Favorite airport weather fetch error:", error);
      }
      
      // Safety fallback to New York (JFK)
      return await weatherService.getMetar("KJFK");
    }
  }),

  // Protected: Update user's primary airport
  setFavoriteAirport: protectedProcedure
    .input(z.object({ icao: z.string().min(4).max(4).toUpperCase() }))
    .mutation(async ({ ctx, input }) => {
      // Validate with weather service (pre-cache it)
      await weatherService.getMetar(input.icao);

      // Update or create user record
      const updated = await ctx.db.userPreferences.upsert({
        where: { userId: ctx.user.id },
        update: { favoriteAirport: input.icao },
        create: {
          userId: ctx.user.id,
          favoriteAirport: input.icao,
        },
      });

      return updated;
    }),
});
