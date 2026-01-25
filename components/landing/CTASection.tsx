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
				<div className="absolute -inset-1 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-3xl blur-2xl opacity-30 group-hover:opacity-50 transition-opacity duration-500" />

				<div className="relative bg-linear-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl p-12 md:p-16 text-white overflow-hidden shadow-2xl">
					{/* Decorative elements */}
					<div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -mr-32 -mt-32" />
					<div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl -ml-48 -mb-48" />

					{/* Plane icon decoration */}
					<div className="absolute top-8 right-8 opacity-10">
						<Plane className="w-32 h-32 transform rotate-45" />
					</div>

					<div className="relative z-10 text-center max-w-3xl mx-auto">

						<h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
							Ready to Take Off?
						</h2>
						<p className="text-xl md:text-2xl text-blue-50 mb-10 leading-relaxed">
							Join the modern way of tracking flight hours. Start your free
							trial today.
						</p>

						<SignedOut>
							<Link href="/sign-up" className="w-full sm:w-auto">
								<Button
									size="lg"
									variant="secondary"
									className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 bg-white text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl font-semibold"
								>
									Claim Your Free Trial Now
								</Button>
							</Link>
						</SignedOut>
						<SignedIn>
							<Link href="/dashboard" className="w-full sm:w-auto">
								<Button
									size="lg"
									variant="secondary"
									className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-10 md:px-12 py-5 sm:py-6 md:py-7 bg-white text-blue-700 hover:bg-blue-50 shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 rounded-2xl font-semibold"
								>
									Claim Your Free Trial Now
								</Button>
							</Link>
						</SignedIn>

						<p className="text-base md:text-lg text-blue-50 mt-7 font-semibold">
							✓ No credit card required • ✓ Setup in under 2 minutes • ✓ Cancel
							anytime
						</p>
					</div>
				</div>
			</div>
		</section>
	);
}
