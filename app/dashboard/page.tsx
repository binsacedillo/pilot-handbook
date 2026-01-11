
import { getCurrentUserFull } from "@/lib/auth";
import { redirect } from "next/navigation";
import DashboardClient from "./dashboard-client";
import type { RouterOutputs } from "@/src/trpc/shared";

export default async function Page() {
  // 1. Ensure user is authenticated and exists in database
  const user = await getCurrentUserFull();
  
  if (!user) {
    redirect("/sign-in");
  }

  // 2. Use the user's relations directly instead of calling tRPC
  const flights = user.flights || [];
  const aircraft = user.aircraft || [];

  // 3. Calculate stats from user data
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
    recency: {
      last90DaysFlights: 0,
      last90DaysLandings: 0,
      isCurrent: false,
    },
  };

  // 4. Pass data to client component with proper aircraft relations (filter out nulls)
  const flightsWithAircraft: RouterOutputs["flight"]["getAll"] = flights
    .map((f) => {
      const foundAircraft = aircraft.find((a) => a.id === f.aircraftId);
      if (!foundAircraft) return null;
      return {
        ...f,
        aircraft: foundAircraft,
      };
    })
    .filter((f): f is NonNullable<typeof f> => f !== null);
  return <DashboardClient initialStats={stats} initialFlights={flightsWithAircraft} initialAircraft={aircraft} />;
}