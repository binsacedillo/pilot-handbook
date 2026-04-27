"use client";

import { ExternalLink } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { GlassCard, GlassCardContent } from "@/components/ui/GlassCard";

interface PilotProfileCardProps {
  user: any;
  stats: any;
}

export default function PilotProfileCard({ user, stats }: PilotProfileCardProps) {
  return (
    <GlassCard bezel={true} className="bg-(--glass-bg) dark:bg-zinc-950/60 light:bg-slate-50 overflow-hidden">
       <GlassCardContent className="p-0">
          <div className="p-6 pb-4 flex items-center gap-5">
             <div className="w-14 h-14 rounded-full bg-linear-to-br from-blue-600 to-blue-400 p-px shadow-lg shadow-blue-500/10">
                <div className="w-full h-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                   <span className="text-xl font-black text-blue-500">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
                </div>
             </div>
             <div>
                <div className="text-base font-black text-foreground leading-tight">{user?.firstName} {user?.lastName}</div>
                <div className="text-[10px] text-zinc-500 dark:text-zinc-500 light:text-slate-500 uppercase font-bold tracking-widest mt-0.5">{stats?.profile?.licenseType || "Pilot"}</div>
             </div>
          </div>
          
          <div className="px-6 pb-6 space-y-2">
             <ProfileMetric label="Medical" value={stats?.profile?.medicalClass ? `${stats.profile.medicalClass} Class` : "N/A"} />
             <ProfileMetric label="License ID" value={stats?.profile?.id.substring(0, 8).toUpperCase() || "N/A"} />
             <div className="pt-4">
               <Button asChild variant="outline" className="w-full justify-between h-11 text-[10px] font-black uppercase tracking-[0.2em] border-(--glass-border) text-zinc-500 dark:text-zinc-400 light:text-slate-500 hover:text-blue-500 hover:border-blue-500/30 transition-all bg-background/50">
                 <Link href="/settings/profile">
                   Edit Pilot Profile <ExternalLink className="w-3 h-3 text-zinc-600 dark:text-zinc-600" />
                 </Link>
               </Button>
             </div>
          </div>
       </GlassCardContent>
    </GlassCard>
  );
}

function ProfileMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center">
       <span className="text-[10px] uppercase font-bold text-zinc-500 dark:text-zinc-500 light:text-slate-500">{label}</span>
       <span className="text-xs font-mono font-bold text-foreground">{value}</span>
    </div>
  );
}
