"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Plane from "lucide-react/dist/esm/icons/plane";

export default function Navigation() {
	const companyLinks = [
		{ label: "Company", href: "/sign-up" },
		{ label: "About", href: "/sign-up" },
		{ label: "Blog", href: "/sign-up" },
		{ label: "Contact", href: "/sign-up" },
	];

	return (
		<nav className="border-b border-border bg-card sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Plane className="w-6 h-6 text-blue-600" />
					<span className="text-xl font-bold text-foreground">Pilot Handbook</span>
				</div>
				<div className="flex items-center gap-6">
					<div className="hidden md:flex items-center gap-4 text-sm text-muted-foreground">
						{companyLinks.map((link) => (
							<Link
								key={link.label}
								href={link.href}
								className="hover:text-foreground transition-colors"
							>
								{link.label}
							</Link>
						))}
					</div>

					<div className="flex items-center gap-4">
						<SignedOut>
							<Link href="/sign-in">
								<Button variant="ghost" className="text-foreground text-sm px-3 sm:px-4">
									Sign In
								</Button>
							</Link>
							<Link href="/sign-up">
								<Button className="bg-blue-600 hover:bg-blue-700 text-primary-foreground text-sm px-3 sm:px-4">
									<span className="hidden xs:inline">Get Started</span>
									<span className="xs:hidden">Start</span>
								</Button>
							</Link>
						</SignedOut>
						<SignedIn>
							<Link href="/dashboard">
								<Button className="bg-blue-600 hover:bg-blue-700 text-primary-foreground text-sm px-3 sm:px-4">
									<span className="hidden sm:inline">Go to Dashboard</span>
									<span className="sm:hidden">Dashboard</span>
								</Button>
							</Link>
						</SignedIn>
					</div>
				</div>
			</div>
		</nav>
	);
}
