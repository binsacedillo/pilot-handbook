"use client";



import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
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

    // Fetch aircraft with tRPC, using initialAircraft as initialData
    const { data: aircraft } = trpc.aircraft.getAll.useQuery(undefined, { initialData: initialAircraft });
    const flights = initialFlights;
    const stats = initialStats;

    return (
        <div className="min-h-screen flex flex-col">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 py-8">
                <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
                {/* Stats Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {/* Total Aircraft */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Aircraft</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-semibold">{aircraft?.length ?? 0}</span>
                        </CardContent>
                    </Card>
                    {/* Total Flights */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Flights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-semibold">{stats.totalFlights ?? 0}</span>
                        </CardContent>
                    </Card>
                    {/* Total Hours */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Flight Time</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stats.totalHours?.toFixed(1) ?? "0.0"} Hrs</div>
                            <p className="text-xs text-muted-foreground mb-4">
                                +2.5% from last month
                            </p>
                            <Button asChild className="w-full" variant="outline">
                                <Link href="/dashboard/analytics">
                                    View Full Analytics
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                    {/* PIC Hours */}
                    <Card>
                        <CardHeader>
                            <CardTitle>PIC Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-semibold">{stats.totalPicHours?.toFixed(1) ?? "0.0"}</span>
                        </CardContent>
                    </Card>
                    {/* Dual Hours */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Dual Hours</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-semibold">{stats.totalDualHours?.toFixed(1) ?? "0.0"}</span>
                        </CardContent>
                    </Card>
                    {/* Landings */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Landings</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <span className="text-3xl font-semibold">{stats.totalLandings ?? 0}</span>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Flights */}
                <div>
                    <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
                    {flights && flights.length > 0 ? (
                        <div className="space-y-2">
                            {flights.slice(0, 5).map((flight) => (
                                <Card key={flight.id} className="flex-row flex items-center gap-4 p-4">
                                    <div className="flex-1">
                                        <div className="font-medium">{flight.aircraft?.model || "Aircraft"}</div>
                                        <div className="text-sm text-muted-foreground">{new Date(flight.date).toLocaleDateString()} &middot; {flight.duration} hrs</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-lg font-semibold">-</span>
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

export default DashboardClient;
