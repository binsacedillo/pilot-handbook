import { Card } from "@/components/ui/card";
import RecentFlightsSkeleton from "./RecentFlightsSkeleton";

export default function DashboardSkeleton() {
  return (
    <div className="container mx-auto px-2 md:px-4 py-8 animate-pulse">
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="h-8 w-40 bg-accent rounded" />
          <div className="h-9 w-32 bg-accent rounded sm:w-auto" />
        </div>

        {/* Pilot Currency Skeleton */}
        <div className="w-full max-w-md mx-auto mb-4">
          <div className="flex flex-col items-center text-center gap-2 bg-card p-6 rounded-xl border-2 border-accent/20 shadow shimmer-premium">
             <div className="h-10 w-10 rounded-full bg-accent/50 mb-1" />
             <div className="h-5 w-32 bg-accent/40 rounded" />
             <div className="h-8 w-48 my-1 bg-accent/50 rounded" />
             <div className="h-6 w-24 mt-1 bg-accent/30 rounded" />
          </div>
        </div>

        {/* Status Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="flex flex-col items-center p-6 gap-2 border-2 border-accent/10 shadow shimmer-premium">
              <div className="h-10 w-10 rounded-full bg-accent/40 mb-1" />
              <div className="h-5 w-24 bg-accent/30 rounded" />
              <div className="h-8 w-32 bg-accent/50 rounded" />
            </Card>
          ))}
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-card rounded-xl border-2 border-accent/10 shadow p-6">
              <div className="h-7 w-40 bg-accent/40 rounded mb-4" />
              <RecentFlightsSkeleton />
            </div>
          </div>
          <div className="min-w-0">
             <Card className="h-[400px] border-2 border-accent/10 shadow shimmer-premium p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-6 w-6 rounded-full bg-accent/40" />
                  <div className="h-6 w-32 bg-accent/50 rounded" />
                </div>
                <div className="space-y-4">
                   <div className="h-20 w-full bg-accent/20 rounded-lg" />
                   <div className="grid grid-cols-2 gap-3">
                      <div className="h-14 bg-accent/10 rounded-lg" />
                      <div className="h-14 bg-accent/10 rounded-lg" />
                   </div>
                </div>
             </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
