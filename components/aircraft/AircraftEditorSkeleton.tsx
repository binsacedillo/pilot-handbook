"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter } from "@/components/ui/GlassCard";
import { Plane, Info } from "lucide-react";

export function AircraftEditorSkeleton({ mode = "configure" }: { mode?: "configure" | "register" }) {
  return (
    <div className="animate-in fade-in duration-500">
      <div className="space-y-1 mb-10">
        <div className="h-10 md:h-14 w-64 md:w-96 bg-zinc-800/50 rounded-lg animate-pulse" />
        <div className="h-3 w-48 bg-zinc-900/50 rounded animate-pulse" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Section Skeleton */}
        <div className="lg:col-span-7 space-y-6">
          <GlassCard className="border-border/20">
            <GlassCardHeader className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                <Plane className="w-4 h-4 text-zinc-600" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-2 w-24" />
              </div>
            </GlassCardHeader>
            
            <GlassCardContent className="space-y-8 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Skeleton className="h-3 w-28" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-3">
                  <Skeleton className="h-3 w-32" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>

              <div className="space-y-4">
                <Skeleton className="h-3 w-36" />
                <div className="h-32 w-full bg-zinc-900/30 rounded-xl border-2 border-dashed border-zinc-800 animate-pulse flex items-center justify-center">
                   <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-700">Hardware Uplink...</div>
                </div>
              </div>
            </GlassCardContent>

            <GlassCardFooter className="flex justify-end gap-3 pt-6 border-t border-zinc-900/50">
              <Skeleton className="h-11 w-32 rounded-xl" />
              <Skeleton className="h-11 w-40 rounded-xl" />
            </GlassCardFooter>
          </GlassCard>
        </div>

        {/* Preview Section Skeleton */}
        <div className="lg:col-span-5 space-y-8">
          <div className="aspect-[4/3] rounded-3xl bg-zinc-900/40 border border-zinc-800/50 relative overflow-hidden flex flex-col p-6 animate-pulse">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 blur-3xl" />
             <div className="h-6 w-32 bg-zinc-800 rounded-md mb-2" />
             <div className="h-10 w-48 bg-zinc-800 rounded-md mb-auto" />
             <div className="flex justify-between items-end">
                <div className="space-y-2">
                   <div className="h-3 w-20 bg-zinc-800 rounded" />
                   <div className="h-4 w-12 bg-zinc-700 rounded" />
                </div>
                <div className="h-12 w-12 rounded-full bg-zinc-800" />
             </div>
          </div>
          
          <div className="p-4 rounded-xl bg-zinc-900/20 border border-zinc-800/30">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-zinc-700 shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-3 w-32" />
                <Skeleton className="h-2 w-full" />
                <Skeleton className="h-2 w-3/4" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
