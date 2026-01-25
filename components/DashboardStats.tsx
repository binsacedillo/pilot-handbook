import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/trpc/client";

export function DashboardStats() {
    // Queries
    const { data: stats, isLoading: statsLoading } = trpc.flight.getStats.useQuery();
    const { data: summary, isLoading: summaryLoading } = trpc.stats.getSummary.useQuery();
    const { data: aircraft, isLoading: aircraftLoading } = trpc.aircraft.getAll.useQuery();

    // Loading states
    const loading = statsLoading || summaryLoading || aircraftLoading;

    // Stat values
    const isCurrent = stats?.recency?.isCurrent;
    const last90DaysLandings = stats?.recency?.last90DaysLandings ?? 0;
    const totalHours = summary?.totalHours ?? 0;
    const fleetCount = aircraft?.length ?? 0;

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            {/* Pilot Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Pilot Status</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-4 w-30 mb-2" />
                    ) : (
                        <Badge variant={isCurrent ? "success" : "default"}>
                            {isCurrent ? "Active / Current" : "Not Current"}
                        </Badge>
                    )}
                    <div className="mt-2 text-sm text-muted-foreground">
                        {loading ? (
                            <Skeleton className="h-4 w-20" />
                        ) : (
                            `${last90DaysLandings}/3 Landings`
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Total Flight Time Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Total Flight Time</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-4 w-25" />
                    ) : (
                        <span className="text-2xl font-semibold">{totalHours} Hrs</span>
                    )}
                </CardContent>
            </Card>

            {/* Active Fleet Card */}
            <Card>
                <CardHeader>
                    <CardTitle>Active Fleet</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <Skeleton className="h-4 w-20" />
                    ) : (
                        <span className="text-2xl font-semibold">{fleetCount} Aircraft</span>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
