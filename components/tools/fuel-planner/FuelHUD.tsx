"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FuelPlannerResults } from "./types";

interface FuelHUDProps {
  results: FuelPlannerResults;
  compact?: boolean;
}

export function FuelHUD({ results, compact = false }: FuelHUDProps) {
  const containerClass = compact
    ? "p-5 sm:p-7 bg-zinc-900 rounded-3xl border border-white/5 grid grid-cols-2 gap-4 shadow-xl"
    : "text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800";

  const itemClass = compact ? "space-y-1" : "space-y-1 mb-1";

  return (
    <div className={containerClass}>
       <div className={cn(itemClass, !compact && "w-full")}>
          <p className={cn(
            "uppercase font-black tracking-widest",
            compact ? "text-[10px] text-zinc-600" : "text-xs text-muted-foreground"
          )}>
            Total Required
          </p>
          <div className={cn("flex items-baseline justify-center gap-1", compact && "justify-start")}>
            <p className={cn(
              "font-black italic tracking-tighter",
              compact ? "text-2xl sm:text-4xl text-white" : "text-5xl text-slate-900 dark:text-slate-100"
            )}>
              {results.totalRequired}
            </p>
            <p className={cn(
              "font-bold uppercase",
              compact ? "text-[10px] text-zinc-600" : "text-lg text-muted-foreground"
            )}>
              GAL
            </p>
          </div>
       </div>
       <div className={cn(
         itemClass, 
         compact ? "border-l border-white/5 pl-4" : "mt-2 pt-2 border-t border-slate-100 dark:border-slate-800"
       )}>
          <p className={cn(
            "uppercase font-black tracking-widest",
            compact ? "text-[10px] text-zinc-600" : "text-xs text-muted-foreground"
          )}>
            Endurance
          </p>
          <p className={cn(
            "font-black italic tracking-tighter",
            compact ? "text-2xl sm:text-4xl text-white" : "text-xl text-green-600 dark:text-green-400"
          )}>
            {results.enduranceFormatted}
          </p>
       </div>
    </div>
  );
}
