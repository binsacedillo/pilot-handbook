"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Zap, 
  Clock, 
  MapPin, 
  Wind, 
  Fuel, 
  AlertCircle,
} from "lucide-react";
import { calculateFuel } from "@/lib/calculations/fuel-planner";
import { evaluateFlightSafety } from "@/lib/decision/engine";
import { cn } from "@/lib/utils";

// Sub-component and Type Imports
import { FuelPlannerProps, FuelPlannerResults } from "./fuel-planner/types";
import { FuelInput } from "./fuel-planner/FuelInput";
import { FuelHUD } from "./fuel-planner/FuelHUD";
import { FuelBreakdown } from "./fuel-planner/FuelBreakdown";
import { SafetyBanner } from "./common/SafetyBanner";

/**
 * Fuel Planner Orchestrator
 * High-fidelity telemetry tool for endurance and reserve calculations.
 */
export default function FuelPlanner({ isCompact = false, onResultChange }: FuelPlannerProps) {
  const [params, setParams] = useState({
    distance: 0,
    groundspeed: 100, // kts
    burnRate: 8.5,    // GPH (Standard C172S)
    reserveMinutes: 45,
  });

  const handleParamChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setParams(prev => ({ ...prev, [id]: num }));
  };

  const setReserve = (mins: number) => {
    setParams(prev => ({ ...prev, reserveMinutes: mins }));
  };

  const results = useMemo(() => {
    const fuelData = calculateFuel(params);
    const decision = evaluateFlightSafety('fuel', { 
      distance: params.distance,
      groundspeed: params.groundspeed,
      burnRate: params.burnRate,
      reserveMinutes: params.reserveMinutes
    });
    return { ...fuelData, decision } as FuelPlannerResults;
  }, [params]);

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

  if (isCompact) {
    return (
      <div className="space-y-6 sm:space-y-8 font-sans">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              <FuelInput 
                id="distance" label="Trip Distance" value={params.distance} unit="NM" 
                onChange={handleParamChange} compact 
              />
              <FuelInput 
                id="groundspeed" label="Groundspeed" value={params.groundspeed} unit="Kts" 
                onChange={handleParamChange} compact 
              />
              <FuelInput 
                id="burnRate" label="Fuel Flow" value={params.burnRate} unit="GPH" 
                onChange={handleParamChange} compact 
              />
            </div>
          </div>

          <div className="space-y-4">
            <FuelHUD results={results} compact />
            <SafetyBanner 
              decision={results.decision} 
              label={`Endurance Buffer: ${params.reserveMinutes}m`} 
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-6">
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 italic uppercase tracking-tighter">
              <Zap className="w-5 h-5 text-green-500" />
              Fuel Planning Parameters
            </CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
              Structural endurance and reserve calculation
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <FuelInput 
              id="distance" label="Trip Distance" value={params.distance} unit="NM" 
              icon={<MapPin className="w-4 h-4" />} onChange={handleParamChange} 
            />

            <div className="grid grid-cols-2 gap-4">
              <FuelInput 
                id="groundspeed" label="Groundspeed" value={params.groundspeed} unit="Kts" 
                icon={<Wind className="w-4 h-4" />} onChange={handleParamChange} 
              />
              <FuelInput 
                id="burnRate" label="Fuel Flow" value={params.burnRate} unit="GPH" 
                icon={<Fuel className="w-4 h-4" />} onChange={handleParamChange} 
              />
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Reserve Requirements
              </Label>
              <div className="grid grid-cols-3 gap-2">
                {[30, 45, 60].map((mins) => (
                  <Button 
                    key={mins}
                    type="button"
                    variant={params.reserveMinutes === mins ? "default" : "outline"}
                    className="rounded-xl h-10 text-xs font-bold"
                    onClick={() => setReserve(mins)}
                  >
                    {mins}m ({mins === 30 ? "Day" : mins === 45 ? "Night" : "Safety"})
                  </Button>
                ))}
              </div>
              <div className="relative mt-2">
                 <FuelInput 
                   id="reserveMinutes" label="Custom" value={params.reserveMinutes} unit="mins" 
                   onChange={handleParamChange}
                 />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-500/5 p-5 rounded-3xl border border-amber-500/10 flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400">
            <strong>VFR Regulations:</strong> CAAP Regulations require day VFR flights to have at least 30 minutes of reserve fuel at normal cruising speed. Night VFR requires 45 minutes.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="border-2 overflow-hidden shadow-lg">
           <div className={cn(
             "h-2 w-full transition-colors duration-500",
             results.decision?.status === 'NORMAL' ? "bg-emerald-500" : 
             results.decision?.status === 'CAUTION' ? "bg-amber-500" : "bg-red-500"
           )} />
           <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg italic uppercase tracking-tighter">Safety & Guidance</CardTitle>
                {results.decision && (
                  <Badge className={cn(
                    "font-black uppercase tracking-widest",
                    results.decision.status === 'NORMAL' ? 'bg-emerald-500 text-white' : 
                    results.decision.status === 'CAUTION' ? 'bg-amber-500 text-white' : 'bg-red-500 text-white'
                  )}>
                    {results.decision.status}
                  </Badge>
                )}
              </div>
           </CardHeader>
           <CardContent className="space-y-8">
              <FuelHUD results={results} />
              <FuelBreakdown 
                tripFuel={results.tripFuel} 
                reserveFuel={results.reserveFuel} 
                taxiFuel={results.taxiFuel} 
                contingencyFuel={results.contingencyFuel} 
                totalRequired={results.totalRequired} 
              />
              <Separator />
              <SafetyBanner 
                decision={results.decision} 
                label="Performance Status" 
              />
              <div className="p-4 bg-muted/40 rounded-2xl text-[11px] text-muted-foreground italic leading-tight space-y-1">
                 <p>• Estimated groundspeed should account for winds aloft.</p>
                 <p>• Reserve fuel is based on cruise burn rate.</p>
                 <p>• Always verify take-off fuel exceeds planned requirements + buffer.</p>
              </div>
           </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Label helper for the custom input
function Label({ children, className, htmlFor }: { children: React.ReactNode, className?: string, htmlFor?: string }) {
  return <label htmlFor={htmlFor} className={cn("text-sm font-semibold", className)}>{children}</label>;
}