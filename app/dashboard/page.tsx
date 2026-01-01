
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";
import DashboardClient from "./dashboard-client";

export default async function Page() {
  // 1. Create tRPC context for the server (headers must be a valid Headers object)
  const context = await createTRPCContext({ headers: new Headers() });
  const caller = appRouter.createCaller(context);

  // 2. Fetch data using tRPC server helpers

  const [flights, aircraft] = await Promise.all([
    caller.flight.getAll({}),
    caller.aircraft.getAll(),
  ]);


  // 3. Calculate stats as before
  const totalFlights = flights.length;
  const totalHours = flights.reduce((sum, f) => sum + (f.duration || 0), 0);
  const totalPicHours = flights.reduce((sum, f) => sum + (f.picTime || 0), 0);
  const totalDualHours = flights.reduce((sum, f) => sum + (f.dualTime || 0), 0);
  const totalLandings = flights.reduce((sum, f) => sum + (f.landings || 0), 0);

  const stats = {
    totalFlights,
    totalHours,
    totalPicHours,
    totalDualHours,
    totalLandings,
  };

  // 4. Pass data to client component with new prop names
  return <DashboardClient initialStats={stats} initialFlights={flights} initialAircraft={aircraft} />;
}