"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane, Clock, TrendingUp } from "lucide-react";
import AppHeader from "../../components/AppHeader";
import AppFooter from "../../components/AppFooter";
import { WeatherWidget } from "@/components/WeatherWidget";
import type { RouterOutputs } from "@/src/trpc/shared";
import { trpc } from "@/src/trpc/client";
import { useState } from "react";

type StatsData = RouterOutputs["flight"]["getStats"];
type FlightsData = RouterOutputs["flight"]["getAll"];
type AircraftData = RouterOutputs["aircraft"]["getAll"];

interface DashboardClientProps {
    initialStats: StatsData;
    initialFlights: FlightsData;
    initialAircraft: AircraftData;
}

function DashboardClient({ initialStats, initialFlights, initialAircraft }: DashboardClientProps) {
    const { data: aircraft } = trpc.aircraft.getAll.useQuery(undefined, { initialData: initialAircraft });
    const [customIcao, setCustomIcao] = useState<string | null>(null);
    
    // Get favorite airport weather (default)
    const { data: favoriteMetar, isLoading: favoriteLoading, error: favoriteError } = 
        trpc.weather.getFavoriteAirportMetar.useQuery(undefined, {
            enabled: !customIcao, // Only fetch when no custom ICAO is set
            keepPreviousData: true, // Keep showing previous data while loading
            staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
            cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
            refetchOnWindowFocus: false, // Don't refetch when user returns to tab
            refetchOnReconnect: false, // Don't refetch on network reconnect
            refetchInterval: 15 * 60 * 1000, // Auto-refresh every 15 minutes only
        });
    
    // Get custom airport weather (when user searches)
    const { data: customMetar, isLoading: customLoading, error: customError } = 
        trpc.weather.getMetar.useQuery(
            { icao: customIcao! },
            { 
                enabled: !!customIcao, // Only fetch when custom ICAO is set
                keepPreviousData: true, // Keep showing previous data while loading
                staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
                cacheTime: 30 * 60 * 1000, // Keep in cache for 30 minutes
                refetchOnWindowFocus: false, // Don't refetch when user returns to tab
                refetchOnReconnect: false, // Don't refetch on network reconnect
                refetchInterval: 15 * 60 * 1000, // Auto-refresh every 15 minutes only
            }
        );
    
    const flights = initialFlights;
    const stats = initialStats;

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
                
                {/* Stats Cards */}
                <section aria-label="Flight Statistics" className="mb-8">
                    {/* Mobile: Simple List View */}
                    <Card className="sm:hidden">
                        <CardContent className="p-4">
                            <h3 className="text-sm font-semibold text-muted-foreground mb-3">Flight Statistics</h3>
                            <div className="space-y-3">
                                <div className="flex items-center justify-between py-2 border-b">
                                    <div className="flex items-center gap-2">
                                        <Plane className="h-4 w-4 text-blue-500" />
                                        <span className="text-sm">Aircraft</span>
                                    </div>
                                    <span className="text-lg font-bold">{aircraft?.length ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="h-4 w-4 text-green-500" />
                                        <span className="text-sm">Total Flights</span>
                                    </div>
                                    <span className="text-lg font-bold">{stats.totalFlights ?? 0}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <div className="flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-orange-500" />
                                        <span className="text-sm">Flight Hours</span>
                                    </div>
                                    <span className="text-lg font-bold">{stats.totalHours?.toFixed(1) ?? "0.0"}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm">PIC Hours</span>
                                    <span className="text-lg font-bold">{stats.totalPicHours?.toFixed(1) ?? "0.0"}</span>
                                </div>
                                <div className="flex items-center justify-between py-2 border-b">
                                    <span className="text-sm">Dual Hours</span>
                                    <span className="text-lg font-bold">{stats.totalDualHours?.toFixed(1) ?? "0.0"}</span>
                                </div>
                                <div className="flex items-center justify-between py-2">
                                    <span className="text-sm">Total Landings</span>
                                    <span className="text-lg font-bold">{stats.totalLandings ?? 0}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Tablet & Desktop: Grid Cards */}
                    <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Plane className="h-4 w-4 text-blue-500" />
                                    <CardTitle className="text-sm">Aircraft</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{aircraft?.length ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" />
                                    <CardTitle className="text-sm">Flights</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalFlights ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">Total</p>
                            </CardContent>
                        </Card>

                        <Card className="sm:col-span-2 lg:col-span-1">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Clock className="h-4 w-4 text-orange-500" />
                                    <CardTitle className="text-sm">Flight Hours</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalHours?.toFixed(1) ?? "0.0"}</div>
                                <p className="text-xs text-muted-foreground mt-1">hrs</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">PIC</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalPicHours?.toFixed(1) ?? "0.0"}</div>
                                <p className="text-xs text-muted-foreground mt-1">hrs</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Dual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalDualHours?.toFixed(1) ?? "0.0"}</div>
                                <p className="text-xs text-muted-foreground mt-1">hrs</p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm">Landings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{stats.totalLandings ?? 0}</div>
                                <p className="text-xs text-muted-foreground mt-1">total</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Weather Widget */}
                {metar && (
                    <section aria-label="Weather Information" className="mb-8">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold">Airport Weather</h2>
                            {customIcao && (
                                <Button 
                                    size="sm" 
                                    variant="ghost" 
                                    onClick={handleResetToFavorite}
                                    className="text-xs"
                                >
                                    ← Back to favorite
                                </Button>
                            )}
                        </div>
                        <div className="max-w-2xl">
                            <WeatherWidget 
                                metar={metar} 
                                isLoading={metarLoading}
                                error={metarError?.message || null}
                                onAirportChange={handleAirportChange}
                                isFavorite={isFavorite}
                            />
                        </div>
                    </section>
                )}

                {/* Recent Flights */}
                <section aria-label="Recent flights" className="mt-12">
                    <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
                    {flights && flights.length > 0 ? (
                        <div className="space-y-2">
                            {flights.slice(0, 5).map((flight) => (
                                <Card key={flight.id} className="flex-row flex items-center justify-between gap-4 p-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium truncate">{flight.aircraft?.model || "Aircraft"}</div>
                                        <div className="text-sm text-muted-foreground">{new Date(flight.date).toLocaleDateString()}</div>
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
                </section>
            </main>
            <AppFooter />
        </div>
    );
}

export default DashboardClient;
