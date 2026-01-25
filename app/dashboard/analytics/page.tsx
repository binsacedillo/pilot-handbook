import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
    const session = await auth();
    if (!session?.userId) redirect("/sign-in");

    // Stats are fetched client-side via tRPC in AnalyticsClient
    return (
        <main className="p-8">
            <AnalyticsClient />
        </main>
    );
}
