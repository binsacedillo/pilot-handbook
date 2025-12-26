'use client';

import { useQuery } from '@tanstack/react-query';
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { trpc } from '@/trpc/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';

// Colors for pie chart
const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function AnalyticsPage() {
    // Fetch stats from tRPC
    const hoursByTypeQuery = trpc.stats.getHoursByType.useQuery();
    const hoursByMonthQuery = trpc.stats.getHoursByMonth.useQuery();
    const summaryQuery = trpc.stats.getSummary.useQuery();

    const isLoading =
        hoursByTypeQuery.isLoading || hoursByMonthQuery.isLoading || summaryQuery.isLoading;

    if (isLoading) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex flex-col gap-4">
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-6 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-40 w-full" />
                </div>
            </div>
        );
    }

    const hoursByType = hoursByTypeQuery.data || [];
    const hoursByMonth = hoursByMonthQuery.data || [];
    const summary = summaryQuery.data;

    return (
        <div className="space-y-6 p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-foreground">Flight Analytics</h1>
                <p className="mt-2 text-muted-foreground">
                    Track your flying experience with detailed statistics and insights.
                </p>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card className="p-6 bg-card text-foreground">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Total Hours</span>
                        <span className="mt-2 text-3xl font-bold text-foreground">
                            {summary?.totalHours.toFixed(1) || 0}h
                        </span>
                    </div>
                </Card>

                <Card className="p-6 bg-card text-foreground">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">Total Flights</span>
                        <span className="mt-2 text-3xl font-bold text-foreground">
                            {summary?.totalFlights || 0}
                        </span>
                    </div>
                </Card>

                <Card className="p-6 bg-card text-foreground">
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-muted-foreground">
                            Average Flight Duration
                        </span>
                        <span className="mt-2 text-3xl font-bold text-foreground">
                            {summary?.averageFlightHours || 0}h
                        </span>
                    </div>
                </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Bar Chart - Hours by Month */}
                <Card className="p-6 bg-card text-foreground">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">
                        Hours by Month (Last 12 Months)
                    </h2>
                    {hoursByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={hoursByMonth}
                                margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fontSize: 12 }}
                                    stroke="var(--muted-foreground)"
                                />
                                <YAxis
                                    tick={{ fontSize: 12 }}
                                    stroke="var(--muted-foreground)"
                                    label={{ value: 'Hours', angle: -90, position: 'insideLeft' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'var(--foreground)',
                                    }}
                                    formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : Number(value).toFixed(1)}h`}
                                />
                                <Bar
                                    dataKey="hours"
                                    fill="#3b82f6"
                                    radius={[8, 8, 0, 0]}
                                    isAnimationActive={true}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            No flight data available
                        </div>
                    )}
                </Card>

                {/* Pie Chart - Hours by Aircraft Type */}
                <Card className="p-6 bg-card text-foreground">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">
                        Hours by Aircraft Type
                    </h2>
                    {hoursByType.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={hoursByType}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={({ payload }) => {
                                        if (!payload) return '';
                                        const hours = typeof payload.totalHours === 'number' ? payload.totalHours.toFixed(1) : 0;
                                        return `${payload.aircraftName}: ${hours}h`;
                                    }}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="totalHours"
                                    animationDuration={500}
                                >
                                    {hoursByType.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${typeof value === 'number' ? value.toFixed(1) : Number(value).toFixed(1)}h`} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center py-12 text-muted-foreground">
                            No aircraft data available
                        </div>
                    )}
                </Card>
            </div>

            {/* Aircraft Breakdown Table */}
            {hoursByType.length > 0 && (
                <Card className="p-6 bg-card text-foreground">
                    <h2 className="mb-4 text-xl font-semibold text-foreground">
                        Aircraft Breakdown
                    </h2>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-border">
                                    <th className="px-4 py-2 text-left text-sm font-semibold text-foreground">
                                        Aircraft
                                    </th>
                                    <th className="px-4 py-2 text-right text-sm font-semibold text-foreground">
                                        Hours
                                    </th>
                                    <th className="px-4 py-2 text-right text-sm font-semibold text-foreground">
                                        Percentage
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {hoursByType.map((item, index) => {
                                    const totalHours = hoursByType.reduce((sum, a) => sum + a.totalHours, 0);
                                    const percentage =
                                        totalHours > 0 ? ((item.totalHours / totalHours) * 100).toFixed(1) : 0;
                                    return (
                                        <tr key={item.aircraftId} className="border-b border-border">
                                            <td className="px-4 py-3 text-sm text-foreground">
                                                <div className="flex items-center gap-2">
                                                    <div
                                                        className="h-3 w-3 rounded-full"
                                                        style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                    />
                                                    {item.aircraftName}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-foreground">
                                                {item.totalHours.toFixed(1)}h
                                            </td>
                                            <td className="px-4 py-3 text-right text-sm text-foreground">
                                                {percentage}%
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </Card>
            )}
        </div>
    );
}
