"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Footer from "@/components/landing/Footer";
import FlightForm from "@/components/FlightForm";

// This page is deprecated. Redirect to /flights
import { redirect } from "next/navigation";
export default function NewFlightPage() {
  redirect("/flights");
  return null;
}
