"use client";

import { Calendar, Activity, Info } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";

interface UpcomingFlightCardProps {
  upcomingFlight: any | null;
}

export default function UpcomingFlightCard({ upcomingFlight }: UpcomingFlightCardProps) {
  return (
    <GlassCard bezel={true}>
      <GlassCardHeader>
         <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 light:text-slate-500 flex items-center gap-2">
           <Calendar className="w-3 h-3 text-emerald-500" />
           Upcoming Flight
         </h2>
      </GlassCardHeader>
      <GlassCardContent className="space-y-4">
         {upcomingFlight ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                <Activity className="w-12 h-12" />
              </div>
              <div className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mb-2 flex items-center gap-1">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                Flight Preparation Status
              </div>
              <div className="text-lg font-black text-foreground mb-1 leading-tight">
                {upcomingFlight.departureCode} → {upcomingFlight.arrivalCode}
              </div>
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 light:text-slate-500 mb-4">
                ETD: {new Date(upcomingFlight.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
              </div>
              
              <div className="flex gap-2">
                <Button asChild size="sm" className="flex-1 h-8 text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white border-none transition-all">
                  <Link href={`/flights/${upcomingFlight.id}/edit`}>
                    Preflight Prep
                  </Link>
                </Button>
                <div className="w-8 h-8 rounded-lg border border-emerald-500/30 flex items-center justify-center text-emerald-500">
                  <Info className="w-4 h-4" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-zinc-900/5 dark:bg-zinc-950/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl relative overflow-hidden group">
              <div className="text-[10px] font-black text-zinc-500 dark:text-zinc-600 uppercase tracking-[0.2em] mb-4 text-center">
                [ NO UPCOMING FLIGHTS SCHEDULED ]
              </div>
              <Button asChild variant="outline" size="sm" className="w-full h-9 text-[10px] font-black uppercase tracking-widest border-(--glass-border) text-zinc-500 dark:text-zinc-500 hover:text-blue-500 hover:border-blue-500/30 transition-all bg-background/50">
                <Link href="/flights?new=true">
                  Plan Flight
                </Link>
              </Button>
            </div>
          )}
      </GlassCardContent>
    </GlassCard>
  );
}
