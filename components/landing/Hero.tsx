"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion, useScroll, useTransform, useReducedMotion, useSpring } from "framer-motion";
import { Shield, Radio, Smartphone } from "lucide-react";

export default function Hero() {
	const shouldReduceMotion = useReducedMotion();
	const { scrollY } = useScroll();

	// Parallax effect: background moves slower than scroll
	// Wrap scrollY in useSpring for a smooth, physics-based glide
	const smoothY = useSpring(scrollY, { stiffness: 100, damping: 30, restDelta: 0.001 });

	const y1 = useTransform(smoothY, [0, 500], [0, 100]);
	const y_mid = useTransform(smoothY, [0, 500], [0, 25]);
	const y2 = useTransform(smoothY, [0, 500], [0, -50]);

	const backgroundY = shouldReduceMotion ? 0 : y1;
	const midgroundY = shouldReduceMotion ? 0 : y_mid;
	const contentY = shouldReduceMotion ? 0 : y2;

	return (
		<section className="relative overflow-hidden bg-zinc-950 min-h-175 md:min-h-212.5 pb-20">
			{/* Parallax Background Image - Oversized to prevent gaps during motion */}
			<motion.div 
				className="absolute -top-[10%] left-0 w-full h-[120%] will-change-transform" 
				style={{ y: backgroundY, translateZ: 0 }}
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

			{/* Midground Atmosphere/Cloud Layer for 3D depth */}
			<motion.div 
				className="absolute inset-0 pointer-events-none z-10 opacity-30 mix-blend-screen will-change-transform"
				style={{ y: midgroundY, translateZ: 0 }}
			>
				<Image
					src="https://images.unsplash.com/photo-1513002749550-c59d786b8e6c?q=80&w=2000&auto=format&fit=crop"
					alt="Subtle clouds layer"
					fill
					className="object-cover pointer-events-none select-none"
					sizes="100vw"
				/>
			</motion.div>

			{/* Gradient Overlays for premium feel and depth */}
			{/* Top edge fade to transition from navigation */}
			<div className="absolute inset-x-0 top-0 h-32 bg-linear-to-b from-zinc-950 to-transparent z-10" />
			
			{/* Neutral dark overlay to keep image clean and maintain airplane colors contrast */}
			<div className="absolute inset-0 bg-neutral-950/50" />

			{/* Garmin G1000 Instrument Panel style: Soft localized radial glow behind the text container */}
			<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_45%,rgba(59,130,246,0.18)_0%,rgba(0,0,0,0)_60%)] pointer-events-none z-10" />

			{/* Content */}
			<motion.div 
				className="relative container mx-auto px-4 py-12 md:py-20 z-20 will-change-transform"
				style={{ y: contentY, translateZ: 0 }}
			>
				<div className="max-w-6xl mx-auto">
					{/* Text Content */}
					<motion.div 
						className="text-center mb-10"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, ease: "easeOut" }}
					>
						<div className="inline-block mb-4 px-3 py-1.5 bg-white/[0.04] backdrop-blur-md border border-white/10 text-blue-200 rounded-full text-xs font-semibold font-mono uppercase tracking-widest">
							✈️ CAAP-Ready Logbook for PH Pilots
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
						<div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto px-4 sm:px-0">
							<SignedOut>
								<Link href="/sign-up" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="w-full sm:w-48 font-bold uppercase bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:scale-[1.02] active:scale-[0.97] transition-all duration-300 ease-out tracking-wider hover:tracking-widest"
									>
										Get Started
									</Button>
								</Link>
								<Link href="/sign-in" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="w-full sm:w-48 font-bold uppercase border border-white/10 bg-zinc-950/40 text-zinc-300 hover:bg-white/10 hover:text-white active:scale-[0.97] backdrop-blur-md transition-all duration-200 ease-out"
									>
										Sign In
									</Button>
								</Link>
							</SignedOut>
							<SignedIn>
								<Link href="/dashboard" className="w-full sm:w-auto">
									<Button
										size="lg"
										className="w-full sm:w-48 font-bold uppercase bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_15px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.45)] hover:scale-[1.02] active:scale-[0.97] transition-all duration-300 ease-out tracking-wider hover:tracking-widest"
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
							<div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-full hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-default font-mono">
								<Shield className="h-4 w-4 text-blue-400" />
								<span className="text-blue-100 font-medium text-xs uppercase tracking-wider">CAAP Standard</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-full hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-default font-mono">
								<Radio className="h-4 w-4 text-emerald-400 animate-pulse" style={{ animationDuration: "3s" }} />
								<span className="text-green-100 font-medium text-xs uppercase tracking-wider">Real-time Sync</span>
							</div>
							<div className="flex items-center gap-2 px-4 py-2 bg-white/[0.03] backdrop-blur-md border border-white/10 rounded-full hover:bg-white/[0.08] hover:border-white/20 transition-all duration-300 cursor-default font-mono">
								<Smartphone className="h-4 w-4 text-purple-400" />
								<span className="text-purple-100 font-medium text-xs uppercase tracking-wider">Mobile First</span>
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
