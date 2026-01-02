



import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Pricing from "@/components/landing/Pricing";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server"; // 1. Import Auth
import { redirect } from "next/navigation";   // 2. Import Redirect
import { db } from "@/lib/db";

async function getTotalFlightHours() {
  try {
    const result = await db.flight.aggregate({
      _sum: { duration: true },
    });
    return Math.round(result._sum.duration || 0);
  } catch (error) {
    console.error("Error fetching flight stats:", error);
    return 0;
  }
}

export default async function Home() {
  const totalHours = await getTotalFlightHours();
  // 3. THE GUARD CLAUSE
  // Check immediately: Is this person logged in?
  // const { userId } = await auth();

  // // 4. If yes, kick them to the dashboard instantly.
  // if (userId) {
  //   redirect("/dashboard");
  // }
  return (
    <main className="min-h-screen flex flex-col bg-background">
      <Navigation />
      <Hero totalFlightHours={totalHours} />
      <Features />
      <HowItWorks />
      <Pricing />
      <CTASection />
      <Footer />
    </main>
  );
}