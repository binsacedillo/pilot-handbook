import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AnalyticsClient } from "./analytics-client";

export default async function AnalyticsPage() {
    const session = await auth();
    if (!session?.userId) redirect("/sign-in");

    return (
        <main className="flex-1 w-full relative overflow-hidden bg-zinc-950 font-sans">
            <div className="max-w-6xl mx-auto p-4 sm:p-8 w-full relative z-10">
                <AnalyticsClient />
            </div>
        </main>
    );
}
