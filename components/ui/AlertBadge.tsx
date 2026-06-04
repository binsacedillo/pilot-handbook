"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertTriangle } from "lucide-react";

interface AlertBadgeProps {
  label: string;
  value: string;
  isOk: boolean;
  icon: React.ReactNode;
  tooltipText: string;
}

export function AlertBadge({ label, value, isOk, icon, tooltipText }: AlertBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className="relative flex items-center gap-3.5 p-4 bg-zinc-900/30 rounded-2xl border border-white/5 hover:border-zinc-700/30 transition-all duration-300 cursor-help"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onTouchStart={() => setShowTooltip(!showTooltip)}
    >
      {/* Icon block */}
      <div className={cn(
        "p-2.5 rounded-xl border shrink-0 flex items-center justify-center",
        isOk ? "bg-emerald-500/5 text-emerald-400 border-emerald-500/10" : "bg-red-500/5 text-red-400 border-red-500/10"
      )}>
        {icon}
      </div>

      {/* Label and Value */}
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider leading-none">{label}</span>
        <span className={cn("text-sm font-black tracking-tight truncate", isOk ? "text-white" : "text-red-400")}>{value}</span>
      </div>

      {/* Status indicator icon */}
      <div className="ml-auto shrink-0">
        {isOk ? (
          <CheckCircle2 className="w-4 h-4 text-emerald-500/80" />
        ) : (
          <AlertTriangle className="w-4 h-4 text-red-400" />
        )}
      </div>

      {/* CSS-based Tooltip */}
      {showTooltip && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-950/95 border border-white/10 rounded-xl shadow-2xl text-[11px] text-zinc-300 font-medium leading-relaxed backdrop-blur-md animate-in fade-in slide-in-from-bottom-1 duration-200">
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-950/95 pointer-events-none" />
          <div className="font-bold text-white uppercase tracking-wider text-[9px] mb-1 opacity-60">{label} Requirement</div>
          {tooltipText}
        </div>
      )}
    </div>
  );
}
