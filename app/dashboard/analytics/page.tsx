import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { api } from "@/src/trpc/server";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
    const session = await auth();
    if (!session?.userId) redirect("/sign-in");

    // Build tRPC context using the same logic as your backend
    const { db } = await import("@/lib/db");
    const ctx = {
        headers: new Headers(),
        db,
        session,
    };
    const caller = api(ctx);
    const stats = await caller.flight.getStats();

    return (
        <main className="p-8">
            <AnalyticsClient initialStats={stats} />
        </main>
    );
}
