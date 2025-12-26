"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { Settings } from "lucide-react";

export default function SettingsNav() {
	const pathname = usePathname();

	return (
		<nav className="border-b bg-white">
			<div className="container mx-auto px-4 py-3 flex items-center justify-between">
				<div className="flex items-center gap-6">
					<Link href="/" className="text-xl font-bold">
						Pilot Handbook
					</Link>

					<div className="flex gap-4">
						<Link
							href="/dashboard"
							className={`text-sm font-medium transition-colors hover:text-primary ${
								pathname === "/dashboard"
									? "text-foreground"
									: "text-muted-foreground"
							}`}
						>
							Dashboard
						</Link>

						<Link
							href="/settings"
							className={`text-sm font-medium transition-colors hover:text-primary flex items-center gap-1 ${
								pathname === "/settings"
									? "text-foreground"
									: "text-muted-foreground"
							}`}
						>
							<Settings className="h-4 w-4" />
							Settings
						</Link>
					</div>
				</div>

				<UserButton afterSignOutUrl="/" />
			</div>
		</nav>
	);
}
