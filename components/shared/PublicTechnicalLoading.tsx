"use client";
import { Plane, Wifi, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface PublicTechnicalLoadingProps {
  className?: string;
}

export default function PublicTechnicalLoading({ className }: PublicTechnicalLoadingProps) {
  const [progress, setProgress] = useState(0);
  const [statusCodes, setStatusCodes] = useState<boolean[]>([false, false, false, false, false]);

  // "Schnegs": New public-facing operational logs
  const bootLogs = [
    "CONNECTING_TO_PILOTLOG_GATEWAY...",
    "FETCHING_AERONAUTICAL_METADATA...",
    "VERIFYING_CLIENT_PERMISSIONS...",
    "CALIBRATING_GUEST_INTERFACE...",
    "SYSTEM_READY_FOR_GUEST_ACCESS."
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2200; // Slightly faster for landing page engagement

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 99.1);
      
      // Technical Jitter
      const jitter = Math.sin(elapsed / 80) * 0.4;
      const displayProgress = Math.max(0, rawProgress + jitter);
      
      setProgress(displayProgress);

      const thresholds = [10, 30, 55, 75, 90];
      const newStatusCodes = thresholds.map(t => displayProgress >= t);
      setStatusCodes(newStatusCodes);

      if (rawProgress < 99.1) {
        requestAnimationFrame(updateProgress);
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div 
      className={cn(
        "fixed inset-0 z-100 flex flex-col items-center justify-center bg-zinc-950 overflow-hidden font-sans",
        className
      )}
      role="alert"
      aria-busy="true"
      aria-label="Pilot Handbook Initializing"
    >
      {/* ISO HUD Layer: Enhanced Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20">
        <div className="w-full h-full bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(59,130,246,0.1)_3px)]" />
      </div>
      
      {/* Moving HUD Beam */}
      <div className="absolute inset-0 pointer-events-none opacity-10 z-20">
        <div className="w-full h-32 bg-linear-to-b from-blue-500/10 to-transparent blur-2xl animate-hud-scanline" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-sm w-full px-8">
        {/* Central HUD Icon */}
        <div className="mb-14 relative group">
          <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full scale-150 animate-pulse" />
          <div className="relative p-7 rounded-2xl border border-blue-500/20 bg-blue-500/5 backdrop-blur-xl shadow-2xl shadow-blue-500/10">
             <Plane className="w-14 h-14 text-blue-500 animate-pulse" />
             
             {/* Technical Corners */}
             <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-blue-500/40" />
             <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-blue-500/40" />
          </div>
        </div>

        {/* Public Sequence Logs */}
        <div className="w-full space-y-2.5 mb-12">
           {bootLogs.map((log, i) => (
             <div 
               key={i} 
               className="text-[9px] font-black uppercase tracking-[0.3em] flex justify-between items-center transition-all duration-500"
               style={{ 
                 opacity: progress > (i * 15) ? 1 : 0.05,
                 transform: `translateX(${progress > (i * 15) ? 0 : -4}px)`
               }}
             >
               <span className={cn(
                 "truncate mr-2 flex items-center gap-2",
                 statusCodes[i] ? "text-blue-400" : "text-zinc-600"
               )}>
                 {i === 0 && <Wifi className="w-2 h-2" />}
                 {i === 1 && <Zap className="w-2 h-2" />}
                 {i === 2 && <Shield className="w-2 h-2" />}
                 {log}
               </span>
               <span className={cn(
                 "transition-all duration-300 tabular-nums px-2 py-0.5 rounded",
                 statusCodes[i] ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : "bg-zinc-900 text-zinc-800"
               )}>
                 {statusCodes[i] ? "OK" : "SYNC"}
               </span>
             </div>
           ))}
        </div>

        {/* Technical Progress (ISO 9241-11 Compliant) */}
        <div className="w-full space-y-4">
           <div 
             className="h-1 w-full bg-zinc-900 border border-white/5 rounded-full overflow-hidden"
             role="progressbar"
             aria-valuenow={Math.round(progress)}
             aria-valuemin={0}
             aria-valuemax={100}
           >
              <div 
                className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-all duration-75 ease-out" 
                style={{ width: `${progress}%` }}
              />
           </div>
           
           <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.5em]">
              <span className="flex items-center gap-3 text-zinc-500">
                 <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                 PUBLIC_ACCESS
              </span>
              <span className="text-blue-500 font-mono italic">{progress.toFixed(1)}%</span>
           </div>
        </div>
      </div>

      {/* ISO Technical Footer */}
      <div className="absolute bottom-16 left-0 w-full flex flex-col items-center gap-5 opacity-40">
         <div className="text-[11px] font-black uppercase tracking-[0.6em] text-zinc-600">
            PILOTLOG <span className="text-blue-500">GUEST_LINK</span>
         </div>
         <div className="flex gap-2.5">
            {Array.from({length: 12}).map((_, i) => (
               <div 
                key={i} 
                className={cn(
                  "w-1 h-1 rounded-full transition-colors duration-300",
                  progress > (i * 8.3) ? "bg-blue-500" : "bg-zinc-800"
                )} 
               />
            ))}
         </div>
      </div>
    </div>
  );
}
