"use client";

import React from "react";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Premium Settings Skeleton
 * Precision-engineered to match SettingsForm.tsx with GlassCard aesthetics.
 */
export default function SettingsSkeleton() {
  return (
    <div className="space-y-8 pb-10 animate-in fade-in duration-500">
      {/* 1. Header / Summary Section Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <GlassCard key={i} className="border-l-4 border-l-zinc-800/40" bezel={false}>
            <GlassCardContent className="py-4 space-y-2">
              <Skeleton className="h-2.5 w-20 opacity-20" />
              <Skeleton className="h-6 w-32" />
            </GlassCardContent>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* 2. Interface Section Skeleton */}
        <GlassCard bezel={true}>
          <GlassCardHeader className="flex flex-row items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg opacity-20" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-2.5 w-24 opacity-20" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-20 opacity-30" />
              <Skeleton className="h-11 w-full rounded-md opacity-10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 opacity-30" />
              <Skeleton className="h-11 w-full rounded-md opacity-10" />
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* 3. Operations Section Skeleton */}
        <GlassCard bezel={true}>
          <GlassCardHeader className="flex flex-row items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg opacity-20" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-2.5 w-32 opacity-20" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="grid grid-cols-1 md:grid-cols-2 gap-8 py-6">
            <div className="space-y-2">
              <Skeleton className="h-3 w-24 opacity-30" />
              <Skeleton className="h-11 w-full rounded-md opacity-10" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-3 w-32 opacity-30" />
              <Skeleton className="h-11 w-full rounded-md opacity-10" />
            </div>
          </GlassCardContent>
        </GlassCard>

        {/* 4. Economics Section Skeleton */}
        <GlassCard bezel={true}>
          <GlassCardHeader className="flex flex-row items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg opacity-20" />
            <div className="space-y-1">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-2.5 w-28 opacity-20" />
            </div>
          </GlassCardHeader>
          <GlassCardContent className="py-6">
            <div className="space-y-2 max-w-sm">
              <Skeleton className="h-3 w-32 opacity-30" />
              <Skeleton className="h-11 w-full rounded-md opacity-10" />
            </div>
          </GlassCardContent>
        </GlassCard>
      </div>
    </div>
  );
}
