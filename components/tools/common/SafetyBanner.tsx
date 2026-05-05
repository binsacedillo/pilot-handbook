"use client";

import React from "react";
import { ShieldCheck, ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { FlightSafetyDecision } from "@/lib/decision/engine";

interface SafetyBannerProps {
  decision: FlightSafetyDecision;
  isNearLimit?: boolean;
  label?: string;
}

/**
 * Generic Safety Status indicator with decision engine feedback.
 */
export function SafetyBanner({ decision, isNearLimit, label }: SafetyBannerProps) {
  const status = decision.status;
  const isNormal = status === 'NORMAL';
  const isCaution = status === 'CAUTION' || isNearLimit;
  
  const themeClass = isNormal 
    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200' 
    : isCaution 
      ? 'bg-amber-500/10 border-amber-500 text-amber-200' 
      : 'bg-red-500/10 border-red-500 text-red-200';

  return (
    <div className={cn("p-4 rounded-2xl border-l-4 transition-all duration-300 flex flex-col gap-2", themeClass)}>
      <div className="flex items-center gap-2">
         {isNormal ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
         <p className="text-[10px] font-black uppercase tracking-widest leading-none">
           {label || 'Safety Status'}: {status}
         </p>
      </div>
      {decision.implication && <p className="text-xs font-bold leading-tight">{decision.implication}</p>}
      <p className="text-[11px] leading-tight opacity-70 italic">
        {decision.recommendation || 'Flight parameters within normal limits.'}
      </p>
    </div>
  );
}
