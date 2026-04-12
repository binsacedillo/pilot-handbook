"use client";


import { Plane, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStatusCards({ 
    initialData 
}: { 
    initialData: {
        stats: any;
        summary: any;
        aircraft: any;
    }
}) {
    const { data: flightStats, isLoading: isFlightLoading } = trpc.flight.getStats.useQuery(undefined, {
        initialData: initialData.stats,
        refetchOnMount: false,
        staleTime: 1000 * 60,
    });
    const { data: generalStats, isLoading: isSummaryLoading } = trpc.stats.getSummary.useQuery(undefined, {
        initialData: initialData.summary,
        refetchOnMount: false,
        staleTime: 1000 * 60,
    });
    const { data: aircraft, isLoading: isAircraftLoading } = trpc.aircraft.getAll.useQuery(undefined, {
        initialData: initialData.aircraft,
        refetchOnMount: false,
        staleTime: 1000 * 60,
    });

    // Data
    const isCurrent = flightStats?.compliance?.isCurrentForPassengers;
    const last90DaysLandings = flightStats?.compliance?.totalLandingsLast90Days ?? 0;
    const totalHours = generalStats?.totalHours ?? 0;
    const fleetCount = aircraft?.length ?? 0;
    
    // Improved loading logic: Only show skeleton if NO data is available (even via initialData)
    const statsLoading = isFlightLoading && !flightStats;
    const summaryLoading = isSummaryLoading && !generalStats;
    const aircraftLoading = isAircraftLoading && !aircraft;

    return (
        <>
            {/* Legality Indicator Card */}
            <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border-2 border-blue-400 dark:border-blue-500 shadow hover-lift transition-all duration-300">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mb-1">
                    <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Legality Status</span>
                {statsLoading ? (
                    <div className="h-7 w-40 my-1 shimmer-premium rounded animate-pulse" />
                ) : isCurrent === true ? (
                    <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-green-600 text-white shadow-sm transition-all duration-500 fade-in">
                        ✅ CURRENT / LEGAL TO FLY
                    </span>
                ) : isCurrent === false ? (
                    <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-red-600 text-white shadow-sm transition-all duration-500 fade-in">
                        ❌ NOT CURRENT / LOG LANDINGS
                    </span>
                ) : (
                    <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-zinc-400 text-white shadow-sm transition-all duration-500 fade-in">
                        CURRENCY: UNKNOWN
                    </span>
                )}
                {statsLoading ? (
                    <div className="h-6 w-28 mt-1 shimmer-premium rounded animate-pulse" />
                ) : (
                    <span className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-100 fade-in">{last90DaysLandings} <span className="text-xs font-normal text-zinc-500">/ 3 Landings</span></span>
                )}
            </div>

            {/* Total Experience Card */}
            <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border-2 border-blue-400 dark:border-blue-500 shadow hover-lift transition-all duration-300">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mb-1">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Total Experience</span>
                {summaryLoading ? (
                    <div className="h-10 w-24 my-1 shimmer-premium rounded animate-pulse" />
                ) : (
                    <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight fade-in">{totalHours} <span className="text-base font-normal text-zinc-500">Hrs</span></span>
                )}
            </div>

            {/* Fleet Size Card */}
            <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border-2 border-blue-400 dark:border-blue-500 shadow hover-lift transition-all duration-300">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 mb-1">
                    <Plane className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Total Fleet</span>
                {aircraftLoading ? (
                    <div className="h-10 w-16 my-1 shimmer-premium rounded animate-pulse" />
                ) : (
                    <Link href="/aircraft" className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 hover:underline fade-in">
                        {fleetCount}
                        <span className="text-base font-normal text-zinc-500 ml-1">Aircraft</span>
                    </Link>
                )}
            </div>
        </>
    );
}
