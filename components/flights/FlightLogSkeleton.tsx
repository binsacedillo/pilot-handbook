"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function FlightLogSkeleton() {
  // Render 5 skeleton rows
  const skeletonRows = Array.from({ length: 5 });

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      {/* System Status Indicator (Skeleton) */}
      <div className="flex items-center gap-4 mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-blue-500/40 animate-hud-blink" />
          <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/40">
            System Scan In Progress...
          </span>
        </div>
        <Skeleton className="h-[1px] flex-1 bg-blue-500/10" />
      </div>

      <GlassCard className="p-0 overflow-hidden border border-(--glass-border) shadow-2xl relative">
        {/* HUD Scanline Effect */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10 opacity-30 dark:opacity-40">
          <div className="w-full h-1 bg-blue-500/20 blur-[1px] animate-hud-scanline" />
        </div>

        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-(--glass-border) bg-zinc-900/5 dark:bg-white/5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <th key={i} className="px-6 py-4 text-left">
                    <Skeleton className="h-2.5 w-16 opacity-30" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-(--glass-border)">
              {skeletonRows.map((_, i) => (
                <tr key={i} className="relative group">
                  <td className="px-6 py-6">
                    <Skeleton className="h-4 w-20 animate-hud-shimmer" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-4 w-12 animate-hud-shimmer" />
                      <div className="w-2 h-[1px] bg-zinc-800" />
                      <Skeleton className="h-4 w-12 animate-hud-shimmer" />
                    </div>
                  </td>
                  <td className="px-6 py-6">
                     <Skeleton className="h-3.5 w-24 mb-1.5 animate-hud-shimmer" />
                     <Skeleton className="h-2.5 w-16 opacity-50 animate-hud-shimmer" />
                  </td>
                  <td className="px-6 py-6">
                    <Skeleton className="h-4 w-10 ml-auto animate-hud-shimmer" />
                  </td>
                  <td className="px-6 py-6">
                    <Skeleton className="h-4 w-10 ml-auto animate-hud-shimmer" />
                  </td>
                  <td className="px-6 py-6">
                    <Skeleton className="h-4 w-10 ml-auto animate-hud-shimmer" />
                  </td>
                  <td className="px-6 py-6">
                    <Skeleton className="h-4 w-12 ml-auto animate-hud-shimmer" />
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-center">
                      <Skeleton className="h-6 w-20 rounded-sm opacity-20 animate-hud-shimmer" />
                    </div>
                  </td>
                  <td className="px-6 py-6">
                    <div className="flex justify-end gap-2">
                       <Skeleton className="h-8 w-8 rounded-lg opacity-10" />
                       <Skeleton className="h-8 w-8 rounded-lg opacity-10" />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
      
      {/* HUD footer decoration */}
      <div className="flex justify-between items-center px-4">
         <div className="flex gap-1.5">
            {Array.from({length: 4}).map((_, i) => (
               <div key={i} className={cn("w-1.5 h-1.5 rounded-full border border-blue-500/20", i === 0 && "bg-blue-500/40 animate-hud-blink")} />
            ))}
         </div>
         <span className="text-[8px] font-mono text-zinc-500/30 uppercase tracking-[0.5em]">Auth Stream Secured</span>
      </div>
    </div>
  );
}
