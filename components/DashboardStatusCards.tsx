"use client";


import { Plane, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/src/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStatusCards() {
    const { data: flightStats, isLoading: isFlightLoading } = trpc.flight.getStats.useQuery(undefined, {
        refetchOnMount: "always",
        staleTime: 0,
    });
    const { data: generalStats, isLoading: isSummaryLoading } = trpc.stats.getSummary.useQuery(undefined, {
        refetchOnMount: "always",
        staleTime: 0,
    });
    const { data: aircraft, isLoading: isAircraftLoading } = trpc.aircraft.getAll.useQuery(undefined, {
        refetchOnMount: "always",
        staleTime: 0,
    });

    // Data
    const isCurrent = flightStats?.recency?.isCurrent;
    const last90DaysLandings = flightStats?.recency?.last90DaysLandings ?? 0;
    const totalHours = generalStats?.totalHours ?? 0;
    const fleetCount = aircraft?.length ?? 0;
    const loading = isFlightLoading || isSummaryLoading || isAircraftLoading;

    return (
        <>
            {/* Legality Indicator Card */}
            <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-1">
                    <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Legality Status</span>
                {loading ? (
                    <Skeleton className="h-7 w-40 my-1" />
                ) : isCurrent === true ? (
                    <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-green-600 text-white">
                        ✅ CURRENT / LEGAL TO FLY
                    </span>
                ) : isCurrent === false ? (
                    <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-red-600 text-white">
                        ❌ NOT CURRENT / LOG LANDINGS
                    </span>
                ) : (
                    <span className="inline-block px-3 py-1 rounded font-semibold text-sm mb-1 bg-zinc-400 text-white">
                        CURRENCY: UNKNOWN
                    </span>
                )}
                {loading ? (
                    <Skeleton className="h-6 w-28 mt-1" />
                ) : (
                    <span className="text-lg font-mono font-bold text-zinc-800 dark:text-zinc-100">{last90DaysLandings} <span className="text-xs font-normal text-zinc-500">/ 3 Landings</span></span>
                )}
            </div>
            {/* Total Experience Card */}
            <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-1">
                    <Clock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Total Experience</span>
                {loading ? (
                    <Skeleton className="h-10 w-24 my-1" />
                ) : (
                    <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">{totalHours} <span className="text-base font-normal text-zinc-500">Hrs</span></span>
                )}
            </div>
            {/* Fleet Size Card */}
            <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-1">
                    <Plane className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Total Fleet</span>
                {loading ? (
                    <Skeleton className="h-10 w-16 my-1" />
                ) : (
                    <Link href="/dashboard/aircraft" className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100 hover:underline">
                        {fleetCount}
                        <span className="text-base font-normal text-zinc-500 ml-1">Aircraft</span>
                    </Link>
                )}
            </div>
        </>
    );
}
