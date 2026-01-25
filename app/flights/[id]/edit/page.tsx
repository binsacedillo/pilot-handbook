"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import FlightForm from "@/components/FlightForm";
import { trpc } from "@/trpc/client";
import { useParams, useRouter } from "next/navigation";

export default function EditFlightPage() {
  const params = useParams();
  const router = useRouter();
  const flightId = params.id as string;

  const { data: flight, isLoading, error } = trpc.flight.get.useQuery({ id: flightId });

  // Optionally, you could cast or validate the type here if needed
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <AppHeader />
        <main className="flex-1 max-w-2xl mx-auto p-6 md:p-8 w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Flight</h1>
          <div className="bg-card text-card-foreground rounded-lg border border-border shadow p-6">
            <p className="text-muted-foreground">Loading flight data...</p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col">
        <AppHeader />
        <main className="flex-1 max-w-2xl mx-auto p-6 md:p-8 w-full">
          <h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Flight</h1>
          <div className="bg-card text-card-foreground rounded-lg border border-border shadow p-6">
            <p className="text-destructive">Flight not found or you don&apos;t have permission to edit it.</p>
            <button
              onClick={() => router.push("/flights")}
              className="mt-4 text-primary hover:underline"
            >
              ← Back to Flights
            </button>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-2xl mx-auto p-6 md:p-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Flight</h1>
        <FlightForm initialData={flight} />
      </main>
      <AppFooter />
    </div>
  );
}
