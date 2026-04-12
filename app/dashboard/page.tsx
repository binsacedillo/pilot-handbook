import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import DashboardPageClient from "./DashboardPageClient";
import { api, createTRPCContext } from "@/trpc/server";
import { headers } from "next/headers";
import { Suspense } from "react";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";

export default async function Page() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  // Create tRPC caller for the server
  const trpc = api(await createTRPCContext({ 
    req: { 
      headers: await headers() 
    } as any 
  }));

  // Round now to the minute for stable query keys (ISO 9241-11 compliance)
  const stableNow = new Date().toISOString().split(':').slice(0, 2).join(':') + ':00.000Z';

  // Parallel prefetching on the server
  const [initialStats, initialSummary, initialAircraft, initialFlights, initialUpcoming] = await Promise.all([
    trpc.flight.getStats().catch(() => null),
    trpc.stats.getSummary().catch(() => null),
    trpc.aircraft.getAll().catch(() => []),
    trpc.flight.getRecent({ limit: 6 }).catch(() => []),
    trpc.flight.getUpcoming({ now: stableNow }).catch(() => null),
  ]);

  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardPageClient 
        initialData={{
          stats: initialStats,
          summary: initialSummary,
          aircraft: initialAircraft,
          flights: initialFlights,
          upcoming: initialUpcoming,
        }}
      />
    </Suspense>
  );
}