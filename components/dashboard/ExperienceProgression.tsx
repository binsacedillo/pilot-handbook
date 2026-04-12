"use client";

import React from "react";
import { GlassCard } from "@/components/ui/GlassCard";
import { Clock, Target, TrendingUp } from "lucide-react";

interface ExperienceProgressionProps {
  totalHours: number;
  goalHours?: number;
}

export default function ExperienceProgression({ totalHours, goalHours = 1500 }: ExperienceProgressionProps) {
  const percentage = Math.min(100, (totalHours / goalHours) * 100);
  
  return (
    <div className="bg-[var(--glass-bg)] rounded-2xl border border-[var(--glass-border)] p-6 overflow-hidden relative shadow-[var(--glass-bezel)] backdrop-blur-xl">
      {/* Background Glow */}
      <div className="absolute -right-20 -top-20 w-64 h-64 bg-blue-500/2 dark:bg-blue-500/2 light:bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-500 light:text-slate-500 text-[10px] uppercase font-bold tracking-widest">
            <Target className="w-3 h-3" />
            Experience Progression
          </div>
          <h3 className="text-3xl font-black text-foreground flex items-baseline gap-2">
            {totalHours.toLocaleString()}
            <span className="text-sm font-normal text-zinc-500 dark:text-zinc-500 light:text-slate-400">of {goalHours.toLocaleString()} Flight Hours</span>
          </h3>
        </div>
        
        <div className="text-right">
          <span className="text-4xl font-black text-blue-500/90 tracking-tighter">
            {Math.floor(percentage)}%
          </span>
          <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 font-bold uppercase tracking-tight">to Career Goal</p>
        </div>
      </div>

      <div className="relative h-4 w-full bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-slate-200 rounded-full border border-[var(--glass-border)] shadow-inner overflow-hidden">
        {/* Progress Bar with glow */}
        <div 
          className="h-full bg-linear-to-r from-blue-600 to-blue-400 rounded-full transition-all duration-1000 ease-out relative"
          style={{ width: `${percentage}%` }}
        >
          <div className="absolute inset-0 bg-white/20 animate-pulse" />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-slate-200 border border-[var(--glass-border)] rounded-lg">
                <Clock className="w-4 h-4 text-zinc-400 dark:text-zinc-400 light:text-slate-600" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 font-bold uppercase">Time Remaining</span>
                <span className="text-xs font-mono font-bold text-foreground">{(goalHours - totalHours).toLocaleString()} Hrs</span>
            </div>
        </div>
        <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-900/50 dark:bg-zinc-900/50 light:bg-slate-200 border border-[var(--glass-border)] rounded-lg">
                <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 font-bold uppercase">Aviation Milestones</span>
                <span className="text-xs font-bold text-foreground">Commercial Ready</span>
            </div>
        </div>
      </div>
    </div>
  );
}
