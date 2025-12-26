import { createTRPCRouter } from '../trpc';
import { flightRouter } from './flight';
import { aircraftRouter } from './aircraft';
import { userRouter } from './user';
import { adminRouter } from './admin';
import { preferencesRouter } from './preferences';
import { statsRouter } from './stats';

/**
 * Main tRPC router
 * All routers should be added here
 */
export const appRouter = createTRPCRouter({
  flight: flightRouter,
  aircraft: aircraftRouter,
  user: userRouter,
  admin: adminRouter,
  preferences: preferencesRouter,
  stats: statsRouter,
});

// Export type definition of the API
export type AppRouter = typeof appRouter;
