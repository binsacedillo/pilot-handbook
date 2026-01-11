"use client";


import { Plane, Clock, Shield } from "lucide-react";
import Link from "next/link";
import { trpc } from "@/src/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardStatusCards() {
    const { data: flightStats, isLoading: isFlightLoading } = trpc.flight.getStats.useQuery();
    const { data: generalStats, isLoading: isSummaryLoading } = trpc.stats.getSummary.useQuery();
    const { data: aircraft, isLoading: isAircraftLoading } = trpc.aircraft.getAll.useQuery();

    // Data
    const isCurrent = flightStats?.recency?.isCurrent;
    const last90DaysLandings = flightStats?.recency?.last90DaysLandings ?? 0;
    const totalHours = generalStats?.totalHours ?? 0;
    const fleetCount = aircraft?.length ?? 0;
    const loading = isFlightLoading || isSummaryLoading || isAircraftLoading;

    return (
        <>
            {/* Pilot Currency Card */}
            <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-1">
                    <Shield className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="font-semibold text-zinc-700 dark:text-zinc-200 text-base">Pilot Currency</span>
                {loading ? (
                    <Skeleton className="h-7 w-32 my-1" />
                ) : (
                    <span className={`inline-block px-3 py-1 rounded font-semibold text-sm mb-1 ${isCurrent === true ? "bg-emerald-500 text-white" : isCurrent === false ? "bg-rose-500 text-white" : "bg-zinc-400 text-white"}`}>
                        {isCurrent === true ? "CURRENCY: ACTIVE" : isCurrent === false ? "CURRENCY: EXPIRED" : "CURRENCY: UNKNOWN"}
                    </span>
                )}
                {loading ? (
                    <Skeleton className="h-6 w-20 mt-1" />
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
