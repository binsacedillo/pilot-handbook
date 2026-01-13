"use client";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/src/trpc/client";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import DashboardStatusCards from "@/components/DashboardStatusCards";
import DashboardClient from "./dashboard-client";
import DashboardSkeleton from "@/components/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DashboardPageClient() {
  const { user, isLoaded } = useUser();
  const enabled = !!user && isLoaded;
  const { isLoading: isStatsLoading, data: stats } = trpc.flight.getStats.useQuery(undefined, {
    enabled,
    refetchOnMount: "always",
    staleTime: 0,
  });
  const { isLoading: isSummaryLoading } = trpc.stats.getSummary.useQuery(undefined, {
    enabled,
    refetchOnMount: "always",
    staleTime: 0,
  });
  const { isLoading: isAircraftLoading, data: aircraft } = trpc.aircraft.getAll.useQuery(undefined, {
    enabled,
    refetchOnMount: "always",
    staleTime: 0,
  });
  const { isLoading: isFlightsLoading, data: flights } = trpc.flight.getAll.useQuery({}, {
    enabled,
    refetchOnMount: "always",
    staleTime: 0,
  });
  const isLoading = isStatsLoading || isSummaryLoading || isAircraftLoading || isFlightsLoading || !isLoaded;

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col">
      <AppHeader />
      <main className="flex-1 w-full">
        <div className="container mx-auto px-2 md:px-4 py-8">
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-2xl font-bold text-white">Dashboard</h1>
              <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                <Link href="/dashboard/analytics">View analytics</Link>
              </Button>
            </div>
            {/* Pilot Currency Status Card */}
            {isLoading ? (
              <>
                {/* Pilot Currency Skeleton */}
                <div className="w-full max-w-md mx-auto mb-4">
                  <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-1 animate-pulse" />
                    <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Pilot Currency</span>
                    <div className="h-7 w-40 my-1 bg-accent animate-pulse rounded" />
                    <div className="h-6 w-28 mt-1 bg-accent animate-pulse rounded" />
                  </div>
                </div>
                {/* Full Dashboard Skeleton */}
                <DashboardSkeleton />
              </>
            ) : (
              <>
                {/* Pilot Currency Status Card */}
                <div className="mb-4">
                  <div className="w-full max-w-md mx-auto">
                    <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-1 ${stats?.recency?.isCurrent ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                        {stats?.recency?.isCurrent ? (
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                      </div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Pilot Currency</span>
                      {stats?.recency?.isCurrent ? (
                        <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-green-600 text-white">✅ CURRENT / LEGAL TO FLY</span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-red-600 text-white">❌ NOT CURRENT / LOG LANDINGS</span>
                      )}
                      <span className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-100">{stats?.recency?.last90DaysLandings ?? 0} <span className="text-xs font-normal text-zinc-500">/ 3 Landings</span></span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <DashboardStatusCards />
                </div>
                <DashboardClient
                  initialStats={stats ?? {
                    totalFlights: 0,
                    totalHours: 0,
                    totalPicHours: 0,
                    totalDualHours: 0,
                    totalLandings: 0,
                    recency: {
                      last90DaysFlights: 0,
                      last90DaysLandings: 0,
                      isCurrent: false,
                    },
                  }}
                  initialFlights={flights ?? []}
                  initialAircraft={aircraft ?? []}
                />
              </>
            )}
          </div>
          </div>
      </main>
      <AppFooter />
    </div>
  );
}
