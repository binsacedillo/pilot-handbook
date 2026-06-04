"use client";
import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  AlertTriangle, 
  User, 
  IdCard,
  Clock,
  Heart,
  Settings2,
  X,
  RefreshCcw,
  Database,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import EditPilotProfileForm from "./EditPilotProfileForm";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogHeader, DialogDescription } from "@/components/ui/dialog";
import { trpc } from "@/trpc/client";
import { type RouterOutputs } from "@/trpc/shared";
import { AlertBadge } from "@/components/ui/AlertBadge";
import { useOfflineCache } from "@/hooks/useOfflineCache";

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
      isTotalGo: true,
      landingCurrency: { isCurrent: true, count: 0 },
      medical: { isCurrent: true, daysRemaining: 0 },
      rest: { isCurrent: true, hoursSinceRest: 0 },
      alerts: []
    },
    profile: null
  };

  const rawStats = fetchedStats ?? initialStats ?? fallbackStats;
  
  // Offline persistence hook
  const [cachedStats, updateCache] = useOfflineCache<any>("pilot_status_cache", rawStats);

  // Sync cache when new stats are loaded online
  useEffect(() => {
    if (fetchedStats) {
      updateCache(fetchedStats);
    }
  }, [fetchedStats]);

  const stats = fetchedStats ?? cachedStats;
  const legality = stats.legality;
  const profile = stats.profile;
  const isGo = legality?.isTotalGo ?? true;
  
  return (
    <div className="relative group">
      {/* Sync Indicators */}
      <div className="absolute -top-3 right-4 z-20 flex items-center gap-2">
        {isFetching && (
          <div className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center gap-1.5 animate-pulse">
            <RefreshCcw className="w-2.5 h-2.5 text-blue-500 animate-spin" />
            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">Syncing</span>
          </div>
        )}
        {(isError || !fetchedStats) && (
          <div className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center gap-1.5">
            <Database className="w-2.5 h-2.5 text-amber-500" />
            <span className="text-[8px] font-black text-amber-500 uppercase tracking-widest">Offline Cache</span>
          </div>
        )}
      </div>

      <GlassCard className="border border-white/5 transition-all duration-700 shadow-xl overflow-hidden" bezel={true}>
        {/* Header / Pilot Credentials Area */}
        <div className="px-6 py-5 bg-zinc-950/60 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-zinc-900/80 rounded-xl border border-white/5 shadow-inner flex items-center justify-center">
              <User className="w-5 h-5 text-zinc-400" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.2em] block mb-0.5">Pilot in Command</span>
              <h2 className="text-lg font-black text-white tracking-tight leading-tight">
                {pilotName}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto w-full md:w-auto justify-between md:justify-end">
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/50 border border-white/5 backdrop-blur-md">
              <IdCard className="w-4 h-4 text-zinc-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] uppercase font-black text-zinc-500 tracking-wider mb-0.5">License / Ratings</span>
                <span className="text-xs font-bold text-zinc-100 font-mono">
                  {profile?.licenseNumber || "UNREGISTERED"} <span className="text-zinc-500 text-[10px] font-sans font-black">[{profile?.licenseType || "PPL"}]</span>
                </span>
              </div>
            </div>

            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-white/10 bg-zinc-900/70 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all text-[9px] font-black uppercase tracking-wider shadow-md shrink-0">
                  <Settings2 className="w-3.5 h-3.5" />
                  Update Profile
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl bg-(--glass-bg) border-(--glass-border) p-0 overflow-hidden shadow-2xl backdrop-blur-3xl">
                <DialogHeader className="sr-only">
                  <DialogTitle>Update Pilot Profile</DialogTitle>
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

        {/* Content Body */}
        <div className="p-6">
          <div className="flex flex-col lg:flex-row items-stretch gap-6">
            {/* Status Indicator Panel */}
            <div className={cn(
              "w-full lg:w-[260px] p-6 rounded-2xl border flex flex-col items-center justify-center transition-all duration-700 relative overflow-hidden shrink-0",
              isGo ? "bg-emerald-500/[0.02] border-emerald-500/10" : "bg-red-500/[0.02] border-red-500/10"
            )}>
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-3">
                Preflight Status
              </div>
              <div className={cn(
                "text-2xl sm:text-3xl font-black italic tracking-tight uppercase px-4 py-2 rounded-lg border",
                isGo ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" : "text-red-400 bg-red-500/10 border-red-500/20"
              )}>
                {isGo ? "SYSTEM GO" : "NO-GO ALERT"}
              </div>
              <div className="mt-3 text-[9px] font-bold text-zinc-400 uppercase tracking-widest text-center">
                {isGo ? "All parameters nominal" : "Review active warnings"}
              </div>
            </div>

            {/* Parameter Metrics Grid */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4 w-full">
              <AlertBadge 
                label="Currency" 
                value={legality?.landingCurrency ? `${legality.landingCurrency.count}/3 Lndgs` : "0/3 Lndgs"}
                isOk={legality?.landingCurrency?.isCurrent ?? true}
                icon={<ShieldAlert className="w-4.5 h-4.5" />}
                tooltipText="Requires at least 3 takeoffs and 3 landings as the sole manipulator of flight controls in the last 90 days to carry passengers."
              />
              <AlertBadge 
                label="Medical" 
                value={legality?.medical?.isCurrent ? `${legality.medical.daysRemaining} Days` : "Caution"}
                isOk={legality?.medical?.isCurrent ?? true}
                icon={<Heart className="w-4.5 h-4.5" />}
                tooltipText="Pilot medical certificate status. Must possess a current, valid FAA medical certificate matching rating operations requirements."
              />
              <AlertBadge 
                label="Rest" 
                value={legality?.rest?.isCurrent ? "Ready" : "Rest Alert"}
                isOk={legality?.rest?.isCurrent ?? true}
                icon={<Clock className="w-4.5 h-4.5" />}
                tooltipText="Standard rest period requirements. Requires at least 10 consecutive hours of rest in the preceding 24-hour period."
              />
            </div>
          </div>

          {/* Warnings List */}
          {legality?.alerts && legality.alerts.length > 0 && (
            <div className="mt-6 border-t border-white/5 pt-6">
              <span className="text-[9px] uppercase font-black text-zinc-500 tracking-[0.2em] block mb-3">Active Advisories</span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {legality.alerts.map((alert: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-zinc-950/40 border border-white/5 rounded-xl text-xs text-zinc-300 transition-colors hover:bg-zinc-950/60 leading-normal">
                    <AlertTriangle className={cn("w-4 h-4 shrink-0 mt-0.5", alert.includes("Critical") || alert.includes("expired") ? "text-red-400" : "text-amber-400")} />
                    <span className="font-semibold tracking-tight">{alert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
}



