"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

export default function Hero() {
	const shouldReduceMotion = useReducedMotion();
	const { scrollY } = useScroll();

	// Parallax effect: background moves slower than scroll
	// We use y values that are subtle to maintain ISO compliance and prevent motion sickness
	// Background starts slightly offset upwards (-10%) to prevent gaps at the top
	const y1 = useTransform(scrollY, [0, 500], [0, 100]);
	const y2 = useTransform(scrollY, [0, 500], [0, -50]);

	const backgroundY = shouldReduceMotion ? 0 : y1;
	const contentY = shouldReduceMotion ? 0 : y2;

	return (
		<section className="relative overflow-hidden bg-zinc-950 min-h-175 md:min-h-212.5 pb-20">
			{/* Parallax Background Image - Oversized to prevent gaps during motion */}
			<motion.div 
				className="absolute -top-[10%] left-0 w-full h-[120%]" 
				style={{ y: backgroundY }}
			>
				<Image
					src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop"
					alt="Airplane flying in the sky"
					fill
					priority={true}
					className="object-cover"
					sizes="100vw"
				/>
			</motion.div>

			{/* Gradient Overlays for premium feel and depth */}
			{/* Top edge fade to transition from navigation */}
			<div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-zinc-950 to-transparent z-10" />
			
			<div className="absolute inset-0 bg-linear-to-b from-slate-900/70 via-blue-900/50 to-slate-900/70" />

			{/* Accessibility: Dark overlay for contrast ratio */}
			<div className="absolute inset-0 bg-black/40" />

			{/* Content */}
			<motion.div 
				className="relative container mx-auto px-4 py-12 md:py-20"
				style={{ y: contentY }}
			>
				<div className="max-w-6xl mx-auto">
					{/* Text Content */}
					<motion.div 
						className="text-center mb-10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
					>
						<div className="inline-block mb-4 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-200 rounded-full text-sm font-medium">
							CAAP-ready logbook for PH pilots
						</div>
						<h1 className="text-4xl md:text-6xl font-bold text-white mb-4 leading-tight drop-shadow-lg">
							Your Flight Hours,
							<br />
							<span className="text-blue-400">Perfectly Tracked</span>
						</h1>
						<p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl mx-auto drop-shadow">
							Built in the Philippines for CAAP-compliant logging, local airport codes,
							and simplified fleet management. Track flights, manage aircraft, and grow your aviation
							career with confidence.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 justify-center items-center w-full sm:w-auto px-4 sm:px-0">
							<SignedOut>
								<Link href="/sign-up" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="w-full sm:w-auto px-6 sm:px-8 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105"
									>
										Get Started
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

						{/* Feature Badges */}
						<motion.div 
							className="flex flex-wrap justify-center gap-4 mt-12"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ delay: 0.5, duration: 1 }}
						>
							<div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 backdrop-blur-md border border-blue-400/20 rounded-full hover:bg-blue-500/20 transition-colors cursor-default">
								<span className="text-xl">🛡️</span>
								<span className="text-blue-100 font-medium text-sm">CAAP Standard</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 backdrop-blur-md border border-green-400/20 rounded-full hover:bg-green-500/20 transition-colors cursor-default">
								<span className="text-xl">⚡</span>
								<span className="text-green-100 font-medium text-sm">Real-time Sync</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-purple-500/10 backdrop-blur-md border border-purple-400/20 rounded-full hover:bg-purple-500/20 transition-colors cursor-default">
								<span className="text-xl">📱</span>
								<span className="text-purple-100 font-medium text-sm">Mobile First</span>
							</div>
						</motion.div>

					</motion.div>
				</div>
			</motion.div>

			{/* Smooth Fade Transition to Content (Fixes 'bad division' look) */}
			<div className="absolute bottom-0 left-0 w-full h-24 bg-linear-to-t from-white dark:from-background to-transparent z-10 pointer-events-none" />
		</section>
	);
}
