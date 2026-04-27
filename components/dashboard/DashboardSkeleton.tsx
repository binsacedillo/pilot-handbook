"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import RecentFlightsSkeleton from "./RecentFlightsSkeleton";

/**
 * Premium Dashboard Skeleton
 * Precision-engineered to match DashboardClient.tsx (62:38 Grid)
 * Eliminates layout shifts (CLS) and "lingering" discrepancies.
 */
export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-10 animate-in fade-in duration-500">
      
      {/* 1. Header Area Skeleton */}
      <div className="flex flex-col gap-2">
        <div className="h-4 w-48 bg-blue-500/10 rounded-full animate-pulse mb-2" />
        <div className="h-12 w-80 bg-zinc-800/40 rounded-xl animate-pulse" />
        <div className="h-3 w-64 bg-zinc-800/20 rounded-full animate-pulse mt-2" />
      </div>

      <div className="flex flex-col gap-8">
        {/* 2. Global Status (PilotLegalityStatus) Skeleton */}
        <GlassCard className="border-l-4 border-l-zinc-800/50 h-48 w-full" bezel={true}>
          <div className="p-6 h-full flex flex-col justify-center gap-4">
             <div className="h-10 w-64 bg-zinc-800/40 rounded-lg animate-pulse" />
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-zinc-800/20 rounded-xl border border-zinc-800/10 animate-pulse" />
                ))}
             </div>
          </div>
        </GlassCard>

        {/* 3. Operational Grid (62:38 Split) */}
        <div className="grid grid-cols-1 lg:grid-cols-[62fr_38fr] gap-8 items-start">
          
          {/* LEFT COLUMN */}
          <div className="space-y-8">
            {/* Experience Progression */}
            <GlassCard className="h-32 w-full animate-pulse" bezel={true}>
               <div className="p-6 space-y-3">
                  <div className="h-3 w-32 bg-zinc-800/40 rounded" />
                  <div className="h-4 w-full bg-zinc-800/20 rounded-full" />
                  <div className="h-3 w-48 bg-zinc-800/10 rounded" />
               </div>
            </GlassCard>

            {/* Recent Flights */}
            <section>
              <div className="mb-4 h-6 w-40 bg-zinc-800/40 rounded animate-pulse" />
              <RecentFlightsSkeleton />
            </section>

            {/* Quick Tools */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
               {[...Array(4)].map((_, i) => (
                 <div key={i} className="h-24 bg-zinc-800/20 rounded-2xl animate-pulse" />
               ))}
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-8">
            {/* Weather Widget */}
            <GlassCard className="h-64 w-full animate-pulse" bezel={true}>
               <div className="p-6 space-y-4">
                  <div className="h-6 w-32 bg-zinc-800/40 rounded" />
                  <div className="h-32 bg-blue-500/5 rounded-xl border border-blue-500/10" />
               </div>
            </GlassCard>

            {/* Upcoming Flight */}
            <GlassCard className="h-40 w-full animate-pulse" bezel={true}>
              <div className="p-6 h-full" />
            </GlassCard>

            {/* Pilot Profile */}
            <GlassCard className="h-48 w-full animate-pulse" bezel={true}>
              <div className="p-6 h-full" />
            </GlassCard>
          </div>
        </div>
      </div>
    </div>
  );
}
