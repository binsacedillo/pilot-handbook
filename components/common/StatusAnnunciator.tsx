"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle2, Info, AlertTriangle, Loader2, XCircle } from "lucide-react";

type StatusType = "warning" | "caution" | "normal" | "advisory" | "processing";

interface StatusAnnunciatorProps {
  type: StatusType;
  title: string;
  message?: string;
  className?: string;
}

export default function StatusAnnunciator({ type, title, message, className }: StatusAnnunciatorProps) {
  const styles = {
    warning: {
      bg: "bg-red-500/10",
      border: "border-red-500/30",
      text: "text-red-500",
      icon: <AlertTriangle className="w-4 h-4" />,
      glow: "shadow-[0_0_15px_rgba(239,68,68,0.2)]"
    },
    caution: {
      bg: "bg-amber-500/10",
      border: "border-amber-500/30",
      text: "text-amber-500",
      icon: <AlertTriangle className="w-4 h-4" />,
      glow: "shadow-[0_0_15px_rgba(245,158,11,0.2)]"
    },
    normal: {
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/30",
      text: "text-emerald-500",
      icon: <CheckCircle2 className="w-4 h-4" />,
      glow: "shadow-[0_0_15px_rgba(16,185,129,0.2)]"
    },
    advisory: {
      bg: "bg-blue-500/10",
      border: "border-blue-500/30",
      text: "text-blue-500",
      icon: <Info className="w-4 h-4" />,
      glow: "shadow-[0_0_15px_rgba(59,130,246,0.2)]"
    },
    processing: {
      bg: "bg-zinc-500/10",
      border: "border-zinc-500/30",
      text: "text-zinc-400",
      icon: <Loader2 className="w-4 h-4 animate-spin" />,
      glow: ""
    }
  };

  const active = styles[type];

  return (
    <div className={cn(
      "w-full rounded-xl border p-4 backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-500",
      active.bg,
      active.border,
      active.glow,
      className
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("p-2 rounded-lg bg-zinc-950/50 border", active.border)}>
          {active.icon}
        </div>
        <div className="flex flex-col">
          <div className={cn("text-[10px] uppercase font-black tracking-[0.2em] leading-none mb-1", active.text)}>
            {title}
          </div>
          {message && (
            <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-tight leading-none">
              {message}
            </p>
          )}
        </div>
        <div className="ml-auto flex gap-1">
          <div className={cn("w-1 h-3 rounded-full opacity-50", active.bg, active.text.replace('text-', 'bg-'))} />
          <div className={cn("w-1 h-3 rounded-full", active.bg, active.text.replace('text-', 'bg-'))} />
        </div>
      </div>
    </div>
  );
}
