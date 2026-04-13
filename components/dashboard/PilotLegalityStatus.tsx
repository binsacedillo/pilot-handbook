"use client";
import React, { useState } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  User, 
  IdCard,
  Clock,
  Heart,
  Settings2,
  X,
  RefreshCcw,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import EditPilotProfileForm from "./EditPilotProfileForm";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { type RouterOutputs } from "@/trpc/shared";

type LegalityStats = RouterOutputs["flight"]["getStats"];

interface PilotLegalityStatusProps {
  pilotName: string;
  initialStats?: LegalityStats;
}

export default function PilotLegalityStatus({ pilotName, initialStats }: PilotLegalityStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  // REACTIVE LAYER: Hydration Pattern (Server Initial -> Client Live)
  const { 
    data: fetchedStats, 
    isFetching, 
    isError 
  } = trpc.flight.getStats.useQuery(undefined, {
    initialData: initialStats,
    refetchOnMount: false,
    staleTime: 1000 * 60,
  });

  // DEFENSIVE DEFAULTS (ISO 9241-110 compliance)
  const fallbackStats = {
    totalFlights: 0,
    totalHours: 0,
    totalPicHours: 0,
    totalDualHours: 0,
    totalLandings: 0,
    compliance: null,
    legality: {
      isTotalGo: true, // Default to Go/Ready if no data
      landingCurrency: { isCurrent: true, count: 0 },
      medical: { isCurrent: true, daysRemaining: 0 },
      rest: { isCurrent: true, hoursSinceRest: 0 },
      alerts: []
    },
    profile: null
  };

  const stats = fetchedStats ?? initialStats ?? fallbackStats;
  const legality = stats.legality;
  const profile = stats.profile;
  const isGo = legality?.isTotalGo ?? true;
  
  return (
    <div className="relative group">
      {/* ISO 9241 Sync Indicator */}
      <div className="absolute -top-3 right-4 z-20 flex items-center gap-2">
        {isFetching && (
          <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center gap-1.5 animate-pulse">
            <RefreshCcw className="w-2.5 h-2.5 text-blue-500 animate-spin" />
            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Syncing</span>
          </div>
        )}
        {isError && (
          <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
            <Database className="w-2.5 h-2.5 text-amber-500" />
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Cached</span>
          </div>
        )}
      </div>

      <GlassCard className={cn("border-l-4 transition-all duration-700 shadow-lg", isGo ? "border-l-emerald-500 shadow-emerald-500/5" : "border-l-red-500 shadow-red-500/5")} bezel={true}>
        <div className="px-6 py-3 bg-zinc-950/40 dark:bg-zinc-950/40 light:bg-slate-50/50 border-b border-(--glass-border) flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900 dark:bg-zinc-900 light:bg-slate-200 rounded-lg border border-(--glass-border)">
              <User className="w-4 h-4 text-zinc-500 dark:text-zinc-500 light:text-slate-600" />
            </div>
            <div className="flex flex-col">
              <span className="text-[9px] uppercase font-black text-zinc-500 dark:text-zinc-500 light:text-slate-500 tracking-[0.2em] leading-none mb-1">Command Pilot</span>
              <span className="text-sm font-black text-foreground tracking-tight">
                {pilotName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/40 border border-(--glass-border)">
              <IdCard className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-500 light:text-slate-500" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black text-zinc-500 dark:text-zinc-500 light:text-slate-500 tracking-tighter leading-none mb-0.5">License / Ratings</span>
                <span className="text-[10px] font-black text-foreground/90 font-mono text-ellipsis overflow-hidden whitespace-nowrap max-w-[120px]">
                  {profile?.licenseNumber || "UNREGISTERED"} <span className="text-zinc-500">[{profile?.licenseType || "PPL"}]</span>
                </span>
              </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-(--glass-border) bg-zinc-900/60 text-zinc-500 hover:text-blue-500 hover:border-blue-500/50 transition-all text-[9px] font-black uppercase tracking-widest shadow-inner">
                  <Settings2 className="w-3 h-3" />
                  Configure System
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-(--glass-bg) border-(--glass-border) p-0 overflow-hidden shadow-2xl backdrop-blur-3xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>Configure Pilot Profile</DialogTitle>
                  <DialogDescription>Update your aviation credentials.</DialogDescription>
                </DialogHeader>
                <div className="absolute right-4 top-4 z-50">
                   <button onClick={() => setIsOpen(false)} className="p-2 text-zinc-500 hover:text-foreground transition-colors">
                      <X className="w-4 h-4" />
                   </button>
                </div>
                <EditPilotProfileForm initialData={profile} onSuccess={() => setIsOpen(false)} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

      <div className="p-6">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className={cn(
            "w-full md:w-fit px-10 py-8 rounded-xl border-2 flex flex-col items-center justify-center transition-all duration-700 relative overflow-hidden",
            isGo 
              ? "bg-emerald-500/5 border-emerald-500/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.2)]" 
              : "bg-red-500/5 border-red-500/20 shadow-[0_0_40px_-10px_rgba(239,68,68,0.2)]"
          )}>
            <div className={cn(
              "text-[10px] font-black uppercase tracking-[0.4em] mb-3",
              isGo ? "text-emerald-500/80" : "text-red-500/80"
            )}>
              Pre-Flight Legality
            </div>
            <div className={cn(
              "text-5xl font-black italic tracking-tighter",
              isGo ? "text-emerald-500" : "text-red-500",
              "drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]"
            )}>
              {isGo ? "SYSTEM GO" : "NO-GO ALERT"}
            </div>
            <div className={cn(
               "mt-2 text-[9px] font-bold uppercase tracking-widest",
               isGo ? "text-emerald-600/60" : "text-red-600/60"
            )}>
               {isGo ? "Nominal Operations" : "Check Interlocks"}
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
            <StatusIcon 
              label="Currency" 
              value={legality?.landingCurrency ? `${legality.landingCurrency.count}/3 Lndgs` : "0/3 Lndgs"}
              isOk={legality?.landingCurrency?.isCurrent ?? true}
              icon={<ShieldAlert className="w-4 h-4" />}
            />
            <StatusIcon 
              label="Medical" 
              value={legality?.medical?.isCurrent ? `${legality.medical.daysRemaining} Days` : "Caution"}
              isOk={legality?.medical?.isCurrent ?? true}
              icon={<Heart className="w-4 h-4" />}
            />
            <StatusIcon 
              label="Rest" 
              value={legality?.rest?.isCurrent ? "Ready" : "Rest Alert"}
              isOk={legality?.rest?.isCurrent ?? true}
              icon={<Clock className="w-4 h-4" />}
            />
          </div>
        </div>

        {legality?.alerts && legality.alerts.length > 0 && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-2">
            {legality.alerts.map((alert, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 bg-zinc-950/20 border border-(--glass-border) rounded-lg text-[10px] font-bold text-zinc-400 group/alert">
                <AlertTriangle className={cn("w-3.5 h-3.5 shrink-0", alert.includes("Critical") || alert.includes("expired") ? "text-red-500" : "text-amber-500")} />
                <span className="tracking-tight group-hover/alert:text-zinc-200 transition-colors line-clamp-1">{alert}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </GlassCard>
  </div>
  );
}

function StatusIcon({ label, value, isOk, icon }: { label: string; value: string; isOk: boolean; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-zinc-950/20 dark:bg-zinc-950/20 light:bg-slate-100/50 rounded-xl border border-(--glass-border) hover:border-zinc-500/30 transition-colors">
      <div className={cn(
        "p-2.5 rounded-lg border",
        isOk ? "bg-emerald-500/5 text-emerald-500 border-emerald-500/10" : "bg-red-500/5 text-red-500 border-red-500/10"
      )}>
        {icon}
      </div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] uppercase font-black text-zinc-500 tracking-wider leading-none">{label}</span>
        <span className={cn("text-xs font-black truncate", isOk ? "text-foreground" : "text-red-500")}>{value}</span>
      </div>
      <div className="ml-auto shrink-0">
        {isOk ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/80" /> : <AlertTriangle className="w-3.5 h-3.5 text-red-500/80 animate-pulse" />}
      </div>
    </div>
  );
}
