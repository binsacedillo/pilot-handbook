"use client";

import { SignedIn, SignedOut, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plane } from "lucide-react";

export default function Navigation() {
	const { user, isLoaded } = useUser();
	const isAdmin = user?.publicMetadata?.role === "ADMIN";

	if (!isLoaded) return null;
	return (
		<nav className="border-b bg-white sticky top-0 z-50">
			<div className="container mx-auto px-4 py-4 flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Plane className="w-6 h-6 text-blue-600" />
					<span className="text-xl font-bold text-slate-900">Pilot Handbook</span>
				</div>
				<div className="flex items-center gap-4">
					<SignedOut>
						<Link href="/sign-in">
							<Button variant="ghost" className="text-slate-700">
								Sign In
							</Button>
						</Link>
						<Link href="/sign-up">
							<Button className="bg-blue-600 hover:bg-blue-700">
								Get Started
							</Button>
						</Link>
					</SignedOut>
					<SignedIn>
						{isAdmin && (
							<Link href="/admin">
								<Button variant="outline" className="border-blue-600 text-blue-700">
									Admin
								</Button>
							</Link>
						)}
						<Link href="/dashboard">
							<Button className="bg-blue-600 hover:bg-blue-700">
								Go to Dashboard
							</Button>
						</Link>
					</SignedIn>
				</div>
			</div>
		</nav>
	);
}
