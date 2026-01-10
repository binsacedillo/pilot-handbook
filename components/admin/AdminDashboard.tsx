"use client";


import React from "react";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import UserManagementTable from "@/src/components/UserManagementTable";
import { trpc } from "@/trpc/client";
import Users from "lucide-react/dist/esm/icons/users";
import Plane from "lucide-react/dist/esm/icons/plane";
import TrendingUp from "lucide-react/dist/esm/icons/trending-up";

export default function AdminDashboard() {
  // System stats
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  // Recent users
  const { data: recentUsers, isLoading: recentLoading } = trpc.admin.recentUsers.useQuery();

  const totalUsers = stats?.totalUsers ?? 0;
  const totalFlights = stats?.totalFlights ?? 0;
  const totalAircraft = stats?.totalAircraft ?? 0;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              Pilot Handbook
            </h2>
            <p className="text-muted-foreground mb-4">
              Welcome back, Admin beansgioacedillo@gmail.com!
            </p>
            {/* Back button */}
            <a href="/dashboard" className="inline-block mb-4">
              <button className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700">
                ← Back to Dashboard
              </button>
            </a>
          </div>

          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="rounded-lg border p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-muted-foreground">Total Users</span>
              </div>
              <span className="text-3xl font-bold">{statsLoading ? "—" : totalUsers}</span>
            </div>
            <div className="rounded-lg border p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <Plane className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-muted-foreground">Total Flights</span>
              </div>
              <span className="text-3xl font-bold">{statsLoading ? "—" : totalFlights}</span>
            </div>
            <div className="rounded-lg border p-6 flex flex-col items-center">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-muted-foreground">Total Aircraft</span>
              </div>
              <span className="text-3xl font-bold">{statsLoading ? "—" : totalAircraft}</span>
            </div>
          </div>

          {/* Recent Users Table */}
          <div className="mb-8">
            <div className="rounded-lg border overflow-x-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">Recent Users</h2>
              </div>
              <div className="p-4">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Email</th>
                      <th className="py-2 pr-4">Name</th>
                      <th className="py-2 pr-4">Role</th>
                      <th className="py-2 pr-4">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLoading ? (
                      <tr><td colSpan={4}>Loading...</td></tr>
                    ) : Array.isArray(recentUsers) && recentUsers.length ? (
                      recentUsers.map((u) => (
                        <tr key={u.id} className="border-b">
                          <td className="py-2 pr-4">{u.email}</td>
                          <td className="py-2 pr-4">{[u.firstName, u.lastName].filter(Boolean).join(" ")}</td>
                          <td className="py-2 pr-4 capitalize">{u.role?.toLowerCase()}</td>
                          <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={4}>No recent users found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* User Management Table */}
          <div className="mb-8">
            <div className="rounded-lg border overflow-x-auto">
              <div className="p-4 border-b">
                <h2 className="text-lg font-semibold">User Management</h2>
              </div>
              <div className="p-4">
                <UserManagementTable />
              </div>
            </div>
          </div>

          {/* Verifications Section */}
          <div className="rounded-lg border mb-8">
            <div className="p-4 border-b">
              <h2 className="text-lg font-semibold">Verifications</h2>
            </div>
            <div className="p-4">
              <p>Go to <a href="/admin/verifications" className="text-blue-600 underline">Verifications</a> to manage pilot verifications.</p>
            </div>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  );
}