"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AppHeader from "../../components/AppHeader";
import AppFooter from "../../components/AppFooter";
import { WeatherWidget } from "@/components/WeatherWidget";
import type { RouterOutputs } from "@/src/trpc/shared";
import { trpc } from "@/src/trpc/client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

type StatsData = RouterOutputs["flight"]["getStats"];
type FlightsData = RouterOutputs["flight"]["getAll"];
type AircraftData = RouterOutputs["aircraft"]["getAll"];

interface DashboardClientProps {
    initialStats: StatsData;
    initialFlights: FlightsData;
    initialAircraft: AircraftData;
}

function DashboardClient({ initialStats, initialFlights, initialAircraft }: DashboardClientProps) {
    const { user, isLoaded } = useUser();
    const utils = trpc.useUtils();
    // Live queries for aircraft, stats, and flights
    const {
        data: aircraftLive,
        isRefetching: isAircraftRefetching,
        isLoading: isAircraftLoading
    } = trpc.aircraft.getAll.useQuery(
        undefined,
        {
            initialData: initialAircraft,
            enabled: isLoaded && !!user,
            refetchOnMount: "always",
            staleTime: 0,
        }
    );
    const {
        data: statsLive,
        isRefetching: isStatsRefetching,
        isLoading: isStatsLoading
    } = trpc.flight.getStats.useQuery(
        undefined,
        {
            initialData: initialStats,
            enabled: isLoaded && !!user,
            refetchOnMount: "always",
            staleTime: 0,
        }
    );
    const {
        data: flightsLive,
        isRefetching: isFlightsRefetching,
        isLoading: isFlightsLoading
    } = trpc.flight.getAll.useQuery(
        {},
        {
            initialData: initialFlights,
            enabled: isLoaded && !!user,
            refetchOnMount: "always",
            staleTime: 0,
        }
    );
    // Debug log for live tRPC data
    console.log("Live tRPC Data:", {
        aircraft: aircraftLive,
        stats: statsLive,
        flights: flightsLive
    });
    // Invalidate dashboard stats on mount for navigation sync
    useEffect(() => {
        if (isLoaded) {
            utils.flight.getStats.invalidate();
        }
    }, [isLoaded, utils.flight.getStats]);
    const [customIcao, setCustomIcao] = useState<string | null>(null);
    // Get favorite airport weather (default)
    const { data: favoriteMetar, isLoading: favoriteLoading, error: favoriteError } = 
        trpc.weather.getFavoriteAirportMetar.useQuery(undefined, {
            enabled: !customIcao,
            placeholderData: (prev) => prev,
            staleTime: 10 * 60 * 1000,
            gcTime: 30 * 60 * 1000,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false,
            refetchInterval: 15 * 60 * 1000,
        });
    // Get custom airport weather (when user searches)
    const { data: customMetar, isLoading: customLoading, error: customError } = 
        trpc.weather.getMetar.useQuery(
            { icao: customIcao! },
            { 
                enabled: !!customIcao,
                placeholderData: (prev) => prev,
                staleTime: 10 * 60 * 1000,
                gcTime: 30 * 60 * 1000,
                refetchOnWindowFocus: false,
                refetchOnReconnect: false,
                refetchInterval: 15 * 60 * 1000,
            }
        );

    // Determine which METAR to display
    const metar = customIcao ? customMetar : favoriteMetar;
    // Only show loading if we don't have any data yet
    const metarLoading = (customIcao ? customLoading : favoriteLoading) && !metar;
    const metarError = customIcao ? customError : favoriteError;
    const isFavorite = !customIcao;

    const handleAirportChange = (icao: string) => {
        setCustomIcao(icao);
    };

    const handleResetToFavorite = () => {
        setCustomIcao(null);
    };

    // UI: show skeletons or refreshing state
    const isRefreshing = isAircraftRefetching || isStatsRefetching || isFlightsRefetching;
    const isLoading = isAircraftLoading || isStatsLoading || isFlightsLoading;

    // Fallbacks for data: prioritize live data, fallback to initialData, then empty
    const safeAircraft = aircraftLive ?? initialAircraft ?? [];
    const safeStats = statsLive ?? initialStats ?? {};
    const safeFlights = flightsLive ?? initialFlights ?? [];

    // Aviation Stat Card values
    const isCurrent = safeStats?.recency?.isCurrent;
    const last90DaysLandings = safeStats?.recency?.last90DaysLandings ?? 0;
    const totalHours = safeStats?.totalHours ?? 0;
    const fleetCount = safeAircraft?.length ?? 0;

    // If Clerk is not loaded, show skeletons only
    if (!isLoaded) {
        return (
            <div className="min-h-screen flex flex-col">
                <AppHeader />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                            <Link href="/dashboard/analytics">View analytics</Link>
                        </Button>
                    </div>
                    <section aria-label="Flight Statistics" className="mb-8">
                        <Card className="sm:hidden">
                            <CardContent className="p-4">
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                                    <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                                    <div className="h-6 bg-muted rounded w-1/4 mb-2" />
                                    <div className="h-6 bg-muted rounded w-1/4 mb-2" />
                                    <div className="h-6 bg-muted rounded w-1/4" />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="h-24 animate-pulse bg-muted" />
                            ))}
                        </div>
                    </section>
                    <section className="mt-12 grid gap-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
                            <div className="space-y-2 animate-pulse">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Card key={i} className="h-16 bg-muted" />
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
                <AppFooter />
            </div>
        );
    }

    // If essential data is missing, show skeletons
    if (!safeStats || !safeAircraft || !safeFlights) {
        return (
            <div className="min-h-screen flex flex-col">
                <AppHeader />
                <main className="flex-1 container mx-auto px-4 py-8">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                        <h1 className="text-2xl font-bold">Dashboard</h1>
                        <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                            <Link href="/dashboard/analytics">View analytics</Link>
                        </Button>
                    </div>
                    <section aria-label="Flight Statistics" className="mb-8">
                        <Card className="sm:hidden">
                            <CardContent className="p-4">
                                <div className="space-y-3 animate-pulse">
                                    <div className="h-6 bg-muted rounded w-1/2 mb-2" />
                                    <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                                    <div className="h-6 bg-muted rounded w-1/4 mb-2" />
                                    <div className="h-6 bg-muted rounded w-1/4 mb-2" />
                                    <div className="h-6 bg-muted rounded w-1/4" />
                                </div>
                            </CardContent>
                        </Card>
                        <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <Card key={i} className="h-24 animate-pulse bg-muted" />
                            ))}
                        </div>
                    </section>
                    <section className="mt-12 grid gap-6">
                        <div>
                            <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
                            <div className="space-y-2 animate-pulse">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Card key={i} className="h-16 bg-muted" />
                                ))}
                            </div>
                        </div>
                    </section>
                </main>
                <AppFooter />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
                    <h1 className="text-2xl font-bold">Dashboard</h1>
                    <Button asChild size="sm" variant="outline" className="w-full sm:w-auto">
                        <Link href="/dashboard/analytics">View analytics</Link>
                    </Button>
                </div>
                {/* Aviation Stat Cards */}
                <section aria-label="Aviation Stats" className="mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Pilot Currency Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Pilot Currency</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading || isRefreshing ? (
                                    <div className="h-6 w-32 bg-muted rounded animate-pulse mb-2" />
                                ) : (
                                    <span className={`inline-block px-3 py-1 rounded font-semibold text-white text-sm ${isCurrent ? "bg-green-500" : "bg-red-500"}`}>
                                        {isCurrent ? "CURRENT" : "NOT CURRENT"}
                                    </span>
                                )}
                                <div className="mt-2 text-sm text-muted-foreground">
                                    {isLoading || isRefreshing ? (
                                        <div className="h-4 w-20 bg-muted rounded animate-pulse" />
                                    ) : (
                                        `${last90DaysLandings}/3 landings in 90 days`
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                        {/* Total Experience Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Total Experience</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading || isRefreshing ? (
                                    <div className="h-6 w-25 bg-muted rounded animate-pulse" />
                                ) : (
                                    <span className="text-2xl font-semibold">{totalHours} Hrs</span>
                                )}
                            </CardContent>
                        </Card>
                        {/* Fleet Size Card */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Fleet Size</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {isLoading || isRefreshing ? (
                                    <div className="h-6 w-20 bg-muted rounded animate-pulse" />
                                ) : (
                                    <span className="text-2xl font-semibold">{fleetCount} Aircraft</span>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </section>
                {/* Recent Flights + Weather */}
                <section
                    aria-label="Recent flights and weather"
                    className={`mt-12 grid gap-6 ${metar ? "lg:grid-cols-[minmax(0,1.7fr)_minmax(320px,1fr)]" : ""}`}
                >
                    <div>
                        <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
                        {isLoading || isRefreshing ? (
                            <div className="space-y-2 animate-pulse">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Card key={i} className="h-16 bg-muted" />
                                ))}
                            </div>
                        ) : safeFlights && safeFlights.length > 0 ? (
                            <div className="space-y-2">
                                {safeFlights.slice(0, 5).map((flight) => (
                                    <Card key={flight.id} className="flex-row flex items-center justify-between gap-4 p-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="font-medium truncate">{flight.aircraft?.model || "Aircraft"}</div>
                                            <div className="text-sm text-muted-foreground">{flight.date ? new Date(flight.date).toLocaleDateString() : ""}</div>
                                        </div>
                                        <div className="text-right whitespace-nowrap">
                                            <span className="text-sm font-semibold">{flight.duration ?? 0} hrs</span>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="text-muted-foreground">No flights found.</div>
                        )}
                    </div>
                    {metar && (
                        <div className="min-w-0">
                            <WeatherWidget
                                metar={metar}
                                isLoading={metarLoading}
                                error={metarError?.message || null}
                                onAirportChange={handleAirportChange}
                                onResetToFavorite={customIcao ? handleResetToFavorite : undefined}
                                isFavorite={isFavorite}
                            />
                        </div>
                    )}
                </section>
            </main>
            <AppFooter />
        </div>
    );
}

export default DashboardClient;
