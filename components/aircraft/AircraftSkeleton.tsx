"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";

export function AircraftSkeleton() {
  const skeletonCards = Array.from({ length: 4 });

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Fleet Scanning Header */}
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-2">
           <div className="w-2 h-2 rounded-full bg-blue-500/40 animate-hud-blink" />
           <span className="text-[10px] font-black uppercase tracking-widest text-blue-500/40 italic">
              Fleet Diagnostic Active...
           </span>
        </div>
        <Skeleton className="h-[1px] flex-1 bg-blue-500/10" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {skeletonCards.map((_, i) => (
          <GlassCard key={i} className="overflow-hidden border border-(--glass-border) shadow-2xl relative">
            {/* HUD Scanline Effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-xl z-10 opacity-30">
               <div className="w-full h-1 bg-blue-500/20 blur-[1px] animate-hud-scanline" />
            </div>

            {/* Image Skeleton */}
            <div className="h-48 w-full bg-zinc-900/10 dark:bg-white/5 relative">
               <div className="absolute top-3 right-3">
                  <Skeleton className="h-5 w-20 rounded-lg opacity-20" />
               </div>
               <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <Skeleton className="w-16 h-16 rounded-full" />
               </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-32 animate-hud-shimmer" />
                <Skeleton className="h-6 w-20 rounded-lg opacity-20" />
              </div>

              <Skeleton className="h-3 w-40 opacity-40 animate-hud-shimmer" />

              <div className="pt-4 border-t border-(--glass-border) flex gap-2">
                <Skeleton className="h-10 flex-1 rounded-xl opacity-20" />
                <Skeleton className="h-10 w-12 rounded-xl opacity-10" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
