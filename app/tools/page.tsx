"use client";

import { useUser } from "@clerk/nextjs";
import { 
  Terminal, 
  ShieldCheck, 
  Activity, 
  Info 
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import PreflightWorkflow from "@/components/tools/PreflightWorkflow";

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
               <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500/60">System Control / Mission Command</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              MISSION PREFLIGHT<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Active Performance Audit • {userName}
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-700 hidden md:block">
            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900/40 border border-blue-500/20 backdrop-blur-xl">
                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Telemetry Ready</span>
               </div>
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic">Consolidated View Online</span>
            </div>
          </div>
        </div>

        {/* Unified Workflow Section */}
        <div className="mb-16">
          <PreflightWorkflow />
        </div>

        {/* Master Caution / Safety HUD Banner */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <GlassCard className="p-0 border-amber-500/20 bg-amber-500/5 overflow-hidden">
            <div className="flex flex-col md:flex-row items-stretch">
               {/* High-visibility alert strip */}
               <div className="md:w-16 bg-amber-500/20 flex flex-row md:flex-col items-center justify-center p-3 md:p-0 gap-3 border-b md:border-b-0 md:border-r border-amber-500/30">
                  <ShieldCheck className="w-6 h-6 text-amber-500 animate-glow-pulse rounded-full" />
                  <span className="md:-rotate-90 text-[10px] font-black text-amber-500 whitespace-nowrap tracking-[0.2em] uppercase">Safety</span>
               </div>
               
               <div className="flex-1 p-6 md:p-8 space-y-3 relative">
                  <div className="absolute top-4 right-4 text-amber-500/20">
                     <Info className="w-24 h-24 rotate-12" />
                  </div>
                  
                  <div className="relative z-10 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <h3 className="text-xs font-black uppercase tracking-[0.5em] text-amber-500">Aviation Safety Protocol 01</h3>
                    </div>
                    
                    <p className="text-[11px] font-bold text-zinc-400 max-w-4xl leading-relaxed uppercase italic tracking-wider">
                      The unified preflight workflow provided in this control panel is for <span className="text-amber-500/80 font-black">educational and supplemental use only</span>. 
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
