import { aircraftRouter } from "@/server/routers/aircraft";

export const appRouter = {
  aircraft: aircraftRouter,
};

export type AppRouter = typeof appRouter;
