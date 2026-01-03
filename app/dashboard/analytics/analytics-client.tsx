"use client";

import { trpc } from "@/trpc/client";
import type { RouterOutputs } from "@/src/trpc/shared";
import BackButton from "@/components/BackToDashboardButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

// 1. Infer Types (The "Future Proof" way)
type StatsData = RouterOutputs["flight"]["getStats"];
// Add other types if you need them (e.g. FlightLogs or Aircraft)

interface Props {
  initialStats: StatsData;
}

export function AnalyticsClient({ initialStats }: Props) {
  // 2. Use Initial Data for instant load + live updates
  const { data: stats } = trpc.flight.getStats.useQuery(undefined, {
    initialData: initialStats,
  });

  return (
    <div className="space-y-6 max-w-xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <BackButton />
      </div>
      {/* Analytics Card */}
      <Card>
        <CardHeader>
          <CardTitle>Total Flight Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-semibold">{stats?.totalHours?.toFixed(1) ?? "0.0"} Hrs</div>
        </CardContent>
      </Card>
      {/* Add more analytics/charts here as needed */}
    </div>
  );
}
