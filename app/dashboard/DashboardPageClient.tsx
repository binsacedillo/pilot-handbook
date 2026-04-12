"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import DashboardStatusCards from "@/components/dashboard/DashboardStatusCards";
import DashboardClient from "./dashboard-client";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useToast } from "@/components/ui/toast";

export default function DashboardPageClient({ 
  initialData 
}: { 
  initialData: {
    stats: any;
    summary: any;
    aircraft: any;
    flights: any;
  }
}) {
  const { user, isLoaded } = useUser();
  const { showToast } = useToast();
  const [isOffline, setIsOffline] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      setHasMounted(true);
      if (typeof navigator !== "undefined") {
        setIsOffline(!navigator.onLine);
      }
    });

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => {
      setIsOffline(true);
      showToast("You are offline. Some data may be stale until connection is restored.", "info");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [showToast]);

  const enabled = !!user && isLoaded;

  // Use initialData to provide instant updates while revalidating
  const { data: stats, error: statsError, isLoading: isStatsLoading } = trpc.flight.getStats.useQuery(undefined, {
    enabled,
    initialData: initialData.stats,
    refetchOnMount: false, // Use prefetched data
    staleTime: 1000 * 60, // 1 minute
  });

  const { error: summaryError, isLoading: isSummaryLoading } = trpc.stats.getSummary.useQuery(undefined, {
    enabled,
    initialData: initialData.summary,
    refetchOnMount: false,
    staleTime: 1000 * 60,
  });

  const { data: aircraft, error: aircraftError, isLoading: isAircraftLoading } = trpc.aircraft.getAll.useQuery(undefined, {
    enabled,
    initialData: initialData.aircraft,
    refetchOnMount: false,
    staleTime: 1000 * 60,
  });

  const { data: flights, error: flightsError, isLoading: isFlightsLoading } = trpc.flight.getRecent.useQuery({ limit: 6 }, {
    enabled,
    initialData: initialData.flights,
    refetchOnMount: false,
    staleTime: 1000 * 60,
  });

  useEffect(() => {
    const errorMessages: Array<[unknown, string]> = [
      [statsError, "Failed to load stats. Please retry."],
      [summaryError, "Failed to load summary data. Please retry."],
      [aircraftError, "Failed to load aircraft. Please retry."],
      [flightsError, "Failed to load flights. Please retry."],
    ];

    errorMessages.forEach(([error, message]) => {
      if (error) {
        showToast(message, "error");
      }
    });
  }, [aircraftError, flightsError, showToast, statsError, summaryError]);

  // Individual loading flags for granular skeletons
  const isCurrencyLoading = isStatsLoading && !stats;
  const isDashboardContentLoading = !isLoaded;

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col">
      <AppHeader />
      <main id="main-content" className="flex-1 w-full">
        <div className="container mx-auto px-2 md:px-4 py-8">
          {hasMounted && isOffline && (
            <div className="mb-4 rounded-md border border-amber-300 bg-amber-50 text-amber-800 px-4 py-3 text-sm">
              Offline mode: showing cached data. Changes will sync when back online.
            </div>
          )}
          
          <div className="flex flex-col gap-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
              <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                <Link href="/dashboard/analytics">View analytics</Link>
              </Button>
            </div>

            {/* Pilot Currency Status Card Section */}
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
              {isCurrencyLoading ? (
                <div className="w-full max-w-md mx-auto mb-4">
                  <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border-2 border-blue-400 dark:border-blue-500 shadow shimmer">
                    <div className="h-10 w-10 rounded-full bg-accent animate-pulse mb-1" />
                    <div className="h-5 w-32 bg-accent animate-pulse rounded" />
                    <div className="h-8 w-48 my-1 bg-accent animate-pulse rounded" />
                    <div className="h-6 w-24 mt-1 bg-accent animate-pulse rounded" />
                  </div>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="w-full max-w-md mx-auto">
                    <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border-2 border-blue-400 dark:border-blue-500 shadow hover:shadow-lg transition-shadow duration-300">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-full mb-1 ${stats?.compliance?.isCurrentForPassengers ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
                        {stats?.compliance?.isCurrentForPassengers ? (
                          <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        )}
                      </div>
                      <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Pilot Currency</span>
                      {stats?.compliance?.isCurrentForPassengers ? (
                        <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-green-600 text-white shadow-sm">✅ CURRENT / LEGAL TO FLY</span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-red-600 text-white shadow-sm">❌ NOT CURRENT / LOG LANDINGS</span>
                      )}
                      <span className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-100">{stats?.compliance?.totalLandingsLast90Days ?? 0} <span className="text-xs font-normal text-zinc-500">/ 3 Landings</span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <DashboardStatusCards 
                initialData={{
                  stats: initialData.stats,
                  summary: initialData.summary,
                  aircraft: initialData.aircraft
                }} 
              />
            </div>

            {/* Main Dashboard Client Section */}
            <div className="animate-in fade-in duration-700 delay-150">
              <DashboardClient
                initialStats={stats ?? {
                  totalFlights: 0,
                  totalHours: 0,
                  totalPicHours: 0,
                  totalDualHours: 0,
                  totalLandings: 0,
                  compliance: null,
                }}
                initialFlights={flights ?? []}
                initialAircraft={aircraft ?? []}
              />
            </div>
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
