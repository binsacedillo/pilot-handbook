import { Card } from "@/components/ui/card";

export default function RecentFlightsSkeleton() {
  return (
    <div className="space-y-2 animate-in fade-in duration-500">
      {[...Array(5)].map((_, i) => (
        <Card 
          key={i} 
          className="flex-row flex items-center justify-between gap-4 p-4 border-slate-200 dark:border-slate-700 shimmer-premium"
        >
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-4 w-32 bg-accent/50 rounded animate-pulse" />
            <div className="h-3 w-20 bg-accent/30 rounded animate-pulse" />
          </div>
          <div className="text-right whitespace-nowrap">
            <div className="h-5 w-12 bg-accent/50 rounded animate-pulse" />
          </div>
        </Card>
      ))}
    </div>
  );
}
