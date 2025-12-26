"use client";



import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { trpc } from "@/trpc/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useUser();
  const router = useRouter();

  // Always call all hooks unconditionally
  const userQuery = trpc.user.getOrCreate.useQuery(undefined, { enabled: !!isSignedIn });
  const flightsQuery = trpc.flight.getAll.useQuery(undefined, { enabled: !!isSignedIn });
  const aircraftQuery = trpc.aircraft.getAll.useQuery(undefined, { enabled: !!isSignedIn });
  const statsQuery = trpc.flight.getStats.useQuery(undefined, { enabled: !!isSignedIn });

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.replace("/sign-in");
    }
  }, [isLoaded, isSignedIn, router]);

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  }

  if (!isSignedIn) {
    // Redirect handled by useEffect
    return null;
  }

  // Loading and error states
  const isLoading = userQuery.isLoading || flightsQuery.isLoading || aircraftQuery.isLoading || statsQuery.isLoading;
  const isError = userQuery.isError || flightsQuery.isError || aircraftQuery.isError || statsQuery.isError;

  if (isError) {
    return (
      <div className="min-h-screen flex flex-col">
        <AppHeader />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-red-600 font-semibold text-lg mb-2">Error loading dashboard data.</div>
          <button className="text-blue-600 underline" onClick={() => window.location.reload()}>Retry</button>
        </div>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {/* Total Flights */}
          <Card>
            <CardHeader>
              <CardTitle>Total Flights</CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <span className="text-3xl font-semibold">{statsQuery.data?.totalFlights ?? 0}</span>}
            </CardContent>
          </Card>
          {/* Total Hours */}
          <Card>
            <CardHeader>
              <CardTitle>Total Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <span className="text-3xl font-semibold">{statsQuery.data?.totalHours?.toFixed(1) ?? "0.0"}</span>}
            </CardContent>
          </Card>
          {/* PIC Hours */}
          <Card>
            <CardHeader>
              <CardTitle>PIC Hours</CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <span className="text-3xl font-semibold">{statsQuery.data?.totalPicHours?.toFixed(1) ?? "0.0"}</span>}
            </CardContent>
          </Card>
          {/* Landings */}
          <Card>
            <CardHeader>
              <CardTitle>Landings</CardTitle>
            </CardHeader>
            <CardContent>
              {statsQuery.isLoading ? <Skeleton className="h-8 w-20" /> : <span className="text-3xl font-semibold">{statsQuery.data?.totalLandings ?? 0}</span>}
            </CardContent>
          </Card>
        </div>

        {/* Recent Flights */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
          {flightsQuery.isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : flightsQuery.data && flightsQuery.data.length > 0 ? (
            <div className="space-y-2">
              {flightsQuery.data.slice(0, 5).map((flight: any) => (
                <Card key={flight.id} className="flex-row flex items-center gap-4 p-4">
                  <div className="flex-1">
                    <div className="font-medium">{flight.aircraft?.name || "Aircraft"}</div>
                    <div className="text-sm text-muted-foreground">{new Date(flight.date).toLocaleDateString()} &middot; {flight.duration} hrs</div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-semibold">{flight.route || "-"}</span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-muted-foreground">No flights found.</div>
          )}
        </div>
      </main>
      <AppFooter />
    </div>
  );
}
