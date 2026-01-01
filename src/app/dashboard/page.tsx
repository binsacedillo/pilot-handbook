import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { createCaller } from "@/server/routers/_app";
import { createTRPCContext } from "@/server/trpc";
import { DashboardClient } from "./dashboard-client";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.userId) redirect("/sign-in");

  // Create tRPC context with Clerk session
  const context = await createTRPCContext({ headers: new Headers() });

  // Create caller with context
  const caller = createCaller(context);

  // Fetch data on server using tRPC procedures
  const stats = await caller.flight.getStats();
  const recentFlights = await caller.flight.getRecent();

  // Pass as initial data to client component
  return (
    <main>
      <DashboardClient 
        initialStats={stats} 
        initialFlights={recentFlights} 
      />
    </main>
  );
}
