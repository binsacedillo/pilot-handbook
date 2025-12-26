"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Hero() {
	return (
		<section className="container mx-auto px-4 py-16 md:py-24">
			<div className="max-w-3xl mx-auto text-center">
				<div className="inline-block mb-4 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
					Digital Logbook for Modern Pilots
				</div>
				<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
					Your Flight Hours,
					<br />
					<span className="text-blue-600">Perfectly Tracked</span>
				</h1>
				<p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
					The professional pilot logbook built for accuracy, compliance, and
					career growth. Track flights, manage aircraft, and build your
					aviation career with confidence.
				</p>
				<div className="flex flex-col sm:flex-row gap-3 justify-center">
					<SignedOut>
						<Link href="/sign-up">
							<Button
								size="lg"
								className="px-6 bg-blue-600 hover:bg-blue-700"
							>
								Start Free Trial
							</Button>
						</Link>
						<Link href="/sign-in">
							<Button size="lg" variant="outline" className="px-6">
								Sign In
							</Button>
						</Link>
					</SignedOut>
					<SignedIn>
						<Link href="/dashboard">
							<Button
								size="lg"
								className="px-6 bg-blue-600 hover:bg-blue-700"
							>
								Open Dashboard
							</Button>
						</Link>
					</SignedIn>
				</div>
				<p className="text-sm text-muted-foreground mt-4">
					No credit card required • Free forever plan available
				</p>
			</div>
		</section>
	);
}
