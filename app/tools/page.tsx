"use client";

import { CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Thermometer, Gauge, ArrowRight, ShieldCheck, Zap, Activity, Info, ChevronRight, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const tools = [
  {
    id: "MOD-PERF-01",
    title: "Performance Calculator",
    description: "Calculate Density Altitude and pressure altitudes for your flight planning.",
    icon: Thermometer,
    href: "/tools/performance",
    color: "text-blue-500",
    glowColor: "bg-blue-500/10",
    status: "Active",
  },
  {
    id: "MOD-WB-02",
    title: "Weight & Balance",
    description: "Calculate Center of Gravity (CG) and weight limits for your aircraft.",
    icon: Gauge,
    href: "/tools/weight-balance",
    color: "text-amber-500",
    glowColor: "bg-amber-500/10",
    status: "Active",
  },
  {
    id: "MOD-FUEL-03",
    title: "Fuel Planner",
    description: "Estimate fuel burn and reserves based on distance and wind conditions.",
    icon: Zap,
    href: "/tools/fuel",
    color: "text-emerald-500",
    glowColor: "bg-emerald-500/10",
    status: "Active",
  },
];

export default function ToolsDashboard() {
  const { user } = useUser();
  const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Pilot";

  return (
    <div className="flex-1 w-full relative overflow-hidden bg-zinc-950">
      {/* Decorative HUD Background Props */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-blue-500/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] -z-10 pointer-events-none" />
      
      <div className="max-w-6xl mx-auto p-6 md:p-8 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 border-l-2 border-blue-500/20 pl-6 py-2">
          <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-3">
               <Terminal className="w-5 h-5 text-blue-500" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60">System Control / Modules</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              FLIGHT TOOLS<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              {tools.length} Operational Modules Ready • {userName}
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-700 hidden md:block">
            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/40 border border-blue-500/20 backdrop-blur-xl">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Ready</span>
               </div>
               <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">Core Telemetry Online</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16 px-1">
          {tools.map((tool, idx) => (
            <Link 
              key={tool.id} 
              href={tool.href}
              className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${idx * 150}ms` }}
            >
              <GlassCard className="h-full flex flex-col hover:border-blue-500/40 transition-all duration-500 overflow-hidden hud-scanline p-1 bg-zinc-900/5 shadow-2xl">
                <div className="flex-1 flex flex-col p-6 md:p-8 border border-white/5 bg-zinc-950/40 rounded-[inherit]">
                  {/* Card Header / System Info */}
                  <div className="flex justify-between items-start mb-10">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-black text-blue-500/60 uppercase tracking-widest">System Link</span>
                      <span className="text-[10px] font-black text-foreground uppercase tracking-widest">{tool.id}</span>
                    </div>
                    <div className={cn(
                      "p-3 rounded-xl border border-white/5 shadow-inner transition-transform group-hover:scale-110 duration-500",
                      tool.glowColor
                    )}>
                      <tool.icon className={cn("w-6 h-6", tool.color)} />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-4 mb-10">
                    <h3 className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-blue-500 transition-colors">
                      {tool.title}
                    </h3>
                    <CardDescription className="text-[11px] font-bold uppercase tracking-[0.1em] text-zinc-500 leading-relaxed border-l border-zinc-800 pl-4">
                      {tool.description}
                    </CardDescription>
                  </div>

                  {/* Footer / Action */}
                  <div className="mt-auto pt-6 border-t border-zinc-900/80">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-2">
                          <Activity className={cn("w-3 h-3", tool.color)} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Operational</span>
                       </div>
                       <div className="flex items-center gap-1 group-hover:translate-x-1 transition-transform text-blue-500">
                          <span className="text-[10px] font-black uppercase tracking-widest">Connect</span>
                          <ChevronRight className="w-4 h-4" />
                       </div>
                    </div>
                  </div>
                </div>
              </GlassCard>
            </Link>
          ))}
        </div>

        {/* Master Caution / Safety HUD Banner */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <GlassCard className="p-0 border-amber-500/20 bg-amber-500/5 overflow-hidden group">
            <div className="flex flex-col md:flex-row items-stretch">
               {/* High-visibility alert strip */}
               <div className="md:w-16 bg-amber-500/20 flex flex-row md:flex-col items-center justify-center p-3 md:p-0 gap-3 border-b md:border-b-0 md:border-r border-amber-500/30">
                  <ShieldCheck className="w-6 h-6 text-amber-500 animate-glow-pulse rounded-full" />
                  <span className="md:-rotate-90 text-[10px] font-black text-amber-500 whitespace-nowrap tracking-[0.2em] uppercase">Security</span>
               </div>
               
               <div className="flex-1 p-6 md:p-8 space-y-3 relative">
                  {/* Decorative corner markers */}
                  <div className="absolute top-4 right-4 text-amber-500/20">
                     <Info className="w-24 h-24 rotate-12" />
                  </div>
                  
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <h3 className="text-xs font-black uppercase tracking-[0.5em] text-amber-500">Aviation Safety Protocol 01</h3>
                    </div>
                    
                    <p className="text-[11px] font-bold text-zinc-400 max-w-4xl leading-relaxed uppercase italic tracking-wider">
                      The module tools provided in this control panel are for <span className="text-amber-500/80 font-black">educational and supplemental use only</span>. 
                      Standard Operating Procedures (SOPs) mandate that the Pilot in Command (PIC) must verify all calculations 
                      against the <span className="text-foreground font-black">certified flight manual (AFM)</span>. Continuous cross-check required.
                    </p>
                  </div>
               </div>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
