"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";

interface DashboardHeaderProps {
  pilotName: string;
}

export default function DashboardHeader({ pilotName }: DashboardHeaderProps) {
  return (
    <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
      <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
        <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic">
          PILOT DASHBOARD<span className="text-blue-500">.</span>
        </h1>
        <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 light:text-slate-500">
          Connectivity: <span className="text-emerald-500">ONLINE</span> • 
          Active Pilot: <span className="text-foreground">{pilotName}</span>
        </p>
      </div>

      <div className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
        <Button asChild variant="outline" className="h-12 px-6 rounded-xl border-(--glass-border) text-[11px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all bg-background/50 backdrop-blur-md">
          <Link href="/flights">View Logbook</Link>
        </Button>
        <Button asChild className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95">
          <Link href="/flights?new=true">Record Flight</Link>
        </Button>
      </div>
    </header>
  );
}
