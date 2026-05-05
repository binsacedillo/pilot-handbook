"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { WeightBalanceResults } from "./types";

interface ResultHUDProps {
  results: WeightBalanceResults;
  compact?: boolean;
}

/**
 * High-visibility Telemetry HUD for Weight and CG.
 */
export function ResultHUD({ results, compact = false }: ResultHUDProps) {
  const containerClass = compact 
    ? "p-5 sm:p-6 bg-zinc-900 rounded-3xl border border-white/5 grid grid-cols-2 gap-4"
    : "grid grid-cols-2 gap-6";
  
  const itemClass = compact
    ? "space-y-1"
    : "space-y-1 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-white/5";

  return (
    <div className={containerClass}>
       <div className={itemClass}>
          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Gross Weight</p>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "font-black italic tracking-tighter",
              compact ? "text-2xl sm:text-4xl" : "text-4xl",
              results.isOverweight ? 'text-red-500' : 'text-white'
            )}>
              {Math.round(results.totalWeight)}
            </span>
            <span className="text-[10px] font-bold text-zinc-600 uppercase">lbs</span>
          </div>
       </div>
       <div className={cn(itemClass, compact && "border-l border-white/5 pl-4")}>
          <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">CG Arm</p>
          <div className="flex items-baseline gap-1">
            <span className={cn(
              "font-black italic tracking-tighter",
              compact ? "text-2xl sm:text-4xl" : "text-4xl",
              results.isOutOfCG ? 'text-red-500' : 'text-white'
            )}>
              {results.centerOfGravity.toFixed(compact ? 1 : 2)}
            </span>
            <span className="text-[10px] font-bold text-zinc-600 uppercase">in</span>
          </div>
       </div>
    </div>
  );
}
