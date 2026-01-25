"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AppHeader from "../../components/AppHeader";
import AppFooter from "../../components/AppFooter";
import { WeatherWidget } from "@/components/WeatherWidget";
import EmptyState from "@/components/EmptyState";
import type { RouterOutputs } from "@/src/trpc/shared";
import { trpc } from "@/src/trpc/client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { BookOpen } from "lucide-react";

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
    const enabled = !!user && isLoaded;
    const {
        data: aircraftLive,
        isRefetching: isAircraftRefetching,
        isLoading: isAircraftLoading
    } = trpc.aircraft.getAll.useQuery(
        undefined,
        {
            initialData: initialAircraft,
            enabled,
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
            enabled,
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
            enabled,
            refetchOnMount: "always",
            staleTime: 0,
        }
    );
    // ...existing code...
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

    // --- Two-column layout: main (flights/stats) and sidebar (weather) ---
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content: Recent Flights and (optionally) other stats */}
            <div className="lg:col-span-2">
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
                    <EmptyState
                        icon={<BookOpen className="w-16 h-16 text-muted-foreground" />}
                        title="Welcome to Your Pilot Logbook!"
                        description="Get started by logging your first flight. This tool is designed to help you track your flying experience and stay current."
                        action={{
                            label: "Add Your First Flight",
                            href: "/flights",
                        }}
                    />
                )}
            </div>
            {/* Sidebar: Weather Widget */}
            <div className="min-w-0">
                {metar && (
                    <WeatherWidget
                        metar={metar}
                        isLoading={metarLoading}
                        error={metarError?.message || null}
                        onAirportChange={handleAirportChange}
                        onResetToFavorite={customIcao ? handleResetToFavorite : undefined}
                        isFavorite={isFavorite}
                    />
                )}
            </div>
        </div>
    );
}

export default DashboardClient;
