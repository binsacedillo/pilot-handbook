// app/admin/page.tsx
import { db } from '@/lib/db'
import { currentUser } from '@clerk/nextjs/server'
import Link from 'next/link'

export default async function AdminDashboard() {
  const user = await currentUser()
  const totalUsers = await db.user.count()
  const pilotCount = await db.user.count({ where: { role: 'PILOT' } })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold">
          Welcome back, Admin {user?.emailAddresses?.[0]?.emailAddress ?? 'Admin'}!
        </h2>
        <Link
          href="/dashboard"
          className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-block"
        >
          ← Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-sm text-gray-600 uppercase tracking-wide">Total Users</p>
          <p className="text-4xl font-bold text-blue-600 mt-4">{totalUsers}</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-sm text-gray-600 uppercase tracking-wide">Pilots</p>
          <p className="text-4xl font-bold text-green-600 mt-4">{pilotCount}</p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow text-center">
          <p className="text-sm text-gray-600 uppercase tracking-wide">Pending Actions</p>
          <p className="text-4xl font-bold text-orange-600 mt-4">0</p>
        </div>
      </div>

      <div className="mt-12 bg-white p-6 rounded-lg shadow">
        <p className="text-lg">Admin panel is active. Start building user management, verifications, etc.</p>
      </div>
    </div>
  )
}