"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { steps } from "@/lib/landing-data";
import { motion } from "framer-motion";

export default function HowItWorks() {
	return (
		<section className="relative bg-white dark:bg-background py-24 border-t border-border/50 overflow-hidden">
			{/* Technical Grid Pattern */}
			<div className="absolute inset-0 z-0 h-full w-full bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[24px_24px]"></div>

			<div className="relative z-10 container mx-auto px-4">
				<div className="max-w-5xl mx-auto">
					<motion.div 
						className="text-center mb-12"
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.6 }}
					>
						<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
							Get Started in 3 Simple Steps
						</h2>
						<p className="text-lg text-muted-foreground">
							Start tracking your flight hours in minutes
						</p>
					</motion.div>

					<div className="grid md:grid-cols-3 gap-8">
						{steps.map((step, index) => (
							<motion.div
								key={step.number}
								initial={{ opacity: 0, scale: 0.95, y: 20 }}
								whileInView={{ opacity: 1, scale: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ duration: 0.5, delay: index * 0.15 }}
								className="h-full"
							>
								<div
									className="relative flex flex-col items-center rounded-2xl border border-border/60 bg-card/80 backdrop-blur-sm p-6 text-center shadow-sm transition-all duration-300 hover:shadow-md hover:scale-105 h-full"
								>
									<div className="relative mb-4">
										<div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-[#235ff6] bg-background shadow-sm">
											<step.icon className="h-7 w-7 text-[#235ff6]" />
										</div>
										<span className="absolute -top-2 -right-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#235ff6] text-xs font-semibold uppercase tracking-wide text-white shadow-sm">
											{step.number}
										</span>
									</div>
									<h3 className="text-xl font-semibold text-foreground mb-2">
										{step.title}
									</h3>
									<p className="text-muted-foreground">{step.description}</p>
								</div>
							</motion.div>
						))}
					</div>

					<motion.div 
						className="text-center mt-10"
						initial={{ opacity: 0 }}
						whileInView={{ opacity: 1 }}
						viewport={{ once: true }}
						transition={{ delay: 0.5 }}
					>
						<SignedOut>
							<Link href="/sign-up">
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button
										size="lg"
										className="px-8 bg-blue-600 hover:bg-blue-700"
									>
										Start Your Journey Today
									</Button>
								</motion.div>
							</Link>
						</SignedOut>
						<SignedIn>
							<Link href="/dashboard">
								<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
									<Button
										size="lg"
										className="px-8 border-2 border-[#235ff6] bg-white text-[#235ff6] transition-colors hover:bg-[#235ff6] hover:text-white"
									>
										Continue to Dashboard
									</Button>
								</motion.div>
							</Link>
						</SignedIn>
					</motion.div>
				</div>
			</div>
		</section>
	);
}
