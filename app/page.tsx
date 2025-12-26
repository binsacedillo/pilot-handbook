



import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";
import { SignedOut } from "@clerk/nextjs";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server"; // 1. Import Auth
import { redirect } from "next/navigation";   // 2. Import Redirect



export default async function Home() {
  // 3. THE GUARD CLAUSE
  // Check immediately: Is this person logged in?
  // const { userId } = await auth();

  // // 4. If yes, kick them to the dashboard instantly.
  // if (userId) {
  //   redirect("/dashboard");
  // }
  return (
    <main className="bg-linear-to-br from-blue-50 to-blue-200 min-h-screen flex flex-col">
      <Navigation />
      <Hero />
      <Features />
      <HowItWorks />
      {/* Publicly visible sign-up CTA for signed-out users */}
      <SignedOut>
        <section className="flex flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-xl w-full text-center bg-white/80 rounded-xl shadow-lg p-8 border border-blue-100">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4 text-blue-900">Ready to get started?</h2>
            <p className="mb-6 text-blue-700">Sign up now to access your pilot handbook and manage your flights with ease.</p>
            <Link
              href="/sign-up"
              className="inline-block px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
            >
              Create your free account
            </Link>
          </div>
        </section>
      </SignedOut>
      <CTASection />
      <Footer />
    </main>
  );
}