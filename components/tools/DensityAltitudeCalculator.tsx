"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { trpc } from "@/src/trpc/client";
import { 
  calculatePressureAltitude, 
  calculateDensityAltitude 
} from "@/lib/aviation-math";
import { Thermometer, MapPin, AlertTriangle, RefreshCw } from "lucide-react";

export default function DensityAltitudeCalculator() {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
      return { pressureAltitude: pa, densityAltitude: da };
    }
    return null;
  }, [elevation, altimeter, temperature]);

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 dark:border-blue-900 shadow-lg">
        <CardHeader className="bg-blue-50/50 dark:bg-blue-900/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg text-blue-600 dark:text-blue-300">
              <RefreshCw className="w-6 h-6" />
            </div>
            <div>
              <CardTitle>Density Altitude Calculator</CardTitle>
              <CardDescription>
                Determine aerodynamic altitude based on current weather conditions.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-2">
                  <MapPin className="w-4 h-4" /> Quick Fetch (Optional)
                </div>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Enter ICAO (e.g. KJFK)" 
                    value={icao}
                    onChange={(e) => setIcao(e.target.value.toUpperCase())}
                    maxLength={4}
                    className="uppercase"
                  />
                  <Button 
                    variant="outline" 
                    onClick={handleFetchMetar} 
                    disabled={isLoading || icao.length !== 4}
                  >
                    {isLoading ? "Fetching..." : "Fetch Weather"}
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                <div className="space-y-2">
                  <Label htmlFor="elev">Airport Elevation (ft)</Label>
                  <Input 
                    id="elev"
                    type="number"
                    value={elevation}
                    onChange={(e) => setElevation(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alt">Altimeter (inHg)</Label>
                  <Input 
                    id="alt"
                    type="number"
                    step="0.01"
                    value={altimeter}
                    onChange={(e) => setAltimeter(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="temp">Temperature (°C)</Label>
                  <Input 
                    id="temp"
                    type="number"
                    value={temperature}
                    onChange={(e) => setTemperature(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-center items-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-800 relative">
              {results && (
                <div className="text-center space-y-4 w-full">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Density Altitude</p>
                    <div className="flex items-center justify-center gap-2">
                      <Thermometer className={`w-8 h-8 ${results.densityAltitude > results.pressureAltitude ? "text-red-500" : "text-blue-500"}`} />
                      <p className="text-5xl font-bold font-mono tracking-tighter">
                        {results.densityAltitude.toLocaleString()} <span className="text-xl text-muted-foreground ml-1">ft</span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex justify-between w-full px-4">
                    <div className="text-left">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Pressure Alt</p>
                      <p className="text-lg font-mono font-bold">{results.pressureAltitude.toLocaleString()} ft</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground uppercase font-semibold">Deviation</p>
                      <p className={`text-lg font-mono font-bold ${results.densityAltitude > results.pressureAltitude ? "text-red-600" : "text-blue-600"}`}>
                        {results.densityAltitude > results.pressureAltitude ? "+" : ""}{(results.densityAltitude - results.pressureAltitude).toLocaleString()} ft
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 p-3 bg-amber-50 dark:bg-amber-950/30 rounded border border-amber-200 dark:border-amber-900/50 flex gap-3 text-xs text-amber-800 dark:text-amber-400">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <p>
                  <strong>Disclaimer:</strong> This calculation is for supplemental planning only. 
                  Always use your official POH/AFM for final performance data.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
