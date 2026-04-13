"use client";

import { CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Thermometer, Gauge, ArrowRight, ShieldCheck, Zap, Cog } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import { GlassCard } from "@/components/ui/GlassCard";
import { cn } from "@/lib/utils";

const tools = [
  {
    title: "Performance Calculator",
    description: "Calculate Density Altitude and pressure altitudes for your flight planning.",
    icon: Thermometer,
    href: "/tools/performance",
    color: "text-blue-500",
    bgColor: "bg-blue-500/10",
    status: "Active",
  },
  {
    title: "Weight & Balance",
    description: "Calculate Center of Gravity (CG) and weight limits for your aircraft.",
    icon: Gauge,
    href: "/tools/weight-balance",
    color: "text-amber-500",
    bgColor: "bg-amber-500/10",
    status: "Active",
  },
  {
    title: "Fuel Planner",
    description: "Estimate fuel burn and reserves based on distance and wind conditions.",
    icon: Zap,
    href: "/tools/fuel",
    color: "text-emerald-500",
    bgColor: "bg-emerald-500/10",
    status: "Active",
  },
];

export default function ToolsDashboard() {
  const { user } = useUser();
  const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Pilot";

  return (
    <div className="flex-1 w-full relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/5 blur-[150px] -z-10 pointer-events-none" />

      <div className="max-w-6xl mx-auto p-6 md:p-8 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              FLIGHT TOOLS<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              {tools.length} Operational Modules Ready • {userName}
            </p>
          </div>

          <div className="animate-in fade-in slide-in-from-right-4 duration-700">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900/5 dark:bg-white/5 border border-(--glass-border) backdrop-blur-md">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">System Ready</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 mb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {tools.map((tool) => (
            <Link 
              key={tool.title} 
              href={tool.href}
              className={cn(
                "group transition-all duration-500",
                tool.status === "Coming Soon" && "pointer-events-none opacity-60"
              )}
            >
              <GlassCard className="h-full flex flex-col hover:border-blue-500/50 transition-all duration-500 overflow-hidden relative group p-1">
                {tool.status === "Coming Soon" && (
                  <div className="absolute top-6 right-6 bg-zinc-900/10 dark:bg-white/5 text-[9px] uppercase font-black px-2 py-1 rounded-lg tracking-widest text-zinc  -500 border border-(--glass-border)">
                    Planned
                  </div>
                )}
                <CardHeader className="p-8 pb-4">
                  <div className={cn(
                    "p-5 rounded-2xl w-fit mb-8 transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 border border-white/5 shadow-inner",
                    tool.bgColor
                  )}>
                    <tool.icon className={cn("w-10 h-10", tool.color)} />
                  </div>
                  <CardTitle className="text-2xl font-black tracking-tighter uppercase group-hover:text-blue-500 transition-colors duration-300">
                    {tool.title}
                  </CardTitle>
                  <CardDescription className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 leading-relaxed pt-4">
                    {tool.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8 pt-0 mt-auto">
                  <div className="pt-6 border-t border-white/5">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-between hover:bg-transparent p-0 group-hover:translate-x-1 transition-transform text-[11px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-blue-500"
                      disabled={tool.status === "Coming Soon"}
                    >
                      <span>{tool.status === "Coming Soon" ? "Coming Soon" : "Initiate Module"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </GlassCard>
            </Link>
          ))}
        </div>

        <GlassCard className="mt-12 p-10 border-amber-500/10 bg-amber-500/5 relative overflow-hidden group animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <ShieldCheck className="w-32 h-32 text-amber-500" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20">
              <ShieldCheck className="w-8 h-8 text-amber-500" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber-500">Aviation Safety Notice</h3>
              <p className="text-[11px] font-bold text-zinc-500 max-w-3xl leading-relaxed italic uppercase">
                Tools provided here are for educational and supplemental use only. 
                As a Pilot in Command (PIC), you are responsible for using the certified aircraft performance data found in your Airplane Flight Manual (AFM).
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
