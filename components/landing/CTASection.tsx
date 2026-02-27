"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Plane from "lucide-react/dist/esm/icons/plane";

export default function CTASection() {
	return (
		<section className="container mx-auto px-4 py-20">
			<div className="max-w-5xl mx-auto relative group">
				{/* Glow effect */}
				<div className="absolute -inset-1 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-20 dark:opacity-40 group-hover:opacity-40 dark:group-hover:opacity-60 transition-opacity duration-500" />

				<div className="relative bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-blue-500/30 rounded-3xl p-12 md:p-16 overflow-hidden shadow-2xl backdrop-blur-xl">
					{/* Decorative elements - Adjusted for theme */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 dark:bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
					<div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/20 rounded-full blur-3xl -ml-48 -mb-48" />

					{/* Plane icon decoration */}
					<div className="absolute top-8 right-8 opacity-5 dark:opacity-10">
						<Plane className="w-32 h-32 transform rotate-45 text-slate-900 dark:text-white" />
					</div>

					<div className="relative z-10 text-center max-w-3xl mx-auto">

						<h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight text-slate-900 dark:text-white">
							Ready to Take Off?
						</h2>
						<p className="text-xl md:text-2xl text-slate-600 dark:text-blue-100 mb-10 leading-relaxed">
							Join the modern way of tracking flight hours. Experience the difference.
						</p>

						<SignedOut>
							<Link href="/sign-up" className="w-full sm:w-auto">
								<Button
									size="lg"
									className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl font-semibold"
								>
									Create Free Account
								</Button>
							</Link>
						</SignedOut>
						<SignedIn>
							<Link href="/dashboard" className="w-full sm:w-auto">
								<Button
									size="lg"
									className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 rounded-2xl font-semibold"
								>
									Go to Dashboard
								</Button>
							</Link>
						</SignedIn>

						<p className="text-base md:text-lg text-slate-500 dark:text-blue-200 mt-7 font-semibold">
							✓ Instant Access • ✓ Secure Data • ✓ CAAP Compliant
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
