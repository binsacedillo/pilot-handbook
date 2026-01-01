"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Hero() {
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
		<section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-blue-900 min-h-[600px] md:min-h-[700px]">
			{/* Parallax Background Image */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
				style={{
					backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')`,
					transform: `translateY(${parallaxOffset}px)`,
					willChange: 'transform',
				}}
			/>

			{/* Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-blue-900/50 to-slate-900/70" />

			{/* Content */}
			<div className="relative container mx-auto px-4 py-16 md:py-24">
				<div className="max-w-3xl mx-auto text-center">
					<div className="inline-block mb-4 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 rounded-full text-sm font-medium">
						Digital Logbook for Modern Pilots
					</div>
					<h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
						Your Flight Hours,
						<br />
						<span className="text-blue-400">Perfectly Tracked</span>
					</h1>
					<p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow">
						The professional pilot logbook built for accuracy, compliance, and
						career growth. Track flights, manage aircraft, and build your
						aviation career with confidence.
					</p>
					<div className="flex flex-col sm:flex-row gap-3 justify-center">
						<SignedOut>
							<Link href="/sign-up">
								<Button
									size="lg"
									className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
								>
									Start Free Trial
								</Button>
							</Link>
							<Link href="/sign-in">
								<Button
									size="lg"
									variant="outline"
									className="px-8 border-2 border-blue-400 text-white hover:bg-blue-400/20 backdrop-blur-sm shadow-lg"
								>
									Sign In
								</Button>
							</Link>
						</SignedOut>
						<SignedIn>
							<Link href="/dashboard">
								<Button
									size="lg"
									className="px-8 bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
								>
									Open Dashboard
								</Button>
							</Link>
						</SignedIn>
					</div>
					<p className="text-sm text-blue-200 mt-6 drop-shadow">
						No credit card required • Free forever plan available
					</p>
				</div>
			</div>

			{/* Animated clouds/aircraft icon (optional decoration) */}
			<div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-50 to-transparent" />
		</section>
	);
}
