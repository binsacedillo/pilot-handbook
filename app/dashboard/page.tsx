
import { appRouter } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";
import { requireAuth } from "@/lib/auth";
import DashboardClient from "./dashboard-client";

export default async function Page() {
  // 0. Ensure user is authenticated and exists in database
  await requireAuth();

  // 1. Create tRPC context for the server with a valid Request object
  const context = await createTRPCContext({ req: new Request("http://localhost:3000") });
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