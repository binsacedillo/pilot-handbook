"use client";

import React from "react";
import { type RouterOutputs } from "@/trpc/shared";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, ShieldCheck, AlertTriangle, Clock } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface FlightTableProps {
  flights: RouterOutputs["flight"]["getAll"];
  onDelete: (id: string, route: string) => void;
  isDeleting: boolean;
}

export function FlightTable({ flights, onDelete, isDeleting }: FlightTableProps) {
  return (
    <div className="space-y-4">
      {/* Desktop/Tablet View - Hidden on small mobile */}
      <div className="hidden md:block data-heavy-view rounded-xl border border-zinc-800 shadow-2xl overflow-hidden group/table">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="min-w-full border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="sticky left-0 z-40 bg-zinc-900 px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 min-w-[120px]">
                  Date
                </th>
                <th className="sticky left-[120px] z-40 bg-zinc-900 px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 min-w-[200px]">
                  Route (DEP → ARR)
                </th>
                <th className="px-6 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Aircraft
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Hours (DEC)
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  PIC
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Dual
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Lndgs (D/N)
                </th>
                <th className="px-6 py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-(--glass-border)">
              {flights.map((f) => {
                return (
                  <tr 
                    key={f.id} 
                    className="group relative hover:bg-blue-500/5 border-b border-zinc-900 transition-all duration-150 ease-out"
                  >
                    <td className="sticky left-0 z-30 bg-background px-6 py-4 text-xs font-bold text-foreground w-[120px] min-w-[120px]">
                      <div className="absolute left-0 inset-y-0 w-[2.5px] bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[0_0_12px_rgba(59,130,246,0.5)]" />
                      
                      {new Date(f.date).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: '2-digit'
                      })}
                    </td>
                    <td className="sticky left-[120px] z-30 bg-background px-6 py-4 w-[200px] min-w-[200px]">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-black tracking-tight text-foreground">
                          {f.departureCode}
                        </span>
                        <span className="text-zinc-600 dark:text-zinc-500">→</span>
                        <span className="text-sm font-black tracking-tight text-foreground">
                          {f.arrivalCode}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-black text-foreground uppercase tracking-wider">{f.aircraft.registration}</span>
                        <span className="text-[10px] text-zinc-500 uppercase">{f.aircraft.make} {f.aircraft.model}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-bold text-blue-500/90 dark:text-blue-400">
                      {f.duration.toFixed(1)}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-medium text-zinc-400">
                      {f.picTime > 0 ? f.picTime.toFixed(1) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-medium text-zinc-400">
                      {f.dualTime > 0 ? f.dualTime.toFixed(1) : "—"}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-sm font-medium text-zinc-400">
                      {f.dayLandings || 0}/{f.nightLandings || 0}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusBadge flight={f} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <ActionButtons flight={f} onDelete={onDelete} isDeleting={isDeleting} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile/Compact View - Cards */}
      <div className="md:hidden space-y-4">
        {flights.map((f) => (
          <GlassCard key={f.id} className="relative overflow-hidden group border-l-4 border-l-blue-500/50">
            <div className="p-4 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">
                    {new Date(f.date).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: '2-digit'
                    })}
                  </p>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-black italic tracking-tighter text-foreground">
                      {f.departureCode} <span className="text-zinc-600">→</span> {f.arrivalCode}
                    </h3>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-blue-500 leading-none">
                    {f.duration.toFixed(1)}
                  </div>
                  <span className="text-[8px] font-black uppercase text-zinc-500 tracking-widest">HOURS</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-zinc-800/50">
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-foreground uppercase">{f.aircraft.registration}</span>
                    <span className="text-[8px] text-zinc-500 uppercase">{f.aircraft.model}</span>
                  </div>
                  <StatusBadge flight={f} compact />
                </div>
                <div className="flex items-center gap-1">
                  <ActionButtons flight={f} onDelete={onDelete} isDeleting={isDeleting} />
                </div>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

// Sub-components for cleaner code
function StatusBadge({ flight, compact }: { flight: any, compact?: boolean }) {
  if (flight.isVerified) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest annunciator-verified",
        compact && "px-1.5 py-0.5 text-[8px]"
      )}>
        <ShieldCheck className="w-3 h-3" />
        {compact ? "VER" : "[ VERIFIED ]"}
      </div>
    );
  }
  if (flight.dualTime > 0 && !flight.signatureData && !flight.isVerified) {
    return (
      <div className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest annunciator-flag",
        compact && "px-1.5 py-0.5 text-[8px]"
      )}>
        <AlertTriangle className="w-3 h-3" />
        {compact ? "FLAG" : "[ FLAG ]"}
      </div>
    );
  }
  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest annunciator-pending",
      compact && "px-1.5 py-0.5 text-[8px]"
    )}>
      <Clock className="w-3 h-3" />
      {compact ? "PND" : "[ PENDING ]"}
    </div>
  );
}

function ActionButtons({ flight, onDelete, isDeleting }: { flight: any, onDelete: any, isDeleting: boolean }) {
  return (
    <>
      <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10">
        <Link href={`/flights/${flight.id}/edit`}>
          <Edit className="w-3.5 h-3.5" />
        </Link>
      </Button>
      <Button 
        size="icon" 
        variant="ghost" 
        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
        onClick={() => onDelete(flight.id, `${flight.departureCode} → ${flight.arrivalCode}`)}
        disabled={isDeleting}
      >
        <Trash2 className="w-3.5 h-3.5" />
      </Button>
    </>
  );
}
