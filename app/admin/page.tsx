// app/admin/page.tsx
'use client';

import React from 'react';
import { trpc } from '@/trpc/client';
import AppHeader from '@/components/common/AppHeader';
import AppFooter from '@/components/common/AppFooter';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/GlassCard';
import { useUser } from '@clerk/nextjs';
import { 
  Users, 
  Plane, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Activity, 
  ShieldAlert,
  Gamepad2,
  HardDrive
} from 'lucide-react';
import UserManagementTable from '@/components/admin/UserManagementTable';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { cn } from '@/lib/utils';

export default function AdminDashboard() {
  const { user } = useUser();
  const { showToast } = useToast();
  const utils = trpc.useUtils();

  // Queries
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();
  const { data: recentUsers, isLoading: recentLoading } = trpc.admin.recentUsers.useQuery();
  const { data: allUsers } = trpc.admin.getAllUsers.useQuery({ skip: 0, take: 100 });

  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'verifications'>('overview');

  // Mutation for verification
  const verifyPilotMutation = trpc.admin.verifyPilot.useMutation({
    onSuccess: () => {
      showToast("User status updated successfully", "success");
      utils.admin.getAllUsers.invalidate();
      utils.admin.getStats.invalidate();
    },
    onError: (err) => {
      showToast(`Failed to update user: ${err.message}`, "error");
    },
  });

  const handleVerify = (userId: string, verified: boolean) => {
    verifyPilotMutation.mutate({ userId, verified });
  };

  const totalUsers = stats?.totalUsers ?? 0;
  const totalFlights = stats?.totalFlights ?? 0;
  const totalAircraft = stats?.totalAircraft ?? 0;
  const unverifiedUsers = allUsers?.users.filter(u => u.role === 'USER') ?? [];
  const verifiedPilots = allUsers?.users.filter(u => u.role === 'PILOT') ?? [];
  const admins = allUsers?.users.filter(u => u.role === 'ADMIN') ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none z-50">
          <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,118,0.06))] bg-[length:100%_2px,3px_100%] pointer-events-none" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
        </div>
        <AppHeader />
        <div className="flex flex-col items-center justify-center p-8 mt-20">
          <div className="relative w-48 h-1 bg-zinc-900 rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-blue-500 animate-hud-shimmer" />
          </div>
          <span className="mt-4 text-[10px] font-black uppercase tracking-[0.3em] text-blue-500/50 animate-hud-blink">
            Initializing System Admin Ops
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#09090b] text-foreground flex flex-col relative overflow-hidden">
      {/* HUD Atmosphere */}
      <div className="absolute inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-b from-blue-500/[0.02] to-transparent" />
        <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/10 animate-hud-scanline blur-[1px]" />
        {/* Monochromatic Grain/Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100 contrast-150" />
      </div>

      <AppHeader />
      
      <main className="flex-1 p-4 md:p-8 relative z-10">
        <div className="max-w-7xl mx-auto space-y-8 animate-entry">
          
          {/* Header Area */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-hud-blink shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500/80">System: Operational</span>
              </div>
              <h1 className="text-3xl font-black tracking-tighter uppercase italic text-foreground/90 leading-none">
                Flight Operations <span className="text-blue-500">Center</span>
              </h1>
              <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                Administrator Portal // {user?.emailAddresses?.[0]?.emailAddress ?? 'OFFICIAL_NODE'}
              </p>
            </div>

            {/* MFD Navigation Bars */}
            <div className="flex bg-zinc-950/50 p-1 rounded-xl border border-zinc-800/50 backdrop-blur-md">
              <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300",
                  activeTab === 'overview' 
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300",
                  activeTab === 'users' 
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Fleet Users
              </button>
              <button
                onClick={() => setActiveTab('verifications')}
                className={cn(
                  "px-6 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all duration-300",
                  activeTab === 'verifications' 
                    ? "bg-blue-600 text-white shadow-[0_0_15px_rgba(37,99,235,0.3)]" 
                    : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                Approval
              </button>
            </div>
          </div>

          {/* Quick Metrics Pannier */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <GlassCard className="border-l-4 border-l-blue-500">
                <GlassCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">SYS:USERS_TOTAL</p>
                      <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <span className="text-[10px] font-mono text-blue-500/50 bg-blue-500/5 px-2 py-0.5 rounded border border-blue-500/10">ACTIVE</span>
                  </div>
                  <p className="text-4xl font-black italic tracking-tighter text-foreground">{totalUsers}</p>
                </GlassCardContent>
              </GlassCard>

              <GlassCard className="border-l-4 border-l-emerald-500">
                <GlassCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">OPS:FLIGHT_OPS</p>
                      <Activity className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span className="text-[10px] font-mono text-emerald-500/50 bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10">LIVE</span>
                  </div>
                  <p className="text-4xl font-black italic tracking-tighter text-foreground">{totalFlights}</p>
                </GlassCardContent>
              </GlassCard>

              <GlassCard className="border-l-4 border-l-amber-500">
                <GlassCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">FLEET:ACFT_REG</p>
                      <Plane className="h-4 w-4 text-amber-500" />
                    </div>
                    <span className="text-[10px] font-mono text-amber-500/50 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10">FLEET</span>
                  </div>
                  <p className="text-4xl font-black italic tracking-tighter text-foreground">{totalAircraft}</p>
                </GlassCardContent>
              </GlassCard>

              <GlassCard className="border-l-4 border-l-purple-500">
                <GlassCardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="space-y-0.5">
                      <p className="text-[8px] font-black uppercase tracking-widest text-zinc-500">MGMT:PENDING_AUTH</p>
                      <ShieldAlert className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="text-[10px] font-mono text-purple-500/50 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10">PENDING</span>
                  </div>
                  <p className="text-4xl font-black italic tracking-tighter text-foreground">{unverifiedUsers.length}</p>
                </GlassCardContent>
              </GlassCard>
            </div>
          )}

          {/* Main Content Area */}
          {activeTab === 'overview' && (
            <GlassCard className="overflow-hidden">
              <GlassCardHeader className="flex items-center justify-between bg-zinc-950/20">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-4 w-4 text-zinc-500" />
                  <h2 className="text-xs font-black uppercase tracking-widest italic">User Account Directory</h2>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span className="text-[8px] font-black text-zinc-500 uppercase">Status: Connected</span>
                </div>
              </GlassCardHeader>
              <GlassCardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-800/50 bg-zinc-900/30">
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Account ID</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">User Name</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Account Role</th>
                        <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Creation Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {recentLoading ? (
                        <tr><td colSpan={4} className="py-12 text-center text-blue-500/50 animate-hud-blink text-[10px] uppercase font-black tracking-widest">Updating Directory...</td></tr>
                      ) : (recentUsers || []).map((u) => (
                        <tr key={u.id} className="hover:bg-blue-500/5 transition-colors group">
                          <td className="py-4 px-6 text-sm font-bold text-foreground/80 font-mono tracking-tight">{u.email}</td>
                          <td className="py-4 px-6 text-sm font-semibold text-zinc-400 capitalize">{[u.firstName, u.lastName].filter(Boolean).join(" ")}</td>
                          <td className="py-4 px-6">
                            <span className={cn(
                              "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border",
                              u.role === 'ADMIN' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : "bg-blue-500/10 text-blue-500 border-blue-500/20"
                            )}>
                              {u.role}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-[10px] font-mono text-zinc-500">
                             {new Date(u.createdAt).toISOString().replace('T', ' ').split('.')[0]}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </GlassCardContent>
            </GlassCard>
          )}

          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <h2 className="text-sm font-black uppercase tracking-widest italic">Global User Manifest</h2>
              </div>
              <GlassCard>
                <UserManagementTable />
              </GlassCard>
            </div>
          )}

          {activeTab === 'verifications' && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <ShieldAlert className="h-6 w-6 text-amber-500" />
                <div className="space-y-0.5">
                  <h2 className="text-xl font-black uppercase tracking-widest italic leading-none">Credential Validation</h2>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{unverifiedUsers.length} Pending Actions Required</p>
                </div>
              </div>

              {unverifiedUsers.length > 0 ? (
                <div className="grid gap-3">
                  {unverifiedUsers.map((user) => (
                    <GlassCard key={user.id} className="relative group overflow-hidden animate-entry">
                      {/* Scanning Line Background */}
                      <div className="absolute inset-0 bg-linear-to-r from-amber-500/0 via-amber-500/[0.03] to-amber-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                      
                      <GlassCardContent className="p-0">
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded bg-zinc-950 flex items-center justify-center border border-zinc-800">
                              <span className="text-xl font-black text-amber-500/50 italic">
                                {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                            <div className="space-y-0.5">
                              <p className="text-sm font-bold text-foreground flex items-center gap-2 italic">
                                {user.firstName} {user.lastName} 
                                <span className="text-[8px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded border border-amber-500/30 animate-master-caution">PENDING APPROVAL</span>
                              </p>
                              <p className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">{user.email}</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                              <p className="text-[8px] font-black text-zinc-500 uppercase">Registration Date</p>
                              <p className="text-[10px] font-mono text-zinc-400">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                            <Button
                              onClick={() => handleVerify(user.id, true)}
                              disabled={verifyPilotMutation.isPending}
                              className="bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-widest text-[10px] px-6 h-10 shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all italic border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-2" />
                              Approve Certificate
                            </Button>
                          </div>
                        </div>
                      </GlassCardContent>
                    </GlassCard>
                  ))}
                </div>
              ) : (
                <GlassCard className="p-12 text-center bg-zinc-950/20">
                  <CheckCircle className="h-16 w-16 mx-auto mb-4 text-emerald-500 animate-hud-blink" />
                  <h3 className="text-lg font-black uppercase tracking-[0.2em] italic mb-1">Queue Clear</h3>
                  <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">No unresolved security credentials in buffer.</p>
                </GlassCard>
              )}
            </div>
          )}

        </div>
      </main>

      <AppFooter />
    </div>
  );
}