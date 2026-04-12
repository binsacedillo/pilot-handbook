"use client";

import React, { useState, useMemo } from "react";
import { 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  ZAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Polygon,
  ReferenceArea
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
  TrendingDown
} from "lucide-react";
import { calculateWB, C172S_DEFAULT } from "@/lib/calculations/weight-balance";

export default function WeightBalanceCalculator() {
  const [weights, setWeights] = useState<Record<string, number>>(
    C172S_DEFAULT.stations.reduce((acc, s) => ({ ...acc, [s.id]: 0 }), {})
  );

  const handleWeightChange = (id: string, value: string) => {
    const num = parseFloat(value) || 0;
    setWeights(prev => ({ ...prev, [id]: num }));
  };

  const results = useMemo(() => {
    const stationWeights = Object.entries(weights).map(([id, weight]) => ({ id, weight }));
    return calculateWB(stationWeights);
  }, [weights]);

  // Chart data: current CG point
  const cgData = [{ x: results.centerOfGravity, y: results.totalWeight }];

  // Envelope path for Recharts
  const envelopeData = C172S_DEFAULT.envelope.map(p => ({ x: p.arm, y: p.weight }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Inputs */}
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-500" />
              Weight Stations
            </CardTitle>
            <CardDescription>
              Enter weights in pounds (lbs) for each station.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed text-sm flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Plane className="w-4 h-4" />
                <span>Basic Empty Weight</span>
              </div>
              <span className="font-mono font-bold">{C172S_DEFAULT.emptyWeight} lbs</span>
            </div>

            <Separator />

            {C172S_DEFAULT.stations.map((station) => (
              <div key={station.id} className="grid gap-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor={station.id} className="text-sm font-semibold">
                    {station.name}
                  </Label>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
                    Arm: {station.arm} in
                  </span>
                </div>
                <div className="relative">
                  <Input
                    id={station.id}
                    type="number"
                    placeholder="0"
                    className="pl-9 h-11 rounded-xl"
                    value={weights[station.id] || ""}
                    onChange={(e) => handleWeightChange(station.id, e.target.value)}
                  />
                  <Weight className="absolute left-3 top-3.5 w-4 h-4 text-muted-foreground" />
                  <span className="absolute right-3 top-3 text-xs text-muted-foreground font-medium">lbs</span>
                </div>
              </div>
            ))}

            <div className="pt-4 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl flex gap-3 text-xs text-blue-700 dark:text-blue-300">
              <Info className="w-4 h-4 shrink-0" />
              <p>Values based on standard Cessna 172S Skyhawk configuration. Always verify with your specific POH/AFM.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Visualization & Results */}
      <div className="space-y-6">
        {/* Results Overview */}
        <Card className="border-2 overflow-hidden">
          <div className={`h-2 w-full ${results.isOverweight || results.isOutOfCG ? "bg-red-500" : "bg-green-500"}`} />
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Safety Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter text-slate-400">Total Weight</p>
                <div className="flex items-end gap-1">
                  <span className={`text-2xl font-black ${results.isOverweight ? "text-red-500" : "text-slate-900 dark:text-slate-100"}`}>
                    {Math.round(results.totalWeight)}
                  </span>
                  <span className="text-xs text-muted-foreground pb-1">lbs</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground uppercase font-bold tracking-tighter text-slate-400">Center of Gravity</p>
                <div className="flex items-end gap-1">
                  <span className={`text-2xl font-black ${results.isOutOfCG ? "text-red-500" : "text-slate-900 dark:text-slate-100"}`}>
                    {results.centerOfGravity.toFixed(2)}
                  </span>
                  <span className="text-xs text-muted-foreground pb-1">in</span>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              {results.isOverweight ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-bold">CAUTION: Overweight</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm border border-green-100 dark:border-green-900/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">Weight within limits</span>
                </div>
              )}

              {results.isOutOfCG ? (
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl text-sm border border-red-100 dark:border-red-900/30">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="font-bold">CAUTION: Center of Gravity Out of Envelope</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl text-sm border border-green-100 dark:border-green-900/30">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-medium">CG within envelope</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* CG Chart */}
        <Card className="border-2 h-[400px]">
          <CardHeader className="pb-0">
             <CardTitle className="text-sm font-bold flex items-center gap-2 text-muted-foreground">
               <TrendingDown className="w-4 h-4" />
               CG Envelope
             </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px] w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 10, right: 30, bottom: 20, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Arm" 
                  unit=" in" 
                  domain={[34, 48]} 
                  label={{ value: 'Center of Gravity (in)', position: 'bottom', offset: 0, fontSize: 12 }}
                  fontSize={10}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Weight" 
                  unit=" lbs" 
                  domain={[1500, 2600]}
                  label={{ value: 'Weight (lbs)', angle: -90, position: 'left', fontSize: 12 }}
                  fontSize={10}
                />
                <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                
                {/* Envelope Boundary */}
                <Scatter 
                  line={{ stroke: '#94a3b8', strokeWidth: 2 }} 
                  data={envelopeData} 
                  fill="transparent"
                  shape={() => <React.Fragment />} 
                  isAnimationActive={false}
                />
                <Scatter 
                  line={{ stroke: '#94a3b8', strokeWidth: 2 }} 
                  data={[envelopeData[envelopeData.length - 1], envelopeData[0]]} 
                  fill="transparent"
                  shape={() => <React.Fragment />}
                  isAnimationActive={false}
                />

                {/* Current Point */}
                <Scatter 
                  name="Current CG" 
                  data={cgData} 
                  fill={results.isOutOfCG || results.isOverweight ? "#ef4444" : "#2563eb"} 
                />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
