"use client";

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plane, Clock, TrendingUp } from "lucide-react";
import AppHeader from "../../components/AppHeader";
import AppFooter from "../../components/AppFooter";
import type { RouterOutputs } from "@/src/trpc/shared";
import { trpc } from "@/src/trpc/client";

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
    const flights = initialFlights;
    const stats = initialStats;

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
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                        {/* Total Aircraft */}
                        <Card role="status" aria-live="polite" aria-label="Total aircraft count">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <Plane className="h-4 w-4 text-blue-500" aria-hidden="true" />
                                    <CardTitle className="text-xs sm:text-sm">Aircraft</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl sm:text-3xl font-semibold" aria-describedby="aircraft-label">{aircraft?.length ?? 0}</span>
                                <p id="aircraft-label" className="text-xs text-muted-foreground mt-1">Total</p>
                            </CardContent>
                        </Card>

                        {/* Total Flights */}
                        <Card role="status" aria-live="polite" aria-label="Total flights count">
                            <CardHeader className="pb-2">
                                <div className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4 text-green-500" aria-hidden="true" />
                                    <CardTitle className="text-xs sm:text-sm">Flights</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl sm:text-3xl font-semibold" aria-describedby="flights-label">{stats.totalFlights ?? 0}</span>
                                <p id="flights-label" className="text-xs text-muted-foreground mt-1">Total</p>
                            </CardContent>
                        </Card>

                        {/* Total Hours */}
                        <Card role="status" aria-live="polite" aria-label="Total flight hours" className="sm:col-span-2 lg:col-span-1">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-xs sm:text-sm font-medium">Flight Hours</CardTitle>
                                <Clock className="h-4 w-4 text-orange-500" aria-hidden="true" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl sm:text-3xl font-bold">{stats.totalHours?.toFixed(1) ?? "0.0"}</div>
                                <p className="text-xs text-muted-foreground mt-1">hrs</p>
                            </CardContent>
                        </Card>

                        {/* PIC Hours */}
                        <Card role="status" aria-live="polite" aria-label="Pilot in command hours">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs sm:text-sm">PIC</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl sm:text-3xl font-semibold">{stats.totalPicHours?.toFixed(1) ?? "0.0"}</span>
                                <p className="text-xs text-muted-foreground mt-1">hrs</p>
                            </CardContent>
                        </Card>

                        {/* Dual Hours */}
                        <Card role="status" aria-live="polite" aria-label="Dual instruction hours">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs sm:text-sm">Dual</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl sm:text-3xl font-semibold">{stats.totalDualHours?.toFixed(1) ?? "0.0"}</span>
                                <p className="text-xs text-muted-foreground mt-1">hrs</p>
                            </CardContent>
                        </Card>

                        {/* Landings */}
                        <Card role="status" aria-live="polite" aria-label="Total landings">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-xs sm:text-sm">Landings</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <span className="text-2xl sm:text-3xl font-semibold">{stats.totalLandings ?? 0}</span>
                                <p className="text-xs text-muted-foreground mt-1">total</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

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
