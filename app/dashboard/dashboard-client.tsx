"use client";

import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import EmptyState from "@/components/common/EmptyState";
import type { RouterOutputs } from "@/trpc/shared";
import { trpc } from "@/trpc/client";
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

import RecentFlightsSkeleton from "@/components/dashboard/RecentFlightsSkeleton";

function DashboardClient({ initialStats, initialFlights, initialAircraft }: DashboardClientProps) {
    const { user, isLoaded } = useUser();
    const utils = trpc.useUtils();
    
    // Live queries for aircraft, stats, and flights
    const enabled = !!user && isLoaded;
    
    const {
        data: aircraftLive,
        isLoading: isAircraftLoading
    } = trpc.aircraft.getAll.useQuery(
        undefined,
        {
            initialData: initialAircraft,
            enabled,
            refetchOnMount: false,
            staleTime: 1000 * 60,
        }
    );
    
    const {
        data: statsLive,
        isLoading: isStatsLoading
    } = trpc.flight.getStats.useQuery(
        undefined,
        {
            initialData: initialStats,
            enabled,
            refetchOnMount: false,
            staleTime: 1000 * 60,
        }
    );
    
    const {
        data: flightsLive,
        isLoading: isFlightsLoading
    } = trpc.flight.getRecent.useQuery(
        { limit: 6 },
        {
            initialData: initialFlights,
            enabled,
            refetchOnMount: false,
            staleTime: 1000 * 60,
        }
    );

    const [customIcao, setCustomIcao] = useState<string | null>(null);
    
    // Get favorite airport weather (default)
    const { data: favoriteMetar, isLoading: favoriteLoading, error: favoriteError } =
        trpc.weather.getFavoriteAirportMetar.useQuery(undefined, {
            enabled: !customIcao && isLoaded,
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
                enabled: !!customIcao && isLoaded,
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

    // Granular loading states
    const isFlightsSectionLoading = isFlightsLoading && !flightsLive;

    // Fallbacks for data: prioritize live data, fallback to initialData, then empty
    const safeAircraft = aircraftLive ?? initialAircraft ?? [];
    const safeStats = statsLive ?? initialStats ?? {};
    const safeFlights: FlightsData = (flightsLive ?? initialFlights ?? []) as FlightsData;

    // If Clerk is not loaded, we still show the layout but with component-level skeletons
    // handled by the checks below. This removes the "full page jump".

    // --- Two-column layout: main (flights/stats) and sidebar (weather) ---
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content: Recent Flights and (optionally) other stats */}
            <div className="lg:col-span-2">
                <div className="bg-card rounded-xl border-2 border-orange-500 dark:border-orange-400 shadow p-6">
                    <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
                    {isFlightsSectionLoading ? (
                        <RecentFlightsSkeleton />
                    ) : safeFlights && safeFlights.length > 0 ? (
                        <div className="space-y-2">
                            {safeFlights.slice(0, 5).map((flight) => (
                                <Card key={flight.id} className="flex-row flex items-center justify-between gap-4 p-4 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors">
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

                <div className="mt-8 bg-card rounded-xl border-2 border-blue-500 dark:border-blue-400 shadow p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">Operational Tools</h2>
                        <Link href="/tools">
                            <Button size="sm" variant="outline">View All Tools</Button>
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Link href="/tools/performance" className="group p-4 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors bg-slate-50/50 dark:bg-slate-900/50">
                            <h3 className="font-bold group-hover:text-blue-600 transition-colors">Performance Calculator</h3>
                            <p className="text-sm text-muted-foreground mt-1 text-balance">Check Density Altitude and Pressure Altitude for your flight.</p>
                        </Link>
                        <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 opacity-60 bg-slate-50/50 dark:bg-slate-900/50">
                            <div className="flex justify-between items-start">
                                <h3 className="font-bold">Weight & Balance</h3>
                                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 bg-accent rounded text-accent-foreground">Soon</span>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">Interactive CG calculator for various aircraft models.</p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Sidebar: Weather Widget */}
            <div className="min-w-0">
                <WeatherWidget
                    metar={metar || null}
                    isLoading={metarLoading}
                    error={metarError?.message || null}
                    onAirportChange={handleAirportChange}
                    onResetToFavorite={customIcao ? handleResetToFavorite : undefined}
                    isFavorite={isFavorite}
                />
            </div>
        </div>
    );
}

export default DashboardClient;
