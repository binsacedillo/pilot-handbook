"use client";

import { UserButton, useUser, SignedIn, SignedOut } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plane, LayoutDashboard } from "lucide-react";
import { usePathname } from "next/navigation";

export default function AppHeader() {
	const { user, isLoaded } = useUser();
	const publicRole = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : undefined;
	const isAdmin = publicRole === "ADMIN";
	const pathname = usePathname();
	const isAdminPage = pathname?.startsWith("/admin");
	const isMarketingPage = pathname === "/" || pathname?.startsWith("/privacy") || pathname?.startsWith("/terms") || pathname?.startsWith("/about") || pathname?.startsWith("/contact");

	const mainNavItems = [
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Flights", href: "/flights" },
		{ label: "Aircraft", href: "/aircraft" },
		{ label: "Tools", href: "/tools" },
	];

	return (
		<nav className="border-b border-(--glass-border) bg-background/80 dark:bg-zinc-950/80 light:bg-slate-50/80 sticky top-0 z-50 shadow-sm backdrop-blur-md">
			<div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
				<Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
					<Plane className="w-6 h-6 text-blue-600" aria-hidden="true" />
					<span className="text-xl font-bold text-slate-900 dark:text-slate-100">Pilot Handbook</span>
				</Link>

				<div className="flex items-center gap-1 sm:gap-4 ml-auto">
					{!isLoaded ? (
						<div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
					) : (
						<>
							<SignedOut>
								<div className="flex items-center gap-2 sm:gap-4">
									<Link href="/sign-in">
										<Button variant="ghost" className="text-sm font-medium">Sign In</Button>
									</Link>
									<Link href="/sign-up">
										<Button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-2 sm:px-4">
											Get Started
										</Button>
									</Link>
								</div>
							</SignedOut>

							<SignedIn>
								<div className="flex items-center gap-1 sm:gap-4">
									{!isAdminPage && (
										<div className="hidden md:flex items-center gap-1">
											{mainNavItems.map((item) => {
												const isActive = pathname === item.href;
												return (
													<Link key={item.href} href={item.href} prefetch={false}>
														<Button
															variant="ghost"
															className={`text-slate-700 dark:text-slate-200 text-sm px-3 h-9 ${isActive ? "bg-slate-100 dark:bg-slate-800 font-semibold" : ""}`}
														>
															{item.label}
														</Button>
													</Link>
												);
											})}
										</div>
									)}

									{isAdminPage && isAdmin && (
										<Link href="/dashboard">
											<Button variant="ghost" className="text-sm">
												<LayoutDashboard className="w-4 h-4 mr-2" />
												Dashboard
											</Button>
										</Link>
									)}

									{(isMarketingPage || isAdminPage) && !isAdminPage && (
										<Link href="/dashboard">
											<Button variant="outline" className="text-sm font-medium border-blue-600 text-blue-600 hover:bg-blue-50">
												Go to Dashboard
											</Button>
										</Link>
									)}

									<div className="shrink-0 ml-2">
										<UserButton afterSignOutUrl="/">
											<UserButton.MenuItems>
												<UserButton.Link label="Settings" labelIcon={<span>⚙️</span>} href="/settings" />
												<UserButton.Action label="manageAccount" />
												{isAdmin && (
													<UserButton.Link label="Admin Panel" labelIcon={<span>👑</span>} href="/admin" />
												)}
											</UserButton.MenuItems>
										</UserButton>
									</div>
								</div>
							</SignedIn>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
