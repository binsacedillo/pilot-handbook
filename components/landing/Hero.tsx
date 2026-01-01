"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
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
		<section className="relative overflow-hidden bg-gradient-to-b from-slate-900 to-blue-900 min-h-[700px] md:min-h-[850px] pb-20">
			{/* Parallax Background Image - More Subtle */}
			<div
				className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-10"
				style={{
					backgroundImage: `url('https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop')`,
					transform: `translateY(${parallaxOffset}px)`,
					willChange: 'transform',
				}}
			/>

			{/* Gradient Overlay */}
			<div className="absolute inset-0 bg-gradient-to-b from-slate-900/70 via-blue-900/50 to-slate-900/70" />

			{/* Accessibility: Black overlay for improved contrast ratio (WCAG AA 4.5:1) */}
			<div className="absolute inset-0 bg-black/30" />

			{/* Content */}
			<div className="relative container mx-auto px-4 py-12 md:py-20">
				<div className="max-w-6xl mx-auto">
					{/* Text Content */}
					<div className="text-center mb-10">
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
							No credit card required • Free forever plan available
						</p>

						{/* Social Proof Stats */}
						<div className="mt-8 inline-flex items-center gap-2 px-5 py-3 bg-blue-500/20 backdrop-blur-md border border-blue-400/30 rounded-full">
							<div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
							<p className="text-sm md:text-base text-blue-100 font-medium">
								Trusted by pilots logging <span className="text-white font-bold">{(totalFlightHours || 1240).toLocaleString()}+</span> flight hours this month
							</p>
						</div>
					</div>

					{/* 3D Tilted Dashboard Preview */}
					<div className="mt-16">
						<div
							className="transform-gpu transition-transform duration-500 hover:scale-[1.02]"
							style={{
							}}
						>
							<div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700/50 bg-slate-800">
								{/* Browser Chrome */}
								<div className="bg-slate-800 px-4 py-3 flex items-center gap-2 border-b border-slate-700">
									<div className="flex gap-2">
										<div className="w-3 h-3 rounded-full bg-red-500"></div>
										<div className="w-3 h-3 rounded-full bg-yellow-500"></div>
										<div className="w-3 h-3 rounded-full bg-green-500"></div>
									</div>
									<div className="flex-1 ml-4">
										<div className="bg-slate-700 rounded px-3 py-1 text-xs text-slate-400 inline-block">
											pilothandbook.app/dashboard
										</div>
									</div>
								</div>

								{/* Dashboard Screenshot Placeholder */}
								<div className="bg-gradient-to-br from-slate-50 to-blue-50 aspect-[16/10] relative">
									{/* Dashboard Mock Content */}
									<div className="p-6 space-y-4">
										{/* Header */}
										<div className="flex items-center justify-between">
											<div>
												<h2 className="text-2xl font-bold text-slate-800">Flight Dashboard</h2>
												<p className="text-slate-600 text-sm">Welcome back, Captain!</p>
											</div>
											<div className="flex gap-2">
												<div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">+ New Flight</div>
											</div>
										</div>

										{/* Stats Cards */}
										<div className="grid grid-cols-4 gap-4">
											<div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
												<div className="text-slate-600 text-xs font-medium mb-1">Total Hours</div>
												<div className="text-2xl font-bold text-slate-800">247.5</div>
											</div>
											<div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
												<div className="text-slate-600 text-xs font-medium mb-1">PIC Hours</div>
												<div className="text-2xl font-bold text-slate-800">186.2</div>
											</div>
											<div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
												<div className="text-slate-600 text-xs font-medium mb-1">Flights</div>
												<div className="text-2xl font-bold text-slate-800">142</div>
											</div>
											<div className="bg-white rounded-lg p-4 shadow-sm border border-slate-200">
												<div className="text-slate-600 text-xs font-medium mb-1">Aircraft</div>
												<div className="text-2xl font-bold text-slate-800">8</div>
											</div>
										</div>

										{/* Recent Flights Table */}
										<div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4">
											<h3 className="text-sm font-semibold text-slate-800 mb-3">Recent Flights</h3>
											<div className="space-y-2">
												{[1, 2, 3].map((i) => (
													<div key={i} className="flex items-center justify-between py-2 border-b border-slate-100">
														<div className="flex items-center gap-3">
															<div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center text-blue-600 text-xs font-bold">
																N{i}23
															</div>
															<div>
																<div className="text-sm font-medium text-slate-800">MNL → CEB</div>
																<div className="text-xs text-slate-500">Cessna 172</div>
															</div>
														</div>
														<div className="text-right">
															<div className="text-sm font-semibold text-slate-800">{1.5 + i * 0.3}h</div>
															<div className="text-xs text-slate-500">Jan {i}, 2026</div>
														</div>
													</div>
												))}
											</div>
										</div>
									</div>

									{/* Glow Effect */}
									<div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 via-transparent to-purple-500/20 pointer-events-none"></div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
