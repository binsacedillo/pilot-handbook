"use client";

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plane } from "lucide-react";

export default function Navigation() {
	const { isLoaded } = useUser();

	return (
		<nav className="border-b border-border bg-card sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Plane className="w-6 h-6 text-blue-600" />
					<span className="text-xl font-bold text-foreground">Pilot Handbook</span>
				</div>
				<div className="flex items-center gap-4">
					{!isLoaded ? (
						// Skeleton placeholder while auth is loading
						<div className="flex gap-4">
							<div className="w-20 h-9 bg-muted rounded-md animate-pulse" />
							<div className="w-28 h-9 bg-muted rounded-md animate-pulse" />
						</div>
					) : (
						<>
							<SignedOut>
								<Link href="/sign-in">
									<Button variant="ghost" className="text-foreground">
										Sign In
									</Button>
								</Link>
								<Link href="/sign-up">
									<Button className="bg-blue-600 hover:bg-blue-700 text-primary-foreground">
										Get Started
									</Button>
								</Link>
							</SignedOut>
							<SignedIn>
								<Link href="/dashboard">
									<Button className="bg-blue-600 hover:bg-blue-700 text-primary-foreground">
										Go to Dashboard
									</Button>
								</Link>
							</SignedIn>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
