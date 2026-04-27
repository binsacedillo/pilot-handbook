"use client";

import { History, BookOpen, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";

interface RecentFlightsCardProps {
  flights: any[];
}

export default function RecentFlightsCard({ flights }: RecentFlightsCardProps) {
  return (
    <GlassCard bezel={true}>
      <GlassCardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-blue-500" />
          <h2 className="text-sm font-bold uppercase tracking-widest text-foreground">Recent Log Entries</h2>
        </div>
        <Link href="/flights">
          <Button size="sm" variant="ghost" className="h-8 text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-500 light:text-slate-500 hover:text-blue-500">
            Full Logbook <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </Link>
      </GlassCardHeader>
      <GlassCardContent>
        {flights && flights.length > 0 ? (
          <div className="space-y-3">
            {flights.slice(0, 4).map((flight: any) => (
              <div 
                key={flight.id} 
                className="group flex items-center justify-between p-3 rounded-xl border border-(--glass-border) bg-zinc-900/10 dark:bg-zinc-900/20 light:bg-slate-50 hover:bg-zinc-900/50 dark:hover:bg-zinc-900/50 light:hover:bg-slate-100 hover:border-blue-500/30 transition-all duration-300"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-900 light:bg-slate-200 border border-(--glass-border) flex items-center justify-center text-xs font-black text-zinc-500 dark:text-zinc-500 light:text-slate-600 group-hover:text-blue-500 transition-colors">
                    {flight.aircraft?.registration.substring(0, 2)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{flight.departureCode} → {flight.arrivalCode}</div>
                    <div className="text-[10px] font-medium text-zinc-500 dark:text-zinc-500 light:text-slate-500 uppercase">{new Date(flight.date).toLocaleDateString()} • {flight.aircraft?.model}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-bold text-foreground">{flight.duration.toFixed(1)}</div>
                  <div className="text-[9px] font-bold text-zinc-600 dark:text-zinc-600 light:text-slate-400 uppercase">Hours</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center">
             <BookOpen className="w-12 h-12 text-zinc-800 mx-auto mb-4" />
             <p className="text-sm text-zinc-500">No flights recorded yet.</p>
          </div>
        )}
      </GlassCardContent>
    </GlassCard>
  );
}
