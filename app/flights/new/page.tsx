"use client";

// This page is deprecated. Redirect to /flights
import { redirect } from "next/navigation";
export default function NewFlightPage() {
  redirect("/flights");
  return null;
}
