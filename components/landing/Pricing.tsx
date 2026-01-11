"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { pricingPlans } from "@/lib/landing-data";
import Check from "lucide-react/dist/esm/icons/check";
import X from "lucide-react/dist/esm/icons/x";

export default function Pricing() {
	return (
		<section className="container mx-auto px-4 py-20">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-16">
					<div className="inline-block mb-4 px-3 py-1 bg-blue-500/20 backdrop-blur-sm border border-blue-400/30 text-blue-600 dark:text-blue-300 rounded-full text-sm font-medium">
						Simple, Transparent Pricing
					</div>
					<h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
						Plans for Every Pilot
					</h2>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Start free and upgzrade anytime. No hidden fees, no credit card required.
					</p>
				</div>

				{/* Pricing Cards */}
				<div className="grid md:grid-cols-2 gap-8 lg:gap-10">
					{pricingPlans.map((plan) => (
						<div
							key={plan.name}
							className={`relative rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col h-full ${
								plan.highlighted
									? "border-blue-500/50 bg-linear-to-br from-blue-50/50 to-indigo-50/50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-xl scale-105 md:scale-100 ring-2 ring-blue-500/20"
									: "border-border/50 bg-card/50 hover:border-border/80 hover:shadow-lg"
							}`}
						>
							{/* Badge */}
							{plan.badge && (
								<div className="absolute top-4 right-4">
									<span className="inline-block px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-semibold rounded-full">
										{plan.badge}
									</span>
								</div>
							)}

							<div className="p-8 pb-6 flex flex-col flex-1">
								{/* Plan Name & Description */}
								<div className="mb-6">
									<h3 className="text-2xl font-bold text-foreground mb-2">
										{plan.name}
									</h3>
									<p className="text-sm text-muted-foreground">
										{plan.description}
									</p>
								</div>

								{/* Pricing */}
								<div className="mb-8">
									<div className="flex items-baseline gap-2">
										{plan.originalPrice && (
											<span className="text-2xl font-semibold text-muted-foreground line-through mr-2">
												{plan.originalPrice}
											</span>
										)}
										<span className="text-4xl font-bold text-foreground">
											{plan.price}
										</span>
										{plan.period !== "Forever" && (
											<span className="text-muted-foreground">{plan.period}</span>
										)}
									</div>
									{plan.name === "Free" && (
										<p className="text-sm text-green-600 dark:text-green-400 font-semibold mt-2">
											✓ All features included
										</p>
									)}
									{plan.badge === "Beta" && (
										<p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold mt-2">
											Early Bird pricing during Beta. Pro will be ₱549/mo after launch.
										</p>
									)}
								</div>

								{/* CTA Button */}
								<div className="mb-8">
									<SignedOut>
										<Link href={plan.ctaHref} className="w-full">
											<Button
												className={`w-full transition-all ${
													plan.highlighted
														? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
														: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground"
												}`}
												size="lg"
											>
												{plan.cta}
											</Button>
										</Link>
									</SignedOut>
									<SignedIn>
										<Link href="/dashboard" className="w-full">
											<Button
												className={`w-full transition-all ${
													plan.highlighted
														? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
														: "bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-foreground"
												}`}
												size="lg"
											>
												Go to Dashboard
											</Button>
										</Link>
									</SignedIn>
								</div>

								{/* Features List */}
								<div className="space-y-4">
									<p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
										What&apos;s included
									</p>
									<ul className="space-y-3 flex-1">
										{plan.features.map((feature) => (
											<li
												key={feature.name}
												className="flex items-start gap-3 text-sm"
											>
												{feature.included ? (
													<Check className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
												) : (
													<X className="w-5 h-5 text-slate-300 dark:text-slate-600 shrink-0 mt-0.5" />
												)}
												<span
													className={
														feature.included
															? "text-foreground"
															: "text-muted-foreground line-through"
													}
												>
													{feature.name}
													{(feature.name.includes("Pro")) && (
														<span className="ml-2 px-2 py-0.5 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full font-semibold align-middle">Pro</span>
													)}
												</span>
											</li>
										))}
									</ul>
								</div>
							</div>

							{/* Bottom Border Accent */}
							{plan.highlighted && (
								<div className="h-1 bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500" />
							)}
						</div>
					))}
				</div>

				{/* FAQ Section */}
				<div className="mt-20 pt-12 border-t border-border/50">
					<div className="text-center mb-12">
						<h3 className="text-2xl font-bold text-foreground mb-2">
							Have Questions?
						</h3>
						<p className="text-muted-foreground">
							Everything is free right now. Pro features coming soon.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
						<div className="text-center">
							<h4 className="font-semibold text-foreground mb-2">
								Can I upgrade later?
							</h4>
							<p className="text-sm text-muted-foreground">
								Yes. Start free and upgrade to Pro anytime without losing your data.
							</p>
						</div>
						<div className="text-center">
							<h4 className="font-semibold text-foreground mb-2">
								Is there a trial?
							</h4>
							<p className="text-sm text-muted-foreground">
								All features are free forever on the Free plan. Pro is in development.
							</p>
						</div>
						<div className="text-center">
							<h4 className="font-semibold text-foreground mb-2">
								Need help?
							</h4>
							<p className="text-sm text-muted-foreground">
								Contact us anytime. We&apos;re here to help you succeed.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
