import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Info, LayoutGrid } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({
  icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 text-center relative overflow-hidden rounded-3xl group">
      {/* HUD Backdrop Decoration */}
      <div className="absolute inset-0 z-0 opacity-10 dark:opacity-20 pointer-events-none">
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-primary/40 rounded-tl-xl" />
        <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-primary/40 rounded-tr-xl" />
        <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-primary/40 rounded-bl-xl" />
        <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-primary/40 rounded-br-xl" />
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        <div className="absolute top-0 left-1/2 w-[1px] h-full bg-gradient-to-b from-transparent via-primary/20 to-transparent" />
      </div>

      <div className="z-10 relative space-y-8 max-w-lg">
        {/* Status indicator */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/5 dark:bg-white/5 border border-zinc-200 dark:border-zinc-800 animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-500">System Ready</span>
        </div>

        {icon && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full scale-150 animate-hud-blink" />
              <div className="relative text-6xl md:text-7xl drop-shadow-2xl">
                {icon}
              </div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-foreground italic">
            {title}<span className="text-blue-500">_</span>
          </h3>
          {description && (
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base leading-relaxed font-medium">
              {description}
            </p>
          )}
        </div>

        {action && (
          <div className="pt-4 flex flex-col items-center gap-4">
            <Button 
              size="lg" 
              className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/20 transition-all hover:-translate-y-1 active:scale-95 group" 
              onClick={action.onClick}
            >
              <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              {action.label}
            </Button>
            
            <div className="flex items-center gap-6 pt-4 text-zinc-500/50">
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <Info className="w-3 h-3" />
                  Documentation
               </div>
               <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest">
                  <LayoutGrid className="w-3 h-3" />
                  Fleet Status
               </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Technical annotation footer */}
      <div className="absolute bottom-6 left-0 w-full flex justify-center opacity-30">
         <span className="text-[9px] font-mono text-zinc-500 uppercase tracking-[0.6em]">ISO-27001 System Active</span>
      </div>
    </div>
  );
}

