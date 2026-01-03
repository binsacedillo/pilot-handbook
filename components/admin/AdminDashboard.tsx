"use client";

import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";

export default function AdminDashboard() {
  const router = useRouter();
  const { data: stats, isLoading: statsLoading } = trpc.admin.getStats.useQuery();
  const { data: users, isLoading: usersLoading } = trpc.admin.recentUsers.useQuery();

  // Map totalUsers to display
  const userCount = stats?.totalUsers ?? 0;
  // Calculate pilot count from stats (users with at least one flight)
  const pilotCount = 0; // TODO: Add proper calculation from stats
  // Calculate pending from stats
  const pendingCount = 0; // TODO: Add proper calculation from stats

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <button
          onClick={() => router.push("/dashboard")}
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-500 dark:text-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 dark:border-slate-700"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-lg border p-4">
          <div className="text-sm text-slate-500">Users</div>
          <div className="text-3xl font-semibold">
            {statsLoading ? "—" : userCount}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-slate-500">Pilots</div>
          <div className="text-3xl font-semibold">
            {statsLoading ? "—" : pilotCount}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <div className="text-sm text-slate-500">Pending</div>
          <div className="text-3xl font-semibold">
            {statsLoading ? "—" : pendingCount}
          </div>
        </div>
      </div>

      <div className="rounded-lg border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Recent Users</h2>
        </div>
        <div className="p-4">
          {usersLoading ? (
            <div>Loading...</div>
          ) : (
            <div className="overflow-x-auto">
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
                  {users?.map((u) => (
                    <tr key={u.id} className="border-b">
                      <td className="py-2 pr-4">{u.email}</td>
                      <td className="py-2 pr-4">{[u.firstName, u.lastName].filter(Boolean).join(" ")}</td>
                      <td className="py-2 pr-4 capitalize">{u.role?.toLowerCase()}</td>
                      <td className="py-2 pr-4">{new Date(u.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}