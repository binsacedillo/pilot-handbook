"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Plane, 
  Weight, 
  Scale, 
  AlertTriangle, 
  CheckCircle2, 
  Info,
  TrendingDown,
  ShieldCheck,
  ShieldAlert,
  ShieldX
} from "lucide-react";
import { calculateWB, C172S_DEFAULT } from "@/lib/calculations/weight-balance";
import { evaluateFlightSafety } from "@/lib/decision/engine";

interface WeightBalanceCalculatorProps {
  isCompact?: boolean;
  onResultChange?: (results: any) => void;
}

export default function WeightBalanceCalculator({ isCompact = false, onResultChange }: WeightBalanceCalculatorProps) {
  const [weights, setWeights] = useState<Record<string, number>>(
    C172S_DEFAULT.stations.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {})
  );

  const handleWeightChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setWeights(prev => ({ ...prev, [id]: num }));
  };

  const results = useMemo(() => {
    const stationWeights = Object.entries(weights).map(([id, weight]) => ({ id, weight }));
    const wb = calculateWB(stationWeights);
    
    // Evaluate safety using the decision engine
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

  useEffect(() => {
    if (onResultChange && results) {
      onResultChange(results);
    }
  }, [results, onResultChange]);

  const cgData = [{ x: results.centerOfGravity, y: results.totalWeight }];
  const envelopeData = C172S_DEFAULT.envelope.map(p => ({ x: p.arm, y: p.weight }));

  if (isCompact) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="grid gap-4">
             {C172S_DEFAULT.stations.map((station) => (
               <div key={station.id} className="flex items-center gap-4">
                 <Label htmlFor={station.id} className="w-32 text-xs font-bold uppercase truncate text-zinc-400">{station.name}</Label>
                 <Input
                   id={station.id}
                   type="number"
                   placeholder="0"
                   className="h-10 rounded-lg flex-1 bg-zinc-900 border-white/5"
                   value={weights[station.id] || ""}
                   onChange={(e) => handleWeightChange(station.id, e.target.value)}
                 />
                 <span className="text-[10px] w-8 text-zinc-500">lbs</span>
               </div>
             ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="p-6 bg-zinc-900 rounded-3xl border border-white/5 flex justify-between items-center text-center">
             <div className="flex-1 border-r border-white/5">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Total Weight</p>
                <p className={`text-2xl font-black ${results.isOverweight ? 'text-red-500' : 'text-white'}`}>{Math.round(results.totalWeight)} lbs</p>
             </div>
             <div className="flex-1">
                <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">CG Location</p>
                <p className={`text-2xl font-black ${results.isOutOfCG ? 'text-red-500' : 'text-white'}`}>{results.centerOfGravity.toFixed(2)} in</p>
             </div>
          </div>
          
          <div className={`p-4 rounded-2xl border-l-4 transition-all duration-300 ${
            results.decision?.status === 'GO' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200' : 
            results.decision?.status === 'CAUTION' ? 'bg-amber-500/10 border-amber-500 text-amber-200' : 
            'bg-red-500/10 border-red-500 text-red-200'
          }`}>
            <div className="flex items-center gap-2 mb-1">
               {results.decision?.status === 'GO' ? <ShieldCheck className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
               <p className="text-xs font-black uppercase tracking-widest">{results.decision?.status || 'GO'}</p>
            </div>
            <p className="text-[11px] leading-tight opacity-80">{results.decision?.recommendation || 'Flight parameters within normal limits.'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Standalone Display Mode */}
      <div className="space-y-6">
        <Card className="border-2 shadow-xl">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2 italic uppercase tracking-tighter">
              <Scale className="w-5 h-5 text-blue-500" />
              Loading Stations
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
              <div key={station.id} className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor={station.id} className="text-sm font-black uppercase tracking-tight text-zinc-600 dark:text-zinc-400">
                    {station.name}
                  </Label>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
                    Arm: {station.arm}"
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id={station.id}
                    type="number"
                    placeholder="0"
                    className="pl-9 h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-none shadow-inner"
                    value={weights[station.id] || ""}
                    onChange={(e) => handleWeightChange(station.id, e.target.value)}
                  />
                  <Weight className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />
                  <span className="absolute right-3 top-3 text-[10px] text-zinc-400 font-black uppercase">lbs</span>
                </div>
              </div>
            ))}

            <div className="pt-4 p-4 bg-blue-500/5 rounded-2xl flex gap-3 text-xs text-blue-600 dark:text-blue-400 italic">
              <Info className="w-4 h-4 shrink-0" />
              <p>Values based on standard C172S. Always verify with your aircraft's specific weight & balance sheet.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-2 shadow-xl overflow-hidden">
          <div className={`h-2 w-full transition-colors duration-500 ${results.isOverweight || results.isOutOfCG ? "bg-red-500" : "bg-emerald-500"}`} />
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl italic uppercase tracking-tighter">Mission Safety Analysis</CardTitle>
              {results.decision && (
                <Badge className={`font-black uppercase tracking-widest ${
                  results.decision.status === 'GO' ? 'bg-emerald-500' : 'bg-red-500'
                }`}>
                  {results.decision.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Gross Weight</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black italic tracking-tighter ${results.isOverweight ? "text-red-500" : "text-white"}`}>
                      {Math.round(results.totalWeight)}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">lbs</span>
                  </div>
                </div>
                <div className="space-y-1 p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-white/5">
                  <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">C.G. Arm</p>
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-black italic tracking-tighter ${results.isOutOfCG ? "text-red-500" : "text-white"}`}>
                      {results.centerOfGravity.toFixed(2)}
                    </span>
                    <span className="text-xs font-bold text-zinc-500">in</span>
                  </div>
                </div>
              </div>

            <div className="mt-8 space-y-3">
               <div className={`p-4 rounded-xl border-l-4 flex flex-col gap-1 transition-all duration-300 ${
                 results.isOverweight ? 'bg-red-500/10 border-red-500' : results.isNearLimit ? 'bg-amber-500/10 border-amber-500' : 'bg-emerald-500/10 border-emerald-500'
               }`}>
                  <div className="flex justify-between items-center w-full uppercase tracking-tighter font-black text-[10px] opacity-70">
                    <span>Remaining Useful Load</span>
                    <span>{results.isOverweight ? 'LIMIT EXCEEDED' : 'OK'}</span>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black italic tracking-tighter">{Math.abs(Math.round(results.margin))}</span>
                    <span className="text-xs font-black uppercase tracking-widest opacity-60">lbs</span>
                  </div>
               </div>
               
               {results.decision?.recommendation && (
                 <div className="flex items-start gap-3 p-4 bg-zinc-900/50 rounded-xl border border-white/5 text-[11px] italic text-zinc-400 leading-tight">
                    <ShieldAlert className="w-4 h-4 shrink-0 text-zinc-500" />
                    <p>{results.decision.recommendation}</p>
                 </div>
               )}
            </div>
          </CardContent>
        </Card>

        {/* Chart Card */}
        <Card className="border-2 shadow-xl h-[380px]">
           <CardContent className="h-full pt-6">
              <ResponsiveContainer width="100%" height="100%">
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
