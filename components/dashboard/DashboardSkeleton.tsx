import { Skeleton } from "@/components/ui/skeleton";
import { DashboardStatsSkeleton } from "./DashboardStatsSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Stat Cards Row */}
      <DashboardStatsSkeleton />

      {/* Main Section: Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Flights Skeleton */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Recent Flights</h2>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-lg" />
            ))}
          </div>
        </div>
        {/* Weather Widget Skeleton */}
        <div className="w-full max-w-md mx-auto lg:mx-0 lg:max-w-full">
          <div className="rounded-xl border bg-linear-to-br from-slate-900/90 via-slate-900/70 to-slate-900/30 text-white shadow-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-6 h-6 rounded-full" />
              <Skeleton className="h-6 w-32" />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-4 w-28" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-14 w-full rounded-lg" />
                ))}
              </div>
            </div>
            <Skeleton className="h-8 w-full mt-4 rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
