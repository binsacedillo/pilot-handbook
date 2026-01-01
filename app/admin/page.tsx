// app/admin/page.tsx
'use client';

import { trpc } from '@/trpc/client';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { Card } from '@/components/ui/card';
import { useUser } from '@clerk/nextjs';

export default function AdminDashboard() {
  const { user } = useUser();
  const { data: stats, isLoading } = trpc.admin.getStats.useQuery();

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <AppHeader />
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  const totalUsers = stats?.totalUsers ?? 0;
  const totalFlights = stats?.totalFlights ?? 0;
  const totalAircraft = stats?.totalAircraft ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground">
              Welcome back, Admin {user?.emailAddresses?.[0]?.emailAddress ?? 'Admin'}!
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-8 text-center">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Total Users</p>
              <p className="mt-4 text-4xl font-bold text-blue-600 dark:text-blue-400">{totalUsers}</p>
            </Card>
            <Card className="p-8 text-center">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Total Flights</p>
              <p className="mt-4 text-4xl font-bold text-green-600 dark:text-green-400">{totalFlights}</p>
            </Card>
            <Card className="p-8 text-center">
              <p className="text-sm uppercase tracking-wide text-muted-foreground">Total Aircraft</p>
              <p className="mt-4 text-4xl font-bold text-orange-600 dark:text-orange-400">{totalAircraft}</p>
            </Card>
          </div>
        </div>
      </div>
      <AppFooter />
    </div>
  )
}