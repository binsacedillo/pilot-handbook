"use client";

import { Plane } from "lucide-react";
import { useEffect, useState } from "react";

export default function Loading() {
  const [progress, setProgress] = useState(0);
  const [statusCodes, setStatusCodes] = useState<boolean[]>([false, false, false, false, false]);

  const bootLogs = [
    "INITIALIZING AVIONICS_CORE...",
    "CALIBRATING NAVIGATION_SYSTEM...",
    "SYNCING FLIGHT_RECORDER...",
    "ESTABLISHING SECURE_LINK...",
    "READY FOR TAKEOFF."
  ];

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2500; // Simulated 2.5s boot time

    const updateProgress = () => {
      const elapsed = Date.now() - startTime;
      const rawProgress = Math.min((elapsed / duration) * 100, 98.4);
      
      // Add some "jitter" to make it look technical
      const jitter = Math.sin(elapsed / 100) * 0.5;
      const displayProgress = Math.max(0, rawProgress + jitter);
      
      setProgress(displayProgress);

      // Update [ OK ] labels based on progress thresholds
      const thresholds = [15, 35, 60, 80, 95];
      const newStatusCodes = thresholds.map(t => displayProgress >= t);
      setStatusCodes(newStatusCodes);

      if (rawProgress < 98.4) {
        requestAnimationFrame(updateProgress);
      }
    };

    const animationFrame = requestAnimationFrame(updateProgress);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div 
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden"
      role="alert"
      aria-busy="true"
      aria-label="System Initializing"
    >
      {/* HUD Scanline Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-20 z-20">
        <div className="w-full h-1 bg-blue-500/20 blur-[1px] animate-hud-scanline" />
      </div>

      <div className="relative z-10 flex flex-col items-center max-w-xs w-full px-6">
        {/* HUD Logo/Pulse */}
        <div className="mb-12 relative group cursor-wait">
          <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full scale-150 animate-hud-blink" />
          <div className="relative p-6 rounded-full border border-blue-500/10 bg-blue-500/5 transition-all duration-500 group-hover:border-blue-500/30">
             <Plane className="w-12 h-12 text-blue-500 animate-pulse" />
          </div>
        </div>

        {/* Boot Sequence Logs */}
        <div className="w-full space-y-2 mb-10">
           {bootLogs.map((log, i) => (
             <div 
               key={i} 
               className="text-[8px] md:text-[9px] font-mono font-bold tracking-[0.25em] text-blue-500/40 flex justify-between items-center transition-opacity duration-300"
               style={{ 
                 opacity: progress > (i * 12) ? 1 : 0 
               }}
             >
               <span className="truncate mr-2 italic">{log}</span>
               <span className={`transition-all duration-300 ${statusCodes[i] ? "text-blue-400/90 font-black animate-hud-blink" : "text-zinc-800"}`}>
                 [ {statusCodes[i] ? "OK" : ".."} ]
               </span>
             </div>
           ))}
        </div>

        {/* Technical Progress Bar (ISO Compliant) */}
        <div className="w-full space-y-3">
           <div 
             className="h-1.5 w-full bg-zinc-900/10 dark:bg-white/5 border border-white/5 rounded-full overflow-hidden p-[1px]"
             role="progressbar"
             aria-valuenow={Math.round(progress)}
             aria-valuemin={0}
             aria-valuemax={100}
           >
              <div 
                className="h-full bg-blue-600 rounded-full transition-all duration-75 ease-out" 
                style={{ width: `${progress}%` }}
              />
           </div>
           <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500/40">
              <span className="flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-blue-500/40 animate-hud-blink" />
                 Systems Boot
              </span>
              <span className="font-mono tabular-nums">{progress.toFixed(1)}%</span>
           </div>
        </div>
      </div>

      {/* Technical Footer Decoration */}
      <div className="absolute bottom-12 left-0 w-full flex flex-col items-center gap-4 opacity-20">
         <div className="text-[10px] font-black uppercase tracking-[0.5em] italic text-zinc-500">
            PilotLog <span className="text-blue-500">v1.2.1-stable</span>
         </div>
         <div className="flex gap-1.5">
            {Array.from({length: 8}).map((_, i) => (
               <div key={i} className="w-1 h-1 rounded-full bg-zinc-800" />
            ))}
         </div>
      </div>
    </div>
  );
}

