"use client";

import React from "react";
import { ShieldCheck, ShieldAlert, Save } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WeightBalanceResults } from "../weight-balance/types";
import { DensityAltitudeResults } from "../DensityAltitudeCalculator";
import { FuelPlannerResults } from "../fuel-planner/types";

interface FlightSummaryProps {
  results: {
    wb?: WeightBalanceResults;
    da?: DensityAltitudeResults;
    fuel?: FuelPlannerResults;
  };
  currentStatus: string;
  isPending: boolean;
  onCommit: () => void;
}

export function FlightSummary({ results, currentStatus, isPending, onCommit }: FlightSummaryProps) {
  return (
    <div className="space-y-6 text-left">
      <Card className="border-2 border-zinc-800 bg-zinc-950/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
         <div className={`h-2 w-full ${currentStatus === 'NORMAL' ? 'bg-emerald-500' : currentStatus === 'CAUTION' ? 'bg-amber-500' : 'bg-red-500'}`} />
         <CardHeader className="text-center p-4 sm:p-6">
            <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 ${currentStatus === 'NORMAL' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
              {currentStatus === 'NORMAL' ? <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" /> : <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />}
            </div>
            <CardTitle className="text-xl sm:text-3xl font-black uppercase italic tracking-tighter">
              Flight Readiness: {currentStatus}
            </CardTitle>
            <CardDescription className="uppercase tracking-[0.2em] font-bold text-[9px] sm:text-[10px]">Consolidated Performance Summary</CardDescription>
         </CardHeader>
         <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-6">
            <StatusMiniCard title="Weight/CG" status={results.wb?.decision?.status} value={`${Math.round(results.wb?.totalWeight || 0)} lbs`} />
            <StatusMiniCard title="Fuel Margins" status={results.fuel?.decision?.status} value={results.fuel?.enduranceFormatted || "N/A"} />
            <StatusMiniCard title="Perf (DA)" status={results.da?.decision?.status || "GO"} value="Computed" />
         </CardContent>
      </Card>

      <Button 
        className="w-full h-14 sm:h-16 rounded-2xl sm:rounded-3xl bg-blue-600 hover:bg-blue-500 text-lg sm:text-xl font-black uppercase italic tracking-tighter transition-all hover:scale-[1.02] active:scale-[0.98]"
        onClick={onCommit}
        disabled={isPending}
      >
        <Save className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
        {isPending ? "Syncing..." : "Record Readiness Data"}
      </Button>
    </div>
  );
}

function StatusMiniCard({ title, status, value }: { title: string, status?: string, value: string }) {
  return (
    <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{title}</p>
        <div className={`w-2 h-2 rounded-full ${status === 'NORMAL' ? 'bg-emerald-500' : status === 'CAUTION' ? 'bg-amber-500' : 'bg-zinc-700'}`} />
      </div>
      <p className="text-xl font-black italic text-white uppercase tracking-tighter">{value}</p>
    </div>
  );
}
