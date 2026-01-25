// app/admin/page.tsx
'use client';

import React from 'react';
import { trpc } from '@/trpc/client';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';
import { Users, Plane, TrendingUp } from 'lucide-react';
import UserManagementTable from '@/src/components/UserManagementTable';

export default function AdminDashboard() {
  // All hooks must be called before any early return
  const { user } = useUser();
  // TODO: Add error handling for failed queries (show error UI)
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();
  const { data: recentUsers, isLoading: recentLoading } = trpc.admin.recentUsers.useQuery();
  const { data: allUsers } = trpc.admin.getAllUsers.useQuery({ skip: 0, take: 100 });
  // Only one useState for tabs
  const [activeTab, setActiveTab] = React.useState<'overview' | 'users' | 'verifications'>('overview');

  const totalUsers = stats?.totalUsers ?? 0;
  const totalFlights = stats?.totalFlights ?? 0;
  const totalAircraft = stats?.totalAircraft ?? 0;
  const unverifiedUsers = allUsers?.users.filter(u => u.role === 'USER') ?? [];
  const verifiedPilots = allUsers?.users.filter(u => u.role === 'PILOT') ?? [];
  const admins = allUsers?.users.filter(u => u.role === 'ADMIN') ?? [];

  if (isLoading) {
    // TODO: Add skeleton loader for better UX
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Back to Dashboard button */}
          <a href="/dashboard" className="inline-block mb-4">
            <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700 cursor-pointer">
              ← Back to Dashboard
            </button>
          </a>
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Welcome back, Admin {user?.emailAddresses?.[0]?.emailAddress ?? 'Admin'}!
            </h2>
            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
                  ${activeTab === 'overview'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400'}
                `}
                onClick={() => setActiveTab('overview')}
                tabIndex={0}
                aria-current={activeTab === 'overview' ? 'page' : undefined}
              >
                Overview
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
                  ${activeTab === 'users'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400'}
                `}
                onClick={() => setActiveTab('users')}
                tabIndex={0}
                aria-current={activeTab === 'users' ? 'page' : undefined}
              >
                User Management
              </button>
              <button
                className={`px-4 py-2 rounded-lg text-sm font-medium border cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
                  ${activeTab === 'verifications'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100 border-slate-200 dark:border-slate-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 hover:border-blue-400'}
                `}
                onClick={() => setActiveTab('verifications')}
                tabIndex={0}
                aria-current={activeTab === 'verifications' ? 'page' : undefined}
              >
                Verifications
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <section aria-label="Admin Statistics">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-8" role="status" aria-live="polite" aria-label="Total users">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Total Users</p>
                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                  </div>
                  <p className="text-4xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</p>
                </Card>
                <Card className="p-8" role="status" aria-live="polite" aria-label="Total flights">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Total Flights</p>
                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" aria-hidden="true" />
                  </div>
                  <p className="text-4xl font-bold text-green-600 dark:text-green-400">{totalFlights}</p>
                </Card>
                <Card className="p-8" role="status" aria-live="polite" aria-label="Total aircraft">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Total Aircraft</p>
                    <Plane className="h-5 w-5 text-orange-600 dark:text-orange-400" aria-hidden="true" />
                  </div>
                  <p className="text-4xl font-bold text-orange-600 dark:text-orange-400">{totalAircraft}</p>
                </Card>
              </div>
              <div className="rounded-lg border">
                <div className="p-4 border-b">
                  <h2 className="text-lg font-semibold">Recent Users</h2>
                </div>
                <div className="p-4">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full min-w-150 text-sm md:text-base md:table-fixed">
                      <thead>
                        <tr className="text-left border-b bg-slate-50 dark:bg-slate-800">
                          <th className="py-2 pr-4 w-1/4 min-w-45">Email</th>
                          <th className="py-2 pr-4 w-1/4 min-w-30">Name</th>
                          <th className="py-2 pr-4 w-1/6 min-w-20">Role</th>
                          <th className="py-2 pr-4 w-1/4 min-w-38">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentLoading ? (
                          <tr><td colSpan={4} className="py-4 text-center">Loading...</td></tr>
                        ) : Array.isArray(recentUsers) && recentUsers.length ? (
                          recentUsers.map((u) => (
                            <tr key={u.id} className="border-b hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors">
                              <td className="py-2 pr-4 break-all md:truncate max-w-xs md:max-w-55">{u.email}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">{[u.firstName, u.lastName].filter(Boolean).join(" ")}</td>
                              <td className="py-2 pr-4 capitalize">{u.role?.toLowerCase()}</td>
                              <td className="py-2 pr-4 whitespace-nowrap">{new Date(u.createdAt).toLocaleString()}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} className="py-4 text-center">No recent users found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'users' && (
            <section aria-label="User Management">
              <UserManagementTable />
            </section>
          )}

          {activeTab === 'verifications' && (
            <section aria-label="Verifications">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Pending</p>
                    <div className="h-3 w-3 bg-yellow-500 rounded-full" />
                  </div>
                  <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{unverifiedUsers.length}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Verified</p>
                    <span className="h-5 w-5 text-green-600 dark:text-green-400">✓</span>
                  </div>
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">{verifiedPilots.length}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm uppercase tracking-wide text-muted-foreground">Admins</p>
                    <div className="h-5 w-5 rounded bg-purple-600 dark:bg-purple-400 flex items-center justify-center text-white text-xs font-bold">A</div>
                  </div>
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{admins.length}</p>
                </Card>
              </div>
              {/* Pending Verifications */}
              {unverifiedUsers.length > 0 ? (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-foreground mb-4">Pending Verifications</h2>
                  <div className="space-y-3">
                    {unverifiedUsers.map((user) => (
                      <Card key={user.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                                <span className="text-lg font-semibold text-muted-foreground">
                                  {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium text-foreground">
                                  {user.firstName} {user.lastName}
                                </p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                              Pending
                            </span>
                            {/* TODO: Implement verification action here (see verifications page for full logic) */}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              ) : (
                <Card className="p-8 mb-8">
                  <div className="text-center text-muted-foreground">
                    <span className="h-12 w-12 mx-auto mb-3 text-green-500">✓</span>
                    <p className="text-lg font-medium">No pending verifications</p>
                    <p className="text-sm">All users have been verified</p>
                  </div>
                </Card>
              )}
            </section>
          )}
        </div>
      </div>
      <AppFooter />
    </div>
  );
}