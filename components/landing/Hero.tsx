"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

interface HeroProps {
	totalFlightHours: number;
}

export default function Hero({ totalFlightHours }: HeroProps) {
	const [scrollY, setScrollY] = useState(0);

	useEffect(() => {
		const handleScroll = () => {
			setScrollY(window.scrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	// Parallax effect: background moves slower than scroll
	const parallaxOffset = scrollY * 0.5;

	return (
		   <section className="relative overflow-hidden bg-linear-to-b from-slate-900 to-blue-900 min-h-175 md:min-h-212.5 pb-20">
			   {/* Parallax Background Image - Next.js Image for LCP/CLS */}
			   <div className="absolute inset-0 w-full h-full" style={{ transform: `translateY(${parallaxOffset}px)`, willChange: 'transform' }}>
				   <Image
					   src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
					   alt="Airplane flying in the sky"
					   fill
					   priority={true}
					   className="object-cover"
					   sizes="100vw"
				   />
			   </div>

			{/* Gradient Overlay */}
			<div className="absolute inset-0 bg-linear-to-b from-slate-900/70 via-blue-900/50 to-slate-900/70" />

			{/* Accessibility: Black overlay for improved contrast ratio (WCAG AA 4.5:1) */}
			<div className="absolute inset-0 bg-black/30" />

			{/* Content */}
			<div className="relative container mx-auto px-4 py-12 md:py-20">
				<div className="max-w-6xl mx-auto">
					{/* Text Content */}
					<div className="text-center mb-10">
						<div className="inline-block mb-4 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 rounded-full text-sm font-medium">
							CAAP-ready logbook for PH pilots
						</div>
						<h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
							Your Flight Hours,
							<br />
							<span className="text-blue-400">Perfectly Tracked</span>
						</h1>
						<p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow">
							Built in the Philippines for CAAP-friendly logging, local airport codes,
							and compliance. Track flights, manage aircraft, and grow your aviation
							career with confidence.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full sm:w-auto px-4 sm:px-0">
							<SignedOut>
								<Link href="/sign-up" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="w-full sm:w-auto px-6 sm:px-8 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
									>
										Start Free Trial
									</Button>
								</Link>
								<Link href="/sign-in" className="w-full sm:w-auto">
									<Button
										size="lg"
										variant="outline"
										className="w-full sm:w-auto px-6 sm:px-8 text-sm sm:text-base border-2 border-blue-400 text-white hover:bg-blue-400/20 backdrop-blur-sm shadow-lg"
									>
										Sign In
									</Button>
								</Link>
							</SignedOut>
							<SignedIn>
								<Link href="/dashboard" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="w-full sm:w-auto px-6 sm:px-8 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
									>
										Open Dashboard
									</Button>
								</Link>
							</SignedIn>
						</div>
						<p className="text-sm text-blue-200 mt-6 drop-shadow">
							No credit card required • Free forever plan available in PH
						</p>

						{/* Social Proof Stats */}
						<div className="mt-8 inline-flex items-center gap-2 px-5 py-3 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							<p className="text-sm md:text-base text-blue-100 font-medium">
								Trusted by Philippine pilots logging <span className="text-white font-bold">{(totalFlightHours || 1240).toLocaleString()}+</span> flight hours this month
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
