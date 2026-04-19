"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { 
  calculatePressureAltitude, 
  calculateDensityAltitude 
} from "@/lib/aviation-math";
import { evaluateFlightSafety } from "@/lib/decision/engine";
import { Badge } from "@/components/ui/badge";
import { Thermometer, MapPin, AlertTriangle, RefreshCw, ShieldCheck, ShieldAlert, ShieldX, Info } from "lucide-react";

interface DensityAltitudeCalculatorProps {
  isCompact?: boolean;
  onResultChange?: (results: any) => void;
}

export default function DensityAltitudeCalculator({ isCompact = false, onResultChange }: DensityAltitudeCalculatorProps) {
  const [elevation, setElevation] = useState<string>("0");
  const [altimeter, setAltimeter] = useState<string>("29.92");
  const [temperature, setTemperature] = useState<string>("15");
  const [icao, setIcao] = useState<string>("");
  
  const { data: metar, isLoading, refetch } = trpc.weather.getMetar.useQuery(
    { icao: icao.toUpperCase() },
    { enabled: false }
  );

  const handleFetchMetar = () => {
    if (icao.length === 4) {
      refetch();
    }
  };

  useEffect(() => {
    if (metar) {
      if (metar.altimeter) setAltimeter(metar.altimeter.toString());
      if (metar.temperature !== null) setTemperature(metar.temperature.toString());
    }
  }, [metar]);

  const results = useMemo(() => {
    const elev = parseFloat(elevation);
    const alt = parseFloat(altimeter);
    const temp = parseFloat(temperature);

    if (!isNaN(elev) && !isNaN(alt) && !isNaN(temp)) {
      const pa = calculatePressureAltitude(elev, alt);
      const da = calculateDensityAltitude(pa, temp);
      const decision = evaluateFlightSafety('density-altitude', { 
        elevation: elev,
        altimeter: alt,
        temperature: temp,
        densityAltitude: da 
      });
      return { 
        pressureAltitude: pa, 
        densityAltitude: da,
        decision 
      };
    }
    return null;
  }, [elevation, altimeter, temperature]);

  useEffect(() => {
    if (onResultChange && results) {
      onResultChange(results);
    }
  }, [results, onResultChange]);

  if (isCompact) {
    return (
      <div className="space-y-6 sm:space-y-8 font-sans">
        <div className="flex flex-col lg:grid lg:grid-cols-2 gap-6 sm:gap-8 text-white">
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">Elevation (ft)</Label>
                <Input type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} className="h-11 sm:h-12 bg-zinc-900 border-white/5 text-base" />
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">Altimeter (inHg)</Label>
                <Input type="number" step="0.01" value={altimeter} onChange={(e) => setAltimeter(e.target.value)} className="h-11 sm:h-12 bg-zinc-900 border-white/5 text-base" />
              </div>
              <div className="space-y-1.5 sm:space-y-2 text-left">
                <Label className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">Temp (°C)</Label>
                <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="h-11 sm:h-12 bg-zinc-900 border-white/5 text-base" />
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center items-center p-5 sm:p-8 bg-zinc-900 rounded-3xl border border-white/5 relative shadow-xl">
            {results && (
              <div className="text-center space-y-4 w-full">
                <div className="space-y-1">
                  <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest">Calculated Density Altitude</p>
                  <div className="flex items-center justify-center gap-2">
                    <Thermometer className={`w-8 h-8 sm:w-10 sm:h-10 ${results.densityAltitude > results.pressureAltitude ? "text-red-500 animate-pulse" : "text-blue-500"}`} />
                    <p className="text-4xl sm:text-5xl font-black italic tracking-tighter">
                      {results.densityAltitude.toLocaleString()} <span className="text-lg sm:text-xl text-zinc-500 ml-1 not-italic">FT</span>
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                  <div className="text-left">
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none mb-1">Pressure Alt</p>
                    <p className="text-lg sm:text-xl font-bold tracking-tight text-zinc-300">
                      {results.pressureAltitude.toLocaleString()}<span className="text-[10px] ml-1">ft</span>
                    </p>
                  </div>
                   <div className="text-right">
                    <p className="text-[10px] text-zinc-600 uppercase font-black tracking-widest leading-none mb-1">Calculated Deviation</p>
                    <p className={`text-lg sm:text-xl font-black italic tracking-tight ${results.densityAltitude > results.pressureAltitude ? "text-red-500" : "text-emerald-500"}`}>
                      {results.densityAltitude > results.pressureAltitude ? "+" : ""}{(results.densityAltitude - results.pressureAltitude).toLocaleString()} ft
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {results?.decision && results.decision.status !== 'NORMAL' && (
          <div className={`p-4 rounded-2xl border-l-4 transition-all duration-300 ${
            results.decision.status === 'CAUTION' ? 'bg-amber-500/10 border-amber-500 text-amber-200' : 'bg-red-500/10 border-red-500 text-red-200'
          }`}>
             <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest">Performance Status: {results.decision.status}</p>
                  <p className="text-[11px] leading-tight opacity-80 italic">{results.decision.recommendation}</p>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-2 shadow-xl">
        <CardHeader className="bg-zinc-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500 border border-blue-500/20">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <CardTitle className="italic uppercase tracking-tighter text-xl">Performance Check</CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                Atmospheric conditions and Climb Safety
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase text-zinc-400">
                  <MapPin className="w-4 h-4" /> System Integration / METAR
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="ICAO" 
                    value={icao}
                    onChange={(e) => setIcao(e.target.value.toUpperCase())}
                    maxLength={4}
                    className="uppercase bg-zinc-50 dark:bg-zinc-900 border-none shadow-inner h-11"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleFetchMetar} 
                    disabled={isLoading || icao.length !== 4}
                    className="h-11 rounded-xl"
                  >
                    {isLoading ? "Fetching..." : "Auto-Fill"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">Elevation (ft)</Label>
                  <Input type="number" value={elevation} onChange={(e) => setElevation(e.target.value)} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">Altimeter (inHg)</Label>
                  <Input type="number" step="0.01" value={altimeter} onChange={(e) => setAltimeter(e.target.value)} className="rounded-xl h-11" />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase">Temperature (°C)</Label>
                  <Input type="number" value={temperature} onChange={(e) => setTemperature(e.target.value)} className="rounded-xl h-11" />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center p-8 bg-zinc-50 dark:bg-zinc-900 rounded-3xl border border-white/5 relative">
              {results && (
                <div className="text-center space-y-4 w-full">
                  <div className="space-y-1">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Calculated Density Altitude</p>
                      {results.decision && (
                        <Badge className={`font-black uppercase tracking-widest bg-blue-500`}>
                           {results.decision.status}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-center gap-2 py-4">
                      <Thermometer className={`w-10 h-10 ${results.densityAltitude > results.pressureAltitude ? "text-red-500" : "text-blue-500"}`} />
                      <p className="text-6xl font-black italic tracking-tighter">
                        {results.densityAltitude.toLocaleString()} 
                        <span className="text-2xl text-zinc-500 ml-2 not-italic">FT</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-6 mt-4 border-t border-zinc-200 dark:border-zinc-800 flex justify-between w-full px-4 text-center">
                    <div className="flex-1">
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Pressure Alt</p>
                      <p className="text-xl font-black italic">{results.pressureAltitude.toLocaleString()} ft</p>
                    </div>
                    <div className="flex-1 border-l border-zinc-200 dark:border-zinc-800">
                      <p className="text-[10px] text-zinc-500 uppercase font-black tracking-widest">Deviation</p>
                      <p className={`text-xl font-black italic ${results.densityAltitude > results.pressureAltitude ? "text-red-600 animate-pulse" : "text-blue-600"}`}>
                        {results.densityAltitude > results.pressureAltitude ? "+" : ""}{(results.densityAltitude - results.pressureAltitude).toLocaleString()} ft
                      </p>
                    </div>
                  </div>

                   {results.decision && (
                    <div className="space-y-4 w-full mt-6">
                      <div className={`
                        w-full p-4 rounded-xl border-l-4 text-left flex flex-col gap-2 transition-all duration-300
                        ${results.decision.status === 'NORMAL' ? 'bg-emerald-500/10 border-emerald-500 text-emerald-200' : 
                          results.decision.status === 'CAUTION' ? 'bg-amber-500/10 border-amber-500 text-amber-200' : 
                          'bg-red-500/10 border-red-500 text-red-200'}
                      `}>
                         <div className="flex items-center gap-2">
                            <ShieldAlert className="w-4 h-4 shrink-0" />
                            <p className="text-[10px] font-black uppercase tracking-widest leading-none">Status: {results.decision.status}</p>
                         </div>
                         <p className="text-xs font-bold leading-tight">{results.decision.implication}</p>
                         <p className="text-[11px] leading-tight opacity-70 italic">{results.decision.recommendation}</p>
                      </div>

                      <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/10 flex gap-3 text-xs text-blue-400 italic text-left">
                         <Info className="w-4 h-4 shrink-0 mt-0.5 text-blue-500" />
                         <div className="space-y-1">
                           <p className="font-black uppercase tracking-widest text-[10px] not-italic text-blue-500">Mentorship Tip</p>
                           <p>{results.decision.mentorship}</p>
                         </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
