"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from "recharts";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plane, 
  Scale, 
  Info,
} from "lucide-react";
import { calculateWB, C172S_DEFAULT } from "@/lib/calculations/weight-balance";
import { evaluateFlightSafety } from "@/lib/decision/engine";
import { cn } from "@/lib/utils";

// Sub-component and Type Imports
import { WeightBalanceCalculatorProps } from "./weight-balance/types";
import { StationInput } from "./weight-balance/StationInput";
import { ResultHUD } from "./weight-balance/ResultHUD";
import { SafetyBanner } from "./common/SafetyBanner";

/**
 * Weight & Balance Calculator Orchestrator
 * High-fidelity telemetry tool for C172S structural limits.
 */
export default function WeightBalanceCalculator({ isCompact = false, onResultChange }: WeightBalanceCalculatorProps) {
  const [weights, setWeights] = useState<Record<string, number>>(
    C172S_DEFAULT.stations.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {})
  );

  const handleWeightChange = (id: string, value: string) => {
    let num = parseFloat(value) || 0;
    if (num < 0) num = 0;
    setWeights(prev => ({ ...prev, [id]: num }));
  };

  const results = useMemo(() => {
    const stationWeights = Object.entries(weights).map(([id, weight]) => ({ id, weight }));
    const wb = calculateWB(stationWeights);
    
    const decision = evaluateFlightSafety('weight-balance', { 
      isOverweight: wb.isOverweight, 
      isOutOfCG: wb.isOutOfCG,
      totalWeight: wb.totalWeight,
      maxWeight: C172S_DEFAULT.maxGrossWeight
    });

    const margin = C172S_DEFAULT.maxGrossWeight - wb.totalWeight;
    const isNearLimit = !wb.isOverweight && margin < (C172S_DEFAULT.maxGrossWeight * 0.05);

    return { ...wb, decision, margin, isNearLimit };
  }, [weights]);

  // Handle reporting results back to parent with stabilization
  const onResultChangeRef = useRef(onResultChange);
  useEffect(() => {
    onResultChangeRef.current = onResultChange;
  }, [onResultChange]);

  useEffect(() => {
    if (onResultChangeRef.current && results) {
      onResultChangeRef.current(results);
    }
  }, [results]);

  const cgData = [{ x: results.centerOfGravity, y: results.totalWeight }];

  if (isCompact) {
    return (
      <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 font-sans">
        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
             {C172S_DEFAULT.stations.map((station) => (
               <StationInput 
                 key={station.id}
                 id={station.id}
                 name={station.name}
                 arm={station.arm}
                 value={weights[station.id] ?? 0}
                 onChange={handleWeightChange}
                 compact
               />
             ))}
          </div>
        </div>

        <div className="space-y-4">
          <ResultHUD results={results} compact />
          <SafetyBanner decision={results.decision} isNearLimit={results.isNearLimit} />
          <p className="text-[9px] text-zinc-600 text-center uppercase tracking-widest px-4 leading-tight">
            Numeric Verification Required. Analyze audit on larger display.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card className="border-2 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2 italic uppercase tracking-tighter">
              <Scale className="w-5 h-5 text-blue-500" />
              Aircraft Loading Check
            </CardTitle>
            <CardDescription className="text-[10px] uppercase font-bold tracking-widest text-zinc-500">
              Structural Weight Distribution (LBS)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-dashed flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plane className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Basic Empty Weight</span>
              </div>
              <span className="font-mono font-black text-lg">{C172S_DEFAULT.emptyWeight} lbs</span>
            </div>

            <Separator className="opacity-50" />

            {C172S_DEFAULT.stations.map((station) => (
               <StationInput 
                 key={station.id}
                 id={station.id}
                 name={station.name}
                 arm={station.arm}
                 value={weights[station.id] ?? 0}
                 onChange={handleWeightChange}
               />
            ))}

            <div className="pt-4 p-4 bg-blue-500/5 rounded-2xl flex gap-3 text-xs text-blue-600 dark:text-blue-400 italic">
              <Info className="w-4 h-4 shrink-0" />
              <p>Values based on standard C172S. Always verify with your aircraft&apos;s specific weight &amp; balance sheet.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-2 shadow-xl overflow-hidden">
          <div className={cn(
            "h-2 w-full transition-colors duration-500",
            results.isOverweight || results.isOutOfCG ? "bg-red-500" : "bg-emerald-500"
          )} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl italic uppercase tracking-tighter">Safety & Guidance</CardTitle>
              {results.decision && (
                <Badge className={cn(
                  "font-black uppercase tracking-widest",
                  results.decision.status === 'NORMAL' ? 'bg-emerald-500' : 'bg-red-500'
                )}>
                  {results.decision.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ResultHUD results={results} />

            <div className="mt-8 space-y-3">
               <div className={cn(
                 "p-4 rounded-xl border-l-4 flex flex-col gap-1 transition-all duration-300",
                 results.isOverweight ? 'bg-red-500/10 border-red-500' : results.isNearLimit ? 'bg-amber-500/10 border-amber-500' : 'bg-emerald-500/10 border-emerald-500'
               )}>
                  <div className="flex justify-between items-center w-full uppercase tracking-tighter font-black text-[10px] opacity-70">
                    <span>Remaining Useful Load</span>
                    <span>{results.isOverweight ? 'LIMIT EXCEEDED' : 'OK'}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black italic tracking-tighter">{Math.abs(Math.round(results.margin))}</span>
                    <span className="text-xs font-black uppercase tracking-widest opacity-60">lbs</span>
                  </div>
               </div>
               
               {results.decision && (
                 <div className="space-y-4">
                   <SafetyBanner decision={results.decision} isNearLimit={results.isNearLimit} />
                   
                   <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-3 text-xs text-blue-400 italic">
                      <Info className="w-4 h-4 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-black uppercase tracking-widest text-[10px] not-italic text-blue-500">Mentorship Tip</p>
                        <p>{results.decision.mentorship}</p>
                      </div>
                   </div>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-xl h-[380px]">
           <CardContent className="h-full min-h-0 min-w-0 pt-6">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                 <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                    <XAxis type="number" dataKey="x" name="Arm" unit=" in" domain={[34, 48]} fontSize={10} />
                    <YAxis type="number" dataKey="y" name="Weight" unit=" lbs" domain={[1500, 2600]} fontSize={10} />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter 
                      name="Current CG" 
                      data={cgData} 
                      fill={results.isOutOfCG || results.isOverweight ? "#ef4444" : "#10b981"} 
                    />
                 </ScatterChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}
