export const dynamic = 'force-dynamic';

import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import NextDynamic from "next/dynamic";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

const Features = NextDynamic(() => import("@/components/landing/Features"), {
  ssr: true,
  loading: () => <div className="min-h-128" />,
});
const HowItWorks = NextDynamic(() => import("@/components/landing/HowItWorks"), {
  ssr: true,
  loading: () => <div className="min-h-112" />,
});
const CTASection = NextDynamic(() => import("@/components/landing/CTASection"), {
  ssr: true,
  loading: () => <div className="min-h-112" />,
});

const Footer = NextDynamic(() => import("@/components/landing/Footer"), {
  ssr: true,
  loading: () => <div className="min-h-40" />,
});

export default async function Home() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      <main className="min-h-screen flex flex-col bg-background">
        <Navigation />
        <Hero />
        <Features />
        <HowItWorks />
        <CTASection />
        <Footer />
      </main>
    </>
  );
}