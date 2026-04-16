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
    <div className="data-heavy-view rounded-xl border border-zinc-800 shadow-2xl overflow-hidden group/table">
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
                    {/* Selection Indicator Glow */}
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
                    {f.isVerified ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest annunciator-verified">
                        <ShieldCheck className="w-3 h-3" />
                        [ VERIFIED ]
                      </div>
                    ) : (f.dualTime > 0 && !f.signatureData && !f.isVerified) ? (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest annunciator-flag">
                        <AlertTriangle className="w-3 h-3" />
                        [ FLAG ]
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-[9px] font-black uppercase tracking-widest annunciator-pending">
                        <Clock className="w-3 h-3" />
                        [ PENDING ]
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button asChild size="icon" variant="ghost" className="h-8 w-8 text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10">
                        <Link href={`/flights/${f.id}/edit`}>
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => onDelete(f.id, `${f.departureCode} → ${f.arrivalCode}`)}
                        disabled={isDeleting}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
