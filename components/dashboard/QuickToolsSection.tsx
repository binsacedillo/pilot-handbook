"use client";

import { ShieldCheck, History, Plane } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function QuickToolsSection() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <QuickToolCard 
        href="/tools" 
        title="Flight Planning" 
        desc="Preflight Readiness" 
        icon={<ShieldCheck className="w-4 h-4 text-blue-500" />} 
        color="text-blue-500" 
      />
      <QuickToolCard 
        href="/flights" 
        title="Audit Records" 
        desc="Logbook Integrity" 
        icon={<History className="w-4 h-4 text-amber-500" />} 
        color="text-amber-500" 
      />
      <QuickToolCard 
        href="/aircraft" 
        title="Fleet Hangar" 
        desc="Aircraft Status" 
        icon={<Plane className="w-4 h-4 text-green-500" />} 
        color="text-green-500" 
      />
    </div>
  );
}

function QuickToolCard({ href, title, desc, color, icon }: { href: string; title: string, desc: string, color: string, icon: React.ReactNode }) {
  return (
    <Link href={href} className="flex-1">
      <div className="group h-full p-4 rounded-2xl border border-(--glass-border) bg-zinc-900/10 dark:bg-zinc-900/10 light:bg-slate-50/50 hover:bg-zinc-900/50 hover:border-blue-500/30 transition-all duration-300">
        <div className="flex items-center gap-2 mb-2">
           {icon}
           <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em]", color)}>{title}</h3>
        </div>
        <p className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 font-black uppercase tracking-widest group-hover:text-foreground transition-colors">{desc}</p>
      </div>
    </Link>
  );
}
