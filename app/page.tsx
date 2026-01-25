import { LaunchBanner } from "@/components/landing/LaunchBanner";
// Force dynamic rendering to ensure real-time flight stats
export const dynamic = 'force-dynamic';

import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import NextDynamic from "next/dynamic";

const Features = NextDynamic(() => import("@/components/landing/Features"), {
  ssr: true,
  loading: () => <div className="min-h-128" />, // 32rem = 128 * 0.25rem
});
const HowItWorks = NextDynamic(() => import("@/components/landing/HowItWorks"), {
  ssr: true,
  loading: () => <div className="min-h-112" />, // 28rem = 112 * 0.25rem
});
const Pricing = NextDynamic(() => import("@/components/landing/Pricing"), {
  ssr: true,
  loading: () => <div className="min-h-144" />, // 36rem = 144 * 0.25rem
});
const CTASection = NextDynamic(() => import("@/components/landing/CTASection"), {
  ssr: true,
  loading: () => <div className="min-h-112" />, // 28rem = 112 * 0.25rem
});
const Footer = NextDynamic(() => import("@/components/landing/Footer"), {
  ssr: true,
  loading: () => <div className="min-h-40" />, // Matches py-8 section (10rem = 40 * 4px)
});
// (Removed unused imports: SignedOut, Link, auth, redirect)
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
    <>
      <LaunchBanner />
      <main className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <Hero totalFlightHours={totalHours} />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}