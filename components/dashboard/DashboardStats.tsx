import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/trpc/client";
import { DashboardStatsSkeleton } from "./DashboardStatsSkeleton";

export function DashboardStats() {
    // Queries
    const { data: stats, isLoading: statsLoading } = trpc.flight.getStats.useQuery();
    const { data: summary, isLoading: summaryLoading } = trpc.stats.getSummary.useQuery();
    const { data: aircraft, isLoading: aircraftLoading } = trpc.aircraft.getAll.useQuery();

    // Loading states
    const loading = statsLoading || summaryLoading || aircraftLoading;

    // Stat values
    const isCurrent = stats?.compliance?.isCurrentForPassengers;
    const last90DaysLandings = stats?.compliance?.totalLandingsLast90Days ?? 0;
    const totalHours = summary?.totalHours ?? 0;
    const fleetCount = aircraft?.length ?? 0;

    if (loading) {
        return <DashboardStatsSkeleton />;
    }

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            {/* Pilot Status Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Pilot Status</CardTitle>
                </CardHeader>
                <CardContent>
                    <Badge variant={isCurrent ? "success" : "default"}>
                        {isCurrent ? "Active / Current" : "Not Current"}
                    </Badge>
                    <div className="mt-2 text-sm text-muted-foreground">
                        {`${last90DaysLandings}/3 Landings`}
                    </div>
                </CardContent>
            </Card>

            {/* Total Flight Time Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total Flight Time</CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{totalHours} Hrs</span>
                </CardContent>
            </Card>

            {/* Active Fleet Card */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Active Fleet</CardTitle>
                </CardHeader>
                <CardContent>
                    <span className="text-2xl font-bold">{fleetCount} Aircraft</span>
                </CardContent>
            </Card>
        </div>
    );
}
