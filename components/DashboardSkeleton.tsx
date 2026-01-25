import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-3 mb-6">
      {/* Heading Row (kept visible in parent) */}
      {/* Stat Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            <Skeleton className="w-10 h-10 rounded-full mb-1" />
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-7 w-20 mb-1" />
            <Skeleton className="h-5 w-16" />
          </div>
        ))}
      </div>
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
