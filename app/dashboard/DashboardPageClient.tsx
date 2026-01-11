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
  const { isLoaded } = useUser();
  const { isLoading: isStatsLoading, data: stats } = trpc.flight.getStats.useQuery();
  const { isLoading: isSummaryLoading } = trpc.stats.getSummary.useQuery();
  const { isLoading: isAircraftLoading, data: aircraft } = trpc.aircraft.getAll.useQuery();
  const { isLoading: isFlightsLoading, data: flights } = trpc.flight.getAll.useQuery({});
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
            {isLoading ? (
              <DashboardSkeleton />
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <DashboardStatusCards />
                </div>
                <DashboardClient initialStats={stats} initialFlights={flights} initialAircraft={aircraft} />
              </>
            )}
          </div>
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
