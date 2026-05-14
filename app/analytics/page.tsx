import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AnalyticsClient, AnalyticsSkeleton } from "./analytics-client";
import { Suspense } from "react";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";

export default async function AnalyticsPage() {
    const isE2E = process.env.NEXT_PUBLIC_E2E === "true";
    
    if (!isE2E) {
        const session = await auth();
        if (!session?.userId) redirect("/sign-in");
    }

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
            {/* Decorative Cockpit Glows */}
            <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/5 blur-[150px] -z-10 pointer-events-none" />

            <AppHeader />

            <main className="flex-1 max-w-6xl mx-auto p-4 sm:p-8 w-full relative z-10">
                <Suspense fallback={<AnalyticsSkeleton />}>
                    <AnalyticsClient />
                </Suspense>
            </main>

            <AppFooter />
        </div>
    );
}
