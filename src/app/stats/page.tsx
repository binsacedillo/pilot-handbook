"use client";
import { trpc } from '@/trpc/client';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

export default function StatsPage() {
  const { data, isLoading } = trpc.stats.getHoursByMonth.useQuery();

  return (
    <section aria-label="Flight statistics" className="max-w-2xl mx-auto mt-10 p-6">
    <Card role="region" aria-live="polite" aria-label="Monthly flight hours chart">
      <h2 className="text-xl font-bold mb-4">Hours per Month</h2>
      {isLoading ? (
        <Skeleton className="h-64 w-full" />
      ) : (
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="hours" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
    </section>
  );
}
