"use client";

import React, { useState, type KeyboardEvent } from "react";
import { 
  Cloud, 
  Wind, 
  Eye, 
  CloudSun, 
  ThermometerSun, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Activity,
  Navigation
} from "lucide-react";
import { GlassCard, GlassCardContent } from "@/components/ui/GlassCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  metar: {
    icao: string;
    raw: string;
    station: string;
    flightCategory: string;
    wind: {
      direction: number | null;
      speed: number | null;
      gust: number | null;
      unit: string;
    };
    visibility: {
      value: number | null;
      unit: string;
    };
    ceiling: {
      value: number | null;
      unit: string;
    };
    temperature: number | null;
    dewpoint: number | null;
    altimeter: number | null;
    altimeterUnit: string;
    time: string;
  } | null;
  isLoading?: boolean;
  error?: string | null;
  onAirportChange?: (icao: string) => void;
  onResetToFavorite?: () => void;
  isFavorite?: boolean;
}

export function WeatherWidget({ 
  metar, 
  isLoading, 
  error, 
  onAirportChange, 
  onResetToFavorite, 
  isFavorite = false 
}: WeatherWidgetProps) {
  const [isRawExpanded, setIsRawExpanded] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");

  if (isLoading || !metar) {
    return (
      <GlassCard bezel={true} className="animate-pulse">
        <GlassCardContent className="h-48 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
             <Activity className="w-8 h-8 text-zinc-800 dark:text-zinc-800 light:text-slate-300 animate-bounce" />
             <span className="text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-600 light:text-slate-400">Syncing Weather Systems...</span>
          </div>
        </GlassCardContent>
      </GlassCard>
    );
  }

  const category = metar.flightCategory || "UNKNOWN";
  const spread = (metar.temperature !== null && metar.dewpoint !== null) 
    ? metar.temperature - metar.dewpoint 
    : null;
  const isFogRisk = spread !== null && spread <= 3;

  const handleSearch = () => {
    if (inputValue.length === 4 && onAirportChange) {
      onAirportChange(inputValue.toUpperCase());
      setInputValue("");
      setIsSearchExpanded(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <div className="space-y-4">
      <GlassCard bezel={true} className="overflow-hidden">
        {/* HEADER: High Intensity Category & Station */}
        <div className="flex items-stretch border-b border-[var(--glass-border)] h-16">
          <div className={cn(
            "w-24 flex items-center justify-center border-r border-[var(--glass-border)]",
            getCategoryColorStyle(category)
          )}>
            <span className="text-xl font-black italic tracking-tighter">{category}</span>
          </div>
          
          <div className="flex-1 px-4 flex items-center justify-between">
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 light:text-slate-500 leading-none mb-1">Station ID</span>
               <span className="text-sm font-bold text-foreground truncate max-w-[120px]">
                 {metar.station || metar.icao}
               </span>
            </div>
            
            <button 
              onClick={() => setIsSearchExpanded(!isSearchExpanded)}
              className="p-3 bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-slate-200/50 rounded-lg border border-[var(--glass-border)] text-zinc-400 dark:text-zinc-400 light:text-slate-600 hover:text-blue-500 transition-all active:scale-95"
            >
              <Search className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SEARCH DRAWER */}
        {isSearchExpanded && (
          <div className="p-4 bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-slate-100/50 border-b border-[var(--glass-border)] animate-in slide-in-from-top duration-300">
             <div className="flex gap-2">
                <Input 
                  placeholder="ICAO" 
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  className="h-12 bg-zinc-950 dark:bg-zinc-950 light:bg-white border-[var(--glass-border)] text-lg font-black tracking-widest text-blue-500 placeholder:text-zinc-800 dark:placeholder:text-zinc-800 light:placeholder:text-slate-300" 
                  maxLength={4}
                />
                <Button onClick={handleSearch} className="h-12 px-6 bg-blue-600 hover:bg-blue-500 font-bold uppercase">SET</Button>
                {onResetToFavorite && !isFavorite && (
                  <Button variant="ghost" onClick={onResetToFavorite} className="h-12 text-zinc-500 light:text-slate-400">
                    <Navigation className="w-4 h-4" />
                  </Button>
                )}
             </div>
          </div>
        )}

        <GlassCardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            
            {/* PRIMARY BLOCK: Temp & Wind (Big Glanceability) */}
            <div className="flex-1 space-y-4">
              <div className="flex items-baseline gap-2">
                 <span className="text-7xl font-black tracking-tighter text-foreground">
                   {metar.temperature ?? "--"}
                 </span>
                 <span className="text-2xl font-black text-zinc-600 dark:text-zinc-600 light:text-slate-400 italic">°C</span>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-zinc-950/20 dark:bg-zinc-950/20 light:bg-slate-50/50 border border-[var(--glass-border)] rounded-2xl">
                 <div className="p-3 bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-slate-200 rounded-xl">
                    <Wind className="w-6 h-6 text-blue-500" />
                 </div>
                 <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-500 light:text-slate-500">Surface Winds</span>
                    <span className="text-xl font-black text-foreground mono">
                      {metar.wind.direction?.toString().padStart(3, '0') ?? "VRB"}@{metar.wind.speed ?? "00"}{metar.wind.gust ? `G${metar.wind.gust}` : ""}
                      <span className="text-xs ml-1 text-zinc-500 dark:text-zinc-500 light:text-slate-400">{metar.wind.unit}</span>
                    </span>
                 </div>
              </div>
            </div>

            {/* SECONDARY BLOCK: Instrument Stack */}
            <div className="w-full lg:w-48 space-y-2">
               <InstrumentTile 
                 label="Visibility" 
                 value={`${metar.visibility.value ?? "--"} ${metar.visibility.unit}`} 
                 icon={<Eye className="w-3 h-3" />} 
               />
               <InstrumentTile 
                 label="Cloud Base" 
                 value={metar.ceiling.value ? `${metar.ceiling.value.toLocaleString()} ft` : "Unlimited"} 
                 icon={<CloudSun className="w-3 h-3" />} 
               />
               <InstrumentTile 
                 label="Altimeter" 
                 value={formatAltimeter(metar.altimeter, metar.altimeterUnit)} 
                 icon={<HashIcon className="w-3 h-3" />} 
                 mono
               />
               <InstrumentTile 
                 label="Temp/Dew Spread" 
                 value={spread !== null ? `${spread}°C` : "--"} 
                 icon={<ThermometerSun className="w-3 h-3" />} 
                 alert={isFogRisk ? "Warning: High Fog Risk" : undefined}
                 isWarning={isFogRisk}
               />
            </div>
          </div>

          <div className="mt-6 flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-600 dark:text-zinc-600 light:text-slate-400">
             <span>Station Updated {new Date(metar.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
             {isFavorite && <span className="text-blue-500/50">Primary Station</span>}
          </div>
        </GlassCardContent>
      </GlassCard>

      {/* FOOTER: Collapsible Raw Data */}
      <div className="px-2">
        <button 
          onClick={() => setIsRawExpanded(!isRawExpanded)}
          className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 hover:text-zinc-400 transition-colors py-2"
        >
          {isRawExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          Raw METAR Stream
        </button>
        
        {isRawExpanded && (
          <div className="mt-2 p-4 bg-black/50 dark:bg-black/50 light:bg-slate-100 border border-[var(--glass-border)] rounded-xl font-mono text-[10px] text-zinc-400 dark:text-zinc-400 light:text-slate-600 leading-relaxed animate-in fade-in duration-300">
            {metar.raw}
          </div>
        )}
      </div>
    </div>
  );
}

function InstrumentTile({ label, value, icon, mono = false, isWarning = false, alert }: { label: string; value: string; icon: React.ReactNode, mono?: boolean, isWarning?: boolean, alert?: string }) {
  return (
    <div className={cn(
      "p-3 rounded-xl border flex flex-col transition-colors",
      isWarning ? "bg-red-500/10 border-red-500/30" : "bg-zinc-950/10 dark:bg-zinc-950/20 light:bg-slate-50/50 border-[var(--glass-border)] hover:border-zinc-700"
    )}>
      <div className="flex items-center gap-2 text-zinc-500 mb-1">
        {icon}
        <span className="text-[9px] font-black uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn(
        "text-sm font-bold",
        mono ? "font-mono" : "",
        isWarning ? "text-red-500 dark:text-red-400" : "text-foreground"
      )}>
        {value}
      </div>
      {alert && <span className="text-[8px] font-bold uppercase text-red-500 mt-1">{alert}</span>}
    </div>
  );
}

function getCategoryColorStyle(category: string) {
  switch (category) {
    case "VFR": return "bg-green-500/10 text-green-500";
    case "MVFR": return "bg-blue-500/10 text-blue-500";
    case "IFR": return "bg-red-500/10 text-red-500";
    case "LIFR": return "bg-purple-500/10 text-purple-500";
    default: return "bg-zinc-800/20 text-zinc-500";
  }
}

function formatAltimeter(val: number | null, unit: string) {
  if (val === null) return "--";
  if (unit === "inHg") return val.toFixed(2);
  return Math.round(val).toString();
}

function HashIcon({ className }: { className?: string }) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      className={className}
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}
