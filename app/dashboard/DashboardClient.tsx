"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import PilotLegalityStatus from "@/components/dashboard/PilotLegalityStatus";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WeatherWidget } from "@/components/weather/WeatherWidget";
import { trpc } from "@/trpc/client";
import { 
  BookOpen, 
  ChevronRight, 
  Calendar, 
  Info, 
  ExternalLink,
  Activity,
  History,
  ShieldCheck,
  Plane
} from "lucide-react";
import ExperienceProgression from "@/components/dashboard/ExperienceProgression";
import { cn } from "@/lib/utils";
import { type RouterOutputs } from "@/trpc/shared";

interface DashboardClientProps {
  initialData: {
    stats?: RouterOutputs["flight"]["getStats"] | null;
    summary?: RouterOutputs["stats"]["getSummary"] | null;
    aircraft: RouterOutputs["aircraft"]["getAll"];
    flights: RouterOutputs["flight"]["getRecent"];
    upcoming?: RouterOutputs["flight"]["getUpcoming"] | null;
  };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const { isLoaded, user } = useUser();
  const [isOffline, setIsOffline] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Connectivity & Mounting Logic (Formerly in DashboardPageClient)
  useEffect(() => {
    setHasMounted(true);
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // tRPC Queries & Data Hydration (Formerly in dashboard-client)
  const enabled = !!user && isLoaded;
  
  const { data: stats } = trpc.flight.getStats.useQuery(undefined, {
    initialData: initialData.stats ?? undefined,
    enabled,
  });
  
  const { data: flights } = trpc.flight.getRecent.useQuery({ limit: 6 }, {
    initialData: initialData.flights,
    enabled,
  });

  const stableNow = useMemo(() => {
    return new Date().toISOString().split(':').slice(0, 2).join(':') + ':00.000Z';
  }, [hasMounted ? Math.floor(Date.now() / 60000) : 0]);

  const { data: upcomingFlight } = trpc.flight.getUpcoming.useQuery(
    { now: stableNow }, 
    {
      initialData: initialData.upcoming ?? undefined,
      enabled,
      staleTime: 1000 * 60,
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

  if (!isLoaded) return <DashboardSkeleton />;

  const pilotName = user?.fullName || user?.firstName || "Pilot";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden font-sans">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/5 blur-[150px] -z-10 pointer-events-none" />

      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col gap-10">
          
          {hasMounted && isOffline && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-500 px-4 py-3 text-sm backdrop-blur-md animate-pulse">
              <span className="font-black mr-2">!</span> Offline mode: showing cached data.
            </div>
          )}

          {/* Welcome Area (Operational Header) */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
            <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
                DASHBOARD<span className="text-blue-500">.</span>
              </h1>
              <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 light:text-slate-500">
                Connectivity: <span className="text-emerald-500">ONLINE</span> • 
                Active Pilot: <span className="text-foreground">{pilotName}</span>
              </p>
            </div>

            <div className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
              <Button asChild variant="outline" className="h-12 px-6 rounded-xl border-(--glass-border) text-[11px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all bg-background/50 backdrop-blur-md">
                <Link href="/flights">Logbook</Link>
              </Button>
              <Button asChild className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                <Link href="/flights?new=true">Log Flight</Link>
              </Button>
            </div>
          </header>

          <div className="flex flex-col gap-8">
            {/* Header: Go/No-Go Status (Full Width) */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <PilotLegalityStatus
                pilotName={pilotName}
                initialStats={stats ?? undefined}
              />
            </div>

            {/* Main Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[62fr_38fr] gap-8 items-start">
              
              {/* LEFT COLUMN (62%) - Flight Operations & Activity */}
              <div className="space-y-8">
                <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                   <ExperienceProgression 
                     totalHours={stats?.totalHours ?? 0} 
                     goalHours={stats?.profile?.totalHoursGoal ?? 1500}
                   />
                </section>

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
                </section>

                <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                     <QuickToolCard 
                       href="/tools" 
                       title="Mission Control" 
                       desc="Launch Preflight" 
                       icon={<ShieldCheck className="w-4 h-4 text-blue-500" />} 
                       color="text-blue-500" 
                     />
                     <QuickToolCard 
                       href="/flights" 
                       title="Safety Records" 
                       desc="Audit Logs" 
                       icon={<History className="w-4 h-4 text-amber-500" />} 
                       color="text-amber-500" 
                     />
                     <QuickToolCard 
                       href="/aircraft" 
                       title="Fleet Hangar" 
                       desc="Aircraft Status" 
                       icon={<Plane className="w-4 h-4 text-green-500" />} 
                       color="text-green-500" 
                     />
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN (38%) - Contextual Awareness */}
              <div className="space-y-8 sticky top-8">
                <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                  <WeatherWidget
                    metar={metar || null}
                    isLoading={metarLoading}
                    onAirportChange={setCustomIcao}
                    onResetToFavorite={() => setCustomIcao(null)}
                    isFavorite={!customIcao}
                  />
                </section>

                <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
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
                              Upcoming Flight Status
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
                                  Flight Preparation
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
                                Schedule Flight
                              </Link>
                            </Button>
                          </div>
                        )}
                    </GlassCardContent>
                  </GlassCard>
                </section>

                <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
                  <GlassCard bezel={true} className="bg-(--glass-bg) dark:bg-zinc-950/60 light:bg-slate-50 overflow-hidden">
                     <GlassCardContent className="p-0">
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
                             <Button asChild variant="outline" className="w-full justify-between h-11 text-[10px] font-black uppercase tracking-[0.2em] border-(--glass-border) text-zinc-500 dark:text-zinc-400 light:text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all bg-background/50">
                               <Link href="/settings/profile">
                                 Edit Pilot Profile <ExternalLink className="w-3 h-3 text-zinc-600 dark:text-zinc-600" />
                               </Link>
                             </Button>
                           </div>
                        </div>
                     </GlassCardContent>
                  </GlassCard>
                </section>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}

function QuickToolCard({ href, title, desc, color, icon }: { href: string; title: string, desc: string, color: string, icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex-1">
      <div className="group h-full p-4 rounded-2xl border border-(--glass-border) bg-zinc-900/10 dark:bg-zinc-900/10 light:bg-slate-50/50 hover:bg-zinc-900/50 hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
           {icon}
           <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", color)}>{title}</h3>
        </div>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 font-black uppercase tracking-widest group-hover:text-foreground transition-colors">{desc}</p>
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
