"use client";

import { trpc } from "@/trpc/client";
import BackButton from "@/components/BackToDashboardButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";

// 1. Infer Types (The "Future Proof" way)
// type MonthData = { month: string; hours: number };
type MonthData = { month: string; hours: number };
type TypeData = { aircraftId: string; aircraftName: string; totalHours: number };
// Add other types if you need them (e.g. FlightLogs or Aircraft)

// No props needed

export function AnalyticsClient() {
  // Data queries
  const { data: summary, isLoading: summaryLoading } = trpc.stats.getSummary.useQuery();
  const { data: hoursByMonth, isLoading: monthLoading } = trpc.stats.getHoursByMonth.useQuery<MonthData[]>();
  const { data: hoursByType, isLoading: typeLoading } = trpc.stats.getHoursByType.useQuery<TypeData[]>();

  // Colors for pie chart
  const COLORS = ["#4F46E5", "#22D3EE", "#F59E42", "#10B981", "#F43F5E", "#6366F1", "#FBBF24"];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analytics</h1>
        <BackButton />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Hours Card */}
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Total Flight Time</CardTitle>
          </CardHeader>
          <CardContent>
            {summaryLoading ? (
              <Skeleton className="h-8 w-32" />
            ) : (
              <div className="text-3xl font-semibold">{summary?.totalHours?.toFixed(1) ?? "0.0"} Hrs</div>
            )}
          </CardContent>
        </Card>
        {/* Bar Chart: Hours by Month */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Flight Hours per Month (Last 12 Months)</CardTitle>
          </CardHeader>
          <CardContent style={{ height: 300 }}>
            {monthLoading ? (
              <Skeleton className="h-full w-full" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hoursByMonth || []} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="hours" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Pie Chart: Hours by Aircraft Type */}
      <Card>
        <CardHeader>
          <CardTitle>Hours by Aircraft Type</CardTitle>
        </CardHeader>
        <CardContent style={{ height: 320 }}>
          {typeLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={hoursByType || []}
                  dataKey="totalHours"
                  nameKey="aircraftName"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ name, percent }) => `${name} (${percent !== undefined ? (percent * 100).toFixed(0) : '0'}%)`}
                >
                  {(hoursByType || []).map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
