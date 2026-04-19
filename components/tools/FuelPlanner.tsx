"use client";

import React, { useState, useMemo, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Zap, 
  Clock, 
  MapPin, 
  Wind, 
  Fuel, 
  AlertCircle,
  PlayCircle,
  Flag
} from "lucide-react";
import { calculateFuel, FUEL_CONSTANTS } from "@/lib/calculations/fuel-planner";
import { evaluateFlightSafety } from "@/lib/decision/engine";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, ShieldAlert, ShieldX, Info } from "lucide-react";

interface FuelPlannerProps {
  isCompact?: boolean;
  onResultChange?: (results: any) => void;
}

export default function FuelPlanner({ isCompact = false, onResultChange }: FuelPlannerProps) {
  const [params, setParams] = useState({
    distance: 0,
    groundspeed: 100, // kts
    burnRate: 8.5,    // GPH (Standard C172S)
    reserveMinutes: 45,
  });

  const handleParamChange = (key: string, value: string) => {
    const num = parseFloat(value) || 0;
    setParams(prev => ({ ...prev, [key]: num }));
  };

  const setReserve = (mins: number) => {
    setParams(prev => ({ ...prev, reserveMinutes: mins }));
  };

  const results = useMemo(() => {
    const fuelData = calculateFuel(params);
    const decision = evaluateFlightSafety('fuel', { 
      totalRequired: fuelData.totalRequired, 
      reserveMinutes: params.reserveMinutes 
    });
    return { ...fuelData, decision };
  }, [params]);

  useEffect(() => {
    if (onResultChange && results) {
      onResultChange(results);
    }
  }, [results, onResultChange]);

  if (isCompact) {
    return (
      <div className="space-y-6 sm:space-y-8 font-sans">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 sm:gap-4">
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">Trip Distance (NM)</Label>
                <Input type="number" className="h-11 sm:h-12 rounded-xl bg-zinc-900 border-white/5 text-base" value={params.distance} onChange={(e) => handleParamChange("distance", e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">Groundspeed (Kts)</Label>
                <Input type="number" className="h-11 sm:h-12 rounded-xl bg-zinc-900 border-white/5 text-base" value={params.groundspeed} onChange={(e) => handleParamChange("groundspeed", e.target.value)} />
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">Fuel Flow (GPH)</Label>
                <Input type="number" className="h-11 sm:h-12 rounded-xl bg-zinc-900 border-white/5 text-base" value={params.burnRate} onChange={(e) => handleParamChange("burnRate", e.target.value)} />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {/* Result HUD: Hierarchy Lock */}
            <div className="p-5 sm:p-7 bg-zinc-900 rounded-3xl border border-white/5 grid grid-cols-2 gap-4 shadow-xl">
               <div className="space-y-1">
                  <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Total Required</p>
                  <div className="flex items-baseline gap-1">
                    <p className="text-2xl sm:text-4xl font-black italic tracking-tighter text-white">{results.totalRequired}</p>
                    <p className="text-[10px] font-bold text-zinc-600 uppercase">GAL</p>
                  </div>
               </div>
               <div className="space-y-1 border-l border-white/5 pl-4">
                  <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Endurance</p>
                  <p className="text-2xl sm:text-4xl font-black italic tracking-tighter text-white">{results.enduranceFormatted}</p>
               </div>
            </div>

            <div className={`p-4 rounded-2xl border-l-4 transition-all duration-300 ${
              results.decision?.status === 'NORMAL' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200' : 'bg-amber-500/10 border-amber-500 text-amber-200'
            }`}>
               <div className="flex items-center gap-2 mb-1">
                  {results.decision?.status === 'NORMAL' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
                  <p className="text-[10px] font-black uppercase tracking-widest">Endurance Buffer: {params.reserveMinutes}m</p>
               </div>
               <p className="text-[11px] leading-tight opacity-80 italic">
                 {results.decision?.status === 'NORMAL' ? 'Regulatory reserves met.' : 'Insufficient reserves for selected flight operations.'}
               </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left side: Inputs */}
      <div className="space-y-6">
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5 text-green-500" />
              Fuel Planning Parameters
            </CardTitle>
            <CardDescription>
              Enter your trip details for fuel estimation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3">
              <Label htmlFor="distance" className="text-sm font-semibold flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                Trip Distance (NM)
              </Label>
              <Input
                id="distance"
                type="number"
                placeholder="100"
                className="h-11 rounded-xl"
                value={params.distance || ""}
                onChange={(e) => handleParamChange("distance", e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-3">
                <Label htmlFor="groundspeed" className="text-sm font-semibold flex items-center gap-2">
                  <Wind className="w-4 h-4 text-muted-foreground" />
                  Groundspeed (Kts)
                </Label>
                <Input
                  id="groundspeed"
                  type="number"
                  placeholder="100"
                  className="h-11 rounded-xl"
                  value={params.groundspeed || ""}
                  onChange={(e) => handleParamChange("groundspeed", e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="burnRate" className="text-sm font-semibold flex items-center gap-2">
                  <Fuel className="w-4 h-4 text-muted-foreground" />
                  Fuel Flow (GPH)
                </Label>
                <Input
                  id="burnRate"
                  type="number"
                  placeholder="8.5"
                  className="h-11 rounded-xl"
                  value={params.burnRate || ""}
                  onChange={(e) => handleParamChange("burnRate", e.target.value)}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-sm font-semibold block flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                Reserve Requirements
              </Label>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  type="button"
                  variant={params.reserveMinutes === 30 ? "default" : "outline"}
                  className="rounded-xl h-10 text-xs font-bold"
                  onClick={() => setReserve(30)}
                >
                  30m (Day)
                </Button>
                <Button 
                  type="button"
                  variant={params.reserveMinutes === 45 ? "default" : "outline"}
                  className="rounded-xl h-10 text-xs font-bold"
                  onClick={() => setReserve(45)}
                >
                  45m (Night)
                </Button>
                <Button 
                  type="button"
                  variant={params.reserveMinutes === 60 ? "default" : "outline"}
                  className="rounded-xl h-10 text-xs font-bold"
                  onClick={() => setReserve(60)}
                >
                  60m (Safety)
                </Button>
              </div>
              <div className="relative mt-2">
                 <Input 
                   type="number"
                   placeholder="Custom minutes"
                   className="pl-24 h-10 rounded-xl text-sm"
                   value={params.reserveMinutes || ""}
                   onChange={(e) => handleParamChange("reserveMinutes", e.target.value)}
                 />
                 <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-bold">Custom:</span>
                 <span className="absolute right-3 top-2.5 text-xs text-muted-foreground">mins</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="bg-amber-50 dark:bg-amber-900/10 p-5 rounded-3xl border border-amber-100 dark:border-amber-900/20 flex gap-4">
          <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-500 shrink-0" />
          <p className="text-xs leading-relaxed text-amber-800 dark:text-amber-400">
            <strong>VFR Regulations:</strong> FAA 91.151 requires day VFR flights to have at least 30 minutes of reserve fuel at normal cruising speed. Night VFR requires 45 minutes.
          </p>
        </div>
      </div>

      {/* Right side: Results */}
      <div className="space-y-6">
        <Card className="border-2 overflow-hidden shadow-lg">
           <div className={`h-2 w-full transition-colors duration-500 ${
             results.decision?.status === 'NORMAL' ? "bg-emerald-500" : 
             results.decision?.status === 'CAUTION' ? "bg-amber-500" : "bg-red-500"
           }`} />
           <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Safety & Guidance</CardTitle>
                {results.decision && (
                  <Badge 
                    variant={
                      results.decision.status === 'NORMAL' ? 'success' : 
                      results.decision.status === 'CAUTION' ? 'secondary' : 
                      results.decision.status === 'INVALID' ? 'default' : 'default'
                    }
                    className={`
                      px-2 py-0.5 text-[10px] font-bold uppercase tracking-tighter flex items-center gap-1
                      ${results.decision.status === 'NORMAL' ? 'bg-emerald-500 hover:bg-emerald-600 text-white' : ''}
                      ${results.decision.status === 'CAUTION' ? 'bg-amber-500 hover:bg-amber-600 text-white' : ''}
                      ${results.decision.status === 'WARNING' ? 'bg-red-500 hover:bg-red-600 text-white' : ''}
                      ${results.decision.status === 'INVALID' ? 'bg-red-700 hover:bg-red-800 text-white' : ''}
                    `}
                  >
                    {results.decision.status === 'NORMAL' ? <ShieldCheck className="w-3 h-3" /> : 
                     results.decision.status === 'CAUTION' ? <ShieldAlert className="w-3 h-3" /> : <ShieldX className="w-3 h-3" />}
                    {results.decision.status === 'INVALID' ? 'Param Error' : results.decision.status.replace('_', ' ')}
                  </Badge>
                )}
              </div>
              {results.decision?.status === 'INVALID' && (
                <p className="text-[10px] text-red-600 dark:text-red-400 font-bold mt-1 italic">
                  {results.decision.recommendation}
                </p>
              )}
           </CardHeader>
           <CardContent className="space-y-8">
              <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                 <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mb-1">Total Fuel Required</p>
                   <h2 className={`text-5xl font-black flex items-center justify-center gap-2 ${results.decision?.status === 'WARNING' ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-slate-100'}`}>
                    {results.totalRequired}
                    <span className="text-lg font-bold text-muted-foreground">GAL</span>
                  </h2>
                 <p className="text-sm font-medium text-green-600 dark:text-green-400 mt-2 flex items-center justify-center gap-1">
                   <Clock className="w-4 h-4" />
                   Estimated Endurance: {results.enduranceFormatted}
                 </p>
              </div>

              <div className="space-y-6">
                <FuelItem 
                  icon={<PlayCircle className="w-4 h-4" />} 
                  label="Trip Fuel" 
                  value={results.tripFuel} 
                  total={results.totalRequired} 
                  color="bg-blue-500"
                />
                <FuelItem 
                  icon={<Flag className="w-4 h-4" />} 
                  label="Reserve Fuel" 
                  value={results.reserveFuel} 
                  total={results.totalRequired} 
                  color="bg-amber-500"
                />
                <div className="grid grid-cols-2 gap-4">
                   <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Taxi/Start</p>
                      <p className="text-sm font-bold">{results.taxiFuel} Gal</p>
                   </div>
                   <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed">
                      <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Contingency (10%)</p>
                      <p className="text-sm font-bold">{results.contingencyFuel} Gal</p>
                   </div>
                </div>
              </div>

              <Separator />

              {/* Safety Buffer Banner (Phase 4) */}
              {results.decision && results.decision.status !== 'INVALID' && (
                <div className={`
                  p-4 rounded-xl border-l-4 flex flex-col gap-1 transition-all duration-300
                  ${results.decision.status === 'NORMAL' ? 'bg-emerald-50 border-emerald-500 text-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200' : 
                    results.decision.status === 'CAUTION' ? 'bg-amber-50 border-amber-500 text-amber-900 dark:bg-amber-950/20 dark:text-amber-200' : 
                    'bg-red-50 border-red-500 text-red-900 dark:bg-red-950/20 dark:text-red-200'}
                `}>
                  <div className="flex justify-between items-center w-full uppercase tracking-tighter font-bold text-[10px] opacity-70">
                    <span>Performance Status</span>
                    <span>{results.decision.status === 'NORMAL' ? 'Clear' : 'Constraint'}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black">{results.decision.status === 'WARNING' ? '0' : params.reserveMinutes}</span>
                    <span className="text-xs font-bold">MIN Reserve Buffer</span>
                  </div>
                  {results.decision.recommendation && (
                    <p className="text-xs leading-tight mt-1 opacity-90 border-t pt-2 border-current/10 italic">
                      {results.decision.recommendation}
                    </p>
                  )}
                </div>
              )}

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

function FuelItem({ icon, label, value, total, color }: { icon: React.ReactNode, label: string, value: number, total: number, color: string }) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-sm font-bold">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md bg-muted text-foreground`}>{icon}</div>
            <span>{label}</span>
          </div>
          <span>{value} GAL</span>
       </div>
       <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500 ease-out`} 
            style={{ width: `${percentage}%` }}
          />
       </div>
    </div>
  );
}
