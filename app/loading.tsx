import { Plane } from "lucide-react";

export default function Loading() {
  const bootLogs = [
    "INITIALIZING AVIONICS_CORE...",
    "CALIBRATING NAVIGATION_SYSTEM...",
    "SYNCING FLIGHT_RECORDER...",
    "ESTABLISHING SECURE_LINK...",
    "READY FOR TAKEOFF."
  ];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
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
               className="text-[8px] md:text-[9px] font-mono font-bold tracking-[0.25em] text-blue-500/40 flex justify-between items-center"
               style={{ 
                 animation: `entry 0.4s ease-out forwards`, 
                 animationDelay: `${i * 200}ms`,
                 opacity: 0 
               }}
             >
               <span className="truncate mr-2 italic">{log}</span>
               <span className="animate-hud-blink text-blue-400/60 font-black">[ OK ]</span>
             </div>
           ))}
        </div>

        {/* Technical Progress Bar */}
        <div className="w-full space-y-3">
           <div className="h-1.5 w-full bg-zinc-900/10 dark:bg-white/5 border border-white/5 rounded-full overflow-hidden p-[1px]">
              <div 
                className="h-full bg-blue-600 rounded-full animate-hud-shimmer transition-all duration-1000" 
                style={{ width: '85%' }}
              />
           </div>
           <div className="flex justify-between items-center text-[8px] font-black uppercase tracking-[0.4em] text-zinc-500/40">
              <span className="flex items-center gap-2">
                 <div className="w-1 h-1 rounded-full bg-blue-500/40 animate-hud-blink" />
                 Systems Boot
              </span>
              <span>85.4%</span>
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

