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
    <div className="flex-1 w-full relative overflow-hidden bg-zinc-950 font-sans">
      <div className="max-w-6xl mx-auto p-4 sm:p-8 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16 border-l-2 border-blue-500/20 pl-4 sm:pl-6 py-2">
          <div className="space-y-1 sm:space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-3 text-blue-500/60">
               <Activity className="w-5 h-5" />
               <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operations Dispatch / System HUD</span>
            </div>
            <h1 className="text-3xl sm:text-6xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              FLIGHT PREPARATION<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              Active Operational Analysis • {userName}
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-700 hidden md:block">
            <div className="flex flex-col items-end gap-2">
               <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 border border-white/5 shadow-xl">
                 <div className="w-2 h-2 rounded-full bg-emerald-500" />
                 <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Telemetry Active</span>
               </div>
                <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-widest italic tracking-tighter">Instrument-Grade HUD Online</span>
            </div>
          </div>
        </div>

        {/* Unified Workflow Section */}
        <div className="mb-10 sm:mb-16">
          <PreflightWorkflow />
        </div>

        {/* Combined Dispatch / Safety Protocol 01 */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="bg-zinc-900 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
            <div className="flex flex-col sm:flex-row items-stretch">
               {/* High-visibility alert strip */}
               <div className="w-full sm:w-16 bg-amber-600/10 flex flex-row sm:flex-col items-center justify-center p-3 sm:p-0 gap-3 border-b sm:border-b-0 sm:border-r border-amber-600/20">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                  <span className="sm:-rotate-90 text-[10px] font-black text-amber-600 whitespace-nowrap tracking-[0.2em] uppercase">Security</span>
               </div>
               
               <div className="flex-1 p-5 sm:p-8 space-y-3 relative overflow-hidden">
                  <div className="absolute -top-6 -right-6 text-white/5">
                     <ShieldCheck className="w-32 h-32" />
                  </div>
                  
                  <div className="relative z-10 space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-amber-600" />
                      <h3 className="text-xs font-black uppercase tracking-[0.4em] text-amber-600">Aviation Safety Protocol 01</h3>
                    </div>
                    
                    <p className="text-[10px] sm:text-[11px] font-bold text-zinc-400 max-w-4xl leading-relaxed uppercase italic tracking-wider">
                      The unified preflight workflow provided in this control panel is for <span className="text-amber-600 font-black">educational and supplemental use only</span>. 
                      Standard Operating Procedures (SOPs) mandate that the Pilot in Command (PIC) must verify all calculations 
                      against the <span className="text-zinc-200 font-black">certified flight manual (AFM)</span>. Continuous cross-check required.
                    </p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
