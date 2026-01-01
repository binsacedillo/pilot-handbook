"use client";

import { api } from "@/trpc/react";
import type { RouterOutputs } from "@/trpc/shared";

// Get the exact Types from your API automatically
type Stats = RouterOutputs["flight"]["getStats"];
type Flights = RouterOutputs["flight"]["getRecent"];

interface Props {
  initialStats: Stats;
  initialFlights: Flights;
}

export function DashboardClient({ initialStats, initialFlights }: Props) {
  // ✅ THE MAGIC: "initialData"
  // 1. It shows 'initialStats' immediately (0ms load time).
  // 2. It stays connected to the server. If you run a mutation later, 
  //    this will automatically refresh!
  const { data: stats } = api.flight.getStats.useQuery(undefined, {
    initialData: initialStats,
  });

  const { data: flights } = api.flight.getRecent.useQuery(undefined, {
    initialData: initialFlights,
  });

  return (
    <div>
      <h1>Total Hours: {stats.totalHours}</h1>
      {/* Flight List... */}
    </div>
  );
}
