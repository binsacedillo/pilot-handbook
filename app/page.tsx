import Navigation from "@/components/landing/Navigation";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
	return (
		<div className="min-h-screen bg-linear-to-b from-slate-50 to-white relative">
			<Navigation />
			<Hero />
			<Features />
			<HowItWorks />
			<CTASection />
			<Footer />
		</div>
	);
}