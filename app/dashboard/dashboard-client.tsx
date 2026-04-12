"use client";

import React, { useState, useMemo } from "react";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { trpc } from "@/trpc/client";
import { useUser } from "@clerk/nextjs";
import { 
  BookOpen, 
  ChevronRight, 
  Calendar, 
  Info, 
  ExternalLink,
  Activity,
  History
} from "lucide-react";
import ExperienceProgression from "@/components/dashboard/ExperienceProgression";
import { cn } from "@/lib/utils";

interface DashboardClientProps {
  initialStats?: any;
  initialFlights: any;
  initialAircraft: any;
  initialUpcoming?: any;
}

export default function DashboardClient({ initialStats, initialFlights, initialAircraft, initialUpcoming }: DashboardClientProps) {
  const { user, isLoaded } = useUser();
  
  const enabled = !!user && isLoaded;
  
  const { data: stats } = trpc.flight.getStats.useQuery(undefined, {
    initialData: initialStats ?? undefined,
    enabled,
  });
  
  const { data: flights } = trpc.flight.getRecent.useQuery({ limit: 6 }, {
    initialData: initialFlights,
    enabled,
  });

  // Stabilize the 'now' parameter to a 1-minute resolution (ISO 9241-11 compliance)
  const stableNow = useMemo(() => {
    return new Date().toISOString().split(':').slice(0, 2).join(':') + ':00.000Z';
  }, [Math.floor(Date.now() / 60000)]); // Only recalculate when the minute changes

  const { data: upcomingMission } = trpc.flight.getUpcoming.useQuery(
    { now: stableNow }, 
    {
      initialData: initialUpcoming ?? undefined,
      enabled,
      staleTime: 1000 * 60, // Mark as fresh for at least 1 minute
    }
  );

  const [customIcao, setCustomIcao] = useState<string | null>(null);
  
  const { data: favoriteMetar, isLoading: favoriteLoading } = trpc.weather.getFavoriteAirportMetar.useQuery(undefined, {
    enabled: !customIcao && isLoaded,
  });

  const { data: customMetar, isLoading: customLoading } = trpc.weather.getMetar.useQuery(
    { icao: customIcao! },
    { enabled: !!customIcao && isLoaded }
  );

  const metar = customIcao ? customMetar : favoriteMetar;
  const metarLoading = (customIcao ? customLoading : favoriteLoading) && !metar;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[62fr_38fr] gap-8 items-start">
      
      {/* LEFT COLUMN (62%) - Mission Data & Activity */}
      <div className="space-y-8">
        
        {/* 1. Experience Goals Tracking */}
        <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
           <ExperienceProgression 
             totalHours={stats?.totalHours ?? 0} 
             goalHours={stats?.profile?.totalHoursGoal ?? 1500}
           />
        </section>

        {/* 2. Recent Log Entries */}
        <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
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
                      className="group flex items-center justify-between p-3 rounded-xl border border-[var(--glass-border)] bg-zinc-900/10 dark:bg-zinc-900/20 light:bg-slate-50 hover:bg-zinc-900/50 dark:hover:bg-zinc-900/50 light:hover:bg-slate-100 hover:border-blue-500/30 transition-all duration-300"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-zinc-900 dark:bg-zinc-900 light:bg-slate-200 border border-[var(--glass-border)] flex items-center justify-center text-xs font-black text-zinc-500 dark:text-zinc-500 light:text-slate-600 group-hover:text-blue-500 transition-colors">
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
        </section>

        {/* 3. Operational Tools Grid */}
        <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
             <QuickToolCard 
               href="/tools/performance" 
               title="Performance" 
               desc="DA/PA Calc" 
               color="text-blue-500" 
             />
             <QuickToolCard 
               href="/tools/weight-balance" 
               title="Weight & Balance" 
               desc="CG Envelope" 
               color="text-amber-500" 
             />
             <QuickToolCard 
               href="/tools/fuel" 
               title="Fuel Planner" 
               desc="Reserves" 
               color="text-green-500" 
             />
          </div>
        </section>
      </div>

      {/* RIGHT COLUMN (38%) - Contextual Awareness */}
      <div className="space-y-8 sticky top-8">
        
        {/* 1. High Intensity Weather Panel */}
        <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
          <WeatherWidget
            metar={metar || null}
            isLoading={metarLoading}
            onAirportChange={setCustomIcao}
            onResetToFavorite={() => setCustomIcao(null)}
            isFavorite={!customIcao}
          />
        </section>

        {/* 2. Next Flight / Immediate Alerts */}
        <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
          <GlassCard bezel={true}>
            <GlassCardHeader>
               <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 light:text-slate-500 flex items-center gap-2">
                 <Calendar className="w-3 h-3 text-emerald-500" />
                 Upcoming Mission
               </h2>
            </GlassCardHeader>
            <GlassCardContent className="space-y-4">
               {upcomingMission ? (
                 <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl relative overflow-hidden group">
                   <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                     <Activity className="w-12 h-12" />
                   </div>
                   <div className="text-[10px] font-black text-emerald-500 uppercase tracking-tighter mb-2 flex items-center gap-1">
                     <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                     Primary Objective Detected
                   </div>
                   <div className="text-lg font-black text-foreground mb-1 leading-tight">
                     {upcomingMission.departureCode} → {upcomingMission.arrivalCode}
                   </div>
                   <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 light:text-slate-500 mb-4">
                     ETD: {new Date(upcomingMission.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                   </div>
                   
                   <div className="flex gap-2">
                     <Button asChild size="sm" className="flex-1 h-8 text-[10px] font-black uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white border-none transition-all">
                       <Link href={`/flights/${upcomingMission.id}/edit`}>
                         Pre-flight Prep
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
                     [ NO ACTIVE FLIGHT PLAN DETECTED ]
                   </div>
                   <Button asChild variant="outline" size="sm" className="w-full h-9 text-[10px] font-black uppercase tracking-widest border-[var(--glass-border)] text-zinc-500 dark:text-zinc-500 hover:text-blue-500 hover:border-blue-500/30 transition-all bg-background/50">
                     <Link href="/flights?new=true">
                       Schedule Mission
                     </Link>
                   </Button>
                 </div>
               )}
            </GlassCardContent>
          </GlassCard>
        </section>

        {/* 3. Pilot Profile Summary */}
        <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
          <GlassCard bezel={true} className="bg-[var(--glass-bg)] dark:bg-zinc-950/60 light:bg-slate-50 overflow-hidden">
             <GlassCardContent className="p-0">
                {/* Header Section */}
                <div className="p-6 pb-4 flex items-center gap-5">
                   <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-600 to-blue-400 p-[1px] shadow-lg shadow-blue-500/10">
                      <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                         <span className="text-xl font-black text-blue-500">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                      </div>
                   </div>
                   <div>
                      <div className="text-base font-black text-foreground leading-tight">{user?.firstName} {user?.lastName}</div>
                      <div className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 uppercase font-bold tracking-widest mt-0.5">{stats?.profile?.licenseType || "Pilot"}</div>
                   </div>
                </div>
                
                <div className="px-6 pb-6 space-y-2">
                   <ProfileMetric label="Medical" value={stats?.profile?.medicalClass ? `${stats.profile.medicalClass} Class` : "N/A"} />
                   <ProfileMetric label="Ikaros ID" value={stats?.profile?.id.substring(0, 8).toUpperCase() || "N/A"} />
                   
                   <div className="pt-4">
                     <Button asChild variant="outline" className="w-full justify-between h-11 text-[10px] font-black uppercase tracking-[0.2em] border-[var(--glass-border)] text-zinc-500 dark:text-zinc-400 light:text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all bg-background/50">
                       <Link href="/settings/profile">
                         Edit Pilot Profile <ExternalLink className="w-3 h-3 text-zinc-600 dark:text-zinc-600 light:text-slate-400 group-hover:text-blue-500" />
                       </Link>
                     </Button>
                   </div>
                </div>
             </GlassCardContent>
          </GlassCard>
        </section>

      </div>
    </div>
  );
}

function QuickToolCard({ href, title, desc, color }: { href: string; title: string, desc: string, colorClass?: string; color: string }) {
  return (
    <Link href={href}>
      <div className="group p-4 rounded-2xl border border-[var(--glass-border)] bg-zinc-900/10 dark:bg-zinc-900/10 light:bg-slate-50/50 hover:border-zinc-500 transition-all duration-300">
        <h3 className={cn("text-xs font-bold uppercase tracking-widest mb-1", color)}>{title}</h3>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 font-medium group-hover:text-foreground transition-colors">{desc}</p>
      </div>
    </Link>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
       <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 light:text-slate-500">{label}</span>
       <span className="text-xs font-mono font-bold text-foreground">{value}</span>
    </div>
  );
}

function Separator() {
  return <div className="h-[1px] w-full bg-zinc-800/50" />;
}
