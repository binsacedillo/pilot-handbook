"use client";

import { Plane, Clock } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface AircraftCardPreviewProps {
  registration: string;
  make: string;
  model: string;
  status: string;
  imageUrl?: string;
  flightHours?: number;
}

export function AircraftCardPreview({
  registration,
  make,
  model,
  status,
  imageUrl,
  flightHours = 0,
}: AircraftCardPreviewProps) {
  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-4 px-2 italic">
        Systems Preview // Live Feed
      </div>
      
      <GlassCard className="overflow-hidden border-blue-500/30 shadow-blue-500/10 shadow-2xl scale-[1.02] transition-all duration-500">
        <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900/50">
          {/* Card HUD Scanline */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-20">
            <div className="w-full h-[1px] bg-blue-500/30 blur-[1px] animate-hud-scanline" />
          </div>

          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={registration || "Aircraft Preview"}
              fill
              className="object-cover"
              unoptimized // Preview might use temporary URLs or external ones
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gradient-to-br from-blue-500/5 to-transparent">
              <Plane className="w-10 h-10 text-zinc-300 dark:text-zinc-800/50" />
            </div>
          )}
          
          <div className="absolute top-3 right-3 z-30">
            <span className={cn(
              "text-[8px] px-2 py-0.5 rounded-sm uppercase font-black tracking-widest shadow-lg border border-white/10 backdrop-blur-md transition-all duration-300",
              status === 'operational' ? 'annunciator-verified' :
                status === 'maintenance' ? 'annunciator-flag' : 'bg-rose-500/90 text-white'
            )}>
              {status === 'operational' ? '[ OPERATIONAL ]' : `[ ${status.toUpperCase()} ]`}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-xl font-black tracking-tighter text-foreground uppercase truncate pr-2">
              {registration || "N-XXXXX"}
            </h3>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-zinc-900/5 dark:bg-white/5 border border-(--glass-border) shrink-0">
              <Clock className="w-2.5 h-2.5 text-blue-500" />
              <span className="text-[9px] font-black tracking-widest text-foreground">{flightHours.toFixed(1)}H</span>
            </div>
          </div>

          <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-zinc-500 italic">
            {make || "Manufacturer"} {model || "Model"}
          </p>
        </div>
      </GlassCard>
      
      <div className="mt-4 grid grid-cols-4 gap-1 px-1">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-0.5 bg-blue-500/20 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 animate-hud-shimmer w-full" style={{ animationDelay: `${i * 0.2}s` }} />
          </div>
        ))}
      </div>
    </div>
  );
}
