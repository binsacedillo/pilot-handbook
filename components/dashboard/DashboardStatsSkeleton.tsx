import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function DashboardStatsSkeleton() {
    const cards = [
        { title: "Pilot Status", lines: 2 },
        { title: "Total Flight Time", lines: 1 },
        { title: "Active Fleet", lines: 1 },
    ];

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6" aria-label="Loading statistics...">
            {cards.map((card, i) => (
                <Card
                    key={card.title}
                    className="animate-entry opacity-0 shadow-sm border-muted/50"
                    style={{ animationDelay: `${i * 150}ms`, animationFillMode: 'forwards' }}
                >
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {card.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {card.lines === 2 ? (
                                <>
                                    <Skeleton className="h-6 w-24 shimmer-premium animate-none" />
                                    <Skeleton className="h-4 w-32 shimmer-premium animate-none" />
                                </>
                            ) : (
                                <Skeleton className="h-8 w-28 shimmer-premium animate-none" />
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
