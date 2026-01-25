import { createTRPCRouter } from '../trpc';
import { t } from '../trpc';
import { flightRouter } from './flight';
import { aircraftRouter } from './aircraft';
import { userRouter } from './user';
import { adminRouter } from './admin';
import { preferencesRouter } from './preferences';
import { statsRouter } from './stats';
import { weatherRouter } from './weather';

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
  weather: weatherRouter,
});

// Export type definition of the API
export const createCaller = t.createCallerFactory(appRouter);
export type AppRouter = typeof appRouter;
