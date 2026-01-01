"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Footer from "@/components/landing/Footer";
import FlightForm from "@/components/FlightForm";

export default function NewFlightPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-2xl mx-auto p-6 md:p-8 w-full">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">
          Log New Flight
        </h1>
        <FlightForm />
      </main>
      <AppFooter />
    </div>
  );
}
