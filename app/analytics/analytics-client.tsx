"use client";

import { trpc } from "@/trpc/client";
import { GlassCard, GlassCardHeader, GlassCardContent } from "@/components/ui/GlassCard";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { ComplianceMonitor } from "@/components/dashboard/ComplianceMonitor";
import { 
  Activity, 
  ChevronLeft, 
  BarChart3, 
  TrendingUp, 
  PieChart as PieIcon,
  Clock,
  ShieldCheck
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type MonthData = { month: string; hours: number };
type TypeData = { aircraftId: string; aircraftName: string; totalHours: number };

export function AnalyticsClient() {
  const { data: summary, isLoading: summaryLoading } = trpc.stats.getSummary.useQuery();
  const { data: hoursByMonth, isLoading: monthLoading } = trpc.stats.getHoursByMonth.useQuery<MonthData[]>();
  const { data: hoursByType, isLoading: typeLoading } = trpc.stats.getHoursByType.useQuery<TypeData[]>();
  const { data: flightStats, isLoading: statsLoading } = trpc.flight.getStats.useQuery();

  const COLORS = ["#3b82f6", "#2dd4bf", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#f43f5e"];

  return (
    <div className="space-y-10">
      {/* ISO Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
        <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
          <div className="flex items-center gap-3 text-blue-500/60 mb-1">
             <Activity className="w-5 h-5" />
             <span className="text-[10px] font-black uppercase tracking-[0.4em]">Operational Analytics / Performance</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
            FLIGHT DATA ANALYSIS<span className="text-blue-500">.</span>
          </h1>
          <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-zinc-500">
            System Monitoring • Statistical Breakdown • 2026_LOGBOOK_INTEGRITY
          </p>
        </div>

        <Button asChild variant="outline" className="h-11 px-6 rounded-xl border-(--glass-border) text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all bg-background/50 backdrop-blur-md">
          <Link href="/dashboard" className="flex items-center gap-2">
            <ChevronLeft className="w-4 h-4" /> Return to Command
          </Link>
        </Button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[30fr_70fr] gap-8">
        {/* Sidebar: Compliance & Key Metrics */}
        <div className="space-y-8">
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
            <ComplianceMonitor compliance={flightStats?.compliance || null} isLoading={statsLoading} />
          </section>

          <GlassCard bezel={true} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            <GlassCardHeader>
               <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <h2 className="text-[10px] font-black uppercase tracking-widest">Cumulative Flight Time</h2>
               </div>
            </GlassCardHeader>
            <GlassCardContent>
              {summaryLoading ? (
                <Skeleton className="h-12 w-full rounded-xl" />
              ) : (
                <div className="flex items-baseline gap-2">
                  <div className="text-4xl font-black italic tracking-tighter text-white">
                    {summary?.totalHours?.toFixed(1) ?? "0.0"}
                  </div>
                  <div className="text-[10px] font-bold text-zinc-600 uppercase">Total Hours</div>
                </div>
              )}
            </GlassCardContent>
          </GlassCard>

          <div className="p-5 bg-blue-500/5 border border-blue-500/20 rounded-2xl flex items-center gap-4 group">
             <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500">
                <ShieldCheck className="w-5 h-5" />
             </div>
             <div>
                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Data Integrity</p>
                <p className="text-[10px] font-bold text-zinc-500 leading-tight mt-0.5">Statistical outputs verified against aircraft maintenance logs.</p>
             </div>
          </div>
        </div>

        {/* Main Content: Charts */}
        <div className="space-y-8">
          {/* Monthly Progression Chart */}
          <GlassCard bezel={true} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
            <GlassCardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-500" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground">Monthly Progression</h2>
              </div>
              <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter italic">L12M Frequency</span>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-[300px] w-full pt-4">
                {monthLoading ? (
                  <Skeleton className="h-full w-full rounded-2xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={hoursByMonth || []}>
                      <defs>
                        <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="month" 
                        stroke="#3f3f46" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                      />
                      <YAxis 
                        stroke="#3f3f46" 
                        fontSize={10} 
                        fontWeight="bold"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => `${value}h`}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#09090b', 
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="hours" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        fillOpacity={1} 
                        fill="url(#colorHours)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>

          {/* Aircraft Distribution */}
          <GlassCard bezel={true} className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-400">
            <GlassCardHeader>
              <div className="flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-emerald-500" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-foreground">Hours by Aircraft Type</h2>
              </div>
            </GlassCardHeader>
            <GlassCardContent>
              <div className="h-[300px] w-full">
                {typeLoading ? (
                  <Skeleton className="h-full w-full rounded-2xl" />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={hoursByType || []}
                        dataKey="totalHours"
                        nameKey="aircraftName"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        stroke="none"
                        label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                        labelLine={false}
                      >
                        {(hoursByType || []).map((entry, idx) => (
                          <Cell key={`cell-${idx}`} fill={COLORS[idx % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                         contentStyle={{ 
                          backgroundColor: '#09090b', 
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '12px',
                          fontSize: '10px',
                          fontWeight: 'bold'
                        }}
                      />
                      <Legend 
                        verticalAlign="bottom" 
                        height={36} 
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingTop: '20px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </GlassCardContent>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
