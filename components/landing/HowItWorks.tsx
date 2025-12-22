"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { steps } from "@/lib/landing-data";

export default function HowItWorks() {
	return (
		<section className="bg-slate-50 py-16">
			<div className="container mx-auto px-4">
				<div className="max-w-5xl mx-auto">
					<div className="text-center mb-12">
						<h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">
							Get Started in 3 Simple Steps
						</h2>
						<p className="text-lg text-slate-600">
							Start tracking your flight hours in minutes
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{steps.map((step) => (
							<div key={step.number} className="text-center">
								<div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
									<span className="text-xl font-bold text-white">{step.number}</span>
								</div>
								<h3 className="text-xl font-semibold text-slate-900 mb-2">
									{step.title}
								</h3>
								<p className="text-slate-600">{step.description}</p>
							</div>
						))}
					</div>

					<div className="text-center mt-10">
						<SignedOut>
							<Link href="/sign-up">
								<Button
									size="lg"
									className="px-8 bg-blue-600 hover:bg-blue-700"
								>
									Start Your Journey Today
								</Button>
							</Link>
						</SignedOut>
						<SignedIn>
							<Link href="/dashboard">
								<Button
									size="lg"
									className="px-8 bg-blue-600 hover:bg-blue-700"
								>
									Continue to Dashboard
								</Button>
							</Link>
						</SignedIn>
					</div>
				</div>
			</div>
		</section>
	);
}
