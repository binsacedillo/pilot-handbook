"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Footer from "@/components/landing/Footer";
import FlightForm from "@/components/FlightForm";

export default function NewFlightPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100">
      <AppHeader />
      <main className="max-w-2xl mx-auto p-6 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6">
          Log New Flight
        </h1>
        <FlightForm />
      </main>
      <AppFooter />
    </div>
  );
}
