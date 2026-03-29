"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CheckCircle2, AlertCircle, Clock, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComplianceMonitorProps {
    compliance: {
        isCurrentForPassengers: boolean;
        isNightCurrent: boolean;
        totalLandingsLast90Days: number;
        nightLandingsLast90Days: number;
        daysUntilExpiry: number;
        nextDeadline: string | Date;
        requirementsMet: string[];
        requirementsMissing: string[];
    } | null;
    isLoading?: boolean;
}

export function ComplianceMonitor({ compliance, isLoading }: ComplianceMonitorProps) {
    if (isLoading) {
        return (
            <Card className="border-slate-200 dark:border-slate-800">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Clock className="w-5 h-5 text-muted-foreground animate-pulse" />
                        Recency Compliance
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4 animate-pulse">
                        <div className="h-4 bg-muted rounded w-3/4" />
                        <div className="h-4 bg-muted rounded w-1/2" />
                        <div className="h-20 bg-muted rounded w-full" />
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!compliance) return null;

    const isUrgent = compliance.daysUntilExpiry < 15;

    return (
        <Card className="overflow-hidden border-slate-200 dark:border-slate-800 shadow-lg">
            <div className={cn(
                "h-2 w-full",
                compliance.isCurrentForPassengers ? "bg-emerald-500" : "bg-amber-500"
            )} />
            <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className={cn(
                            "w-5 h-5",
                            compliance.isCurrentForPassengers ? "text-emerald-500" : "text-amber-500"
                        )} />
                        Passenger Currency
                    </div>
                    <span className={cn(
                        "text-xs px-2 py-1 rounded-full uppercase font-bold tracking-wider",
                        compliance.isCurrentForPassengers
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                    )}>
                        {compliance.isCurrentForPassengers ? "Legal" : "Expired"}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground flex items-center gap-1">
                        <Clock className="w-4 h-4" /> Days until expiry:
                    </span>
                    <span className={cn(
                        "font-mono font-bold text-base",
                        isUrgent ? "text-rose-500 animate-pulse" : ""
                    )}>
                        {compliance.daysUntilExpiry}d
                    </span>
                </div>

                <div className="space-y-2">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
                        <Info className="w-3 h-3" /> Status Logs
                    </div>
                    <ul className="space-y-1.5">
                        {compliance.requirementsMet.map((req, i) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-emerald-600 dark:text-emerald-400">
                                <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{req}</span>
                            </li>
                        ))}
                        {compliance.requirementsMissing.map((req, i) => (
                            <li key={i} className="text-sm flex items-start gap-2 text-amber-600 dark:text-amber-400 italic">
                                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                <span>{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    <p className="text-[10px] text-muted-foreground leading-tight">
                        Calculated based on FAA Part 61.57(a). Last updated: {new Date().toLocaleTimeString()}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
