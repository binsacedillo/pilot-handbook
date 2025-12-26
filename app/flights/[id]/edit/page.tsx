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

  const { data: flight, isLoading, error } = trpc.flight.getById.useQuery({ id: flightId });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <AppHeader />
        <main className="max-w-2xl mx-auto p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Edit Flight</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-slate-600">Loading flight data...</p>
          </div>
        </main>
        <AppFooter />
      </div>
    );
  }

  if (error || !flight) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
        <AppHeader />
        <main className="max-w-2xl mx-auto p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Edit Flight</h1>
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-red-600">Flight not found or you don&apos;t have permission to edit it.</p>
            <button
              onClick={() => router.push("/flights")}
              className="mt-4 text-blue-600 hover:underline"
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
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <AppHeader />
      <main className="max-w-2xl mx-auto p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">Edit Flight</h1>
        <FlightForm initialData={flight} />
      </main>
      <AppFooter />
    </div>
  );
}
