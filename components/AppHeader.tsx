"use client";

import { UserButton, useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Plane from "lucide-react/dist/esm/icons/plane";
import { usePathname } from "next/navigation";

export default function AppHeader() {
	const { user, isLoaded } = useUser();
	const publicRole = typeof user?.publicMetadata?.role === "string" ? user.publicMetadata.role : undefined;
	const isAdmin = publicRole === "ADMIN";
	const pathname = usePathname();
	const isAdminPage = pathname?.startsWith("/admin");

	const mainNavItems = [
		{ label: "Home", href: "/" },
		{ label: "Dashboard", href: "/dashboard" },
		{ label: "Flights", href: "/flights" },
		{ label: "Aircraft", href: "/aircraft" },
	];

	return (
		<nav className="border-b bg-white dark:bg-slate-900 dark:border-slate-800 sticky top-0 z-50 shadow-sm">
			<div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
				<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity shrink-0">
					<Plane className="w-6 h-6 text-blue-600" aria-hidden="true" />
					<span className="hidden sm:inline text-xl font-bold text-slate-900 dark:text-slate-100">Pilot Handbook</span>
					<span className="sm:hidden text-lg font-bold text-slate-900 dark:text-slate-100">PH</span>
				</Link>

				<div className="flex items-center gap-1 sm:gap-4 ml-auto flex-wrap justify-end">
					{!isLoaded ? (
						// Skeleton placeholder while auth is loading
						<div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full animate-pulse" />
					) : (
						<>
							{!isAdminPage && (
								<>
									{mainNavItems.map((item) => {
										const isActive = pathname === item.href;
										return (
											<Link
												key={item.href}
												href={item.href}
												prefetch={false}
												className="shrink-0"
											>
												<Button
													variant="ghost"
													data-active={isActive ? "true" : undefined}
													aria-current={isActive ? "page" : undefined}
													className={`text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 ${isActive ? "bg-slate-200 text-slate-900 dark:bg-slate-800 dark:text-slate-50 hover:bg-slate-200 dark:hover:bg-slate-800" : ""}`}
												>
													{item.label}
												</Button>
											</Link>
										);
									})}
								</>
							)}

							{isAdminPage && isAdmin && (
								<>
									<Link href="/admin" className="shrink-0">
										<Button
											variant={pathname === "/admin" ? "default" : "ghost"}
											className={`text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 ${pathname === "/admin" ? "" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
										>
											<span className="hidden sm:inline">Overview</span>
											<span className="sm:hidden">Home</span>
										</Button>
									</Link>

									<Link href="/admin/users" className="shrink-0">
										<Button
											variant={pathname === "/admin/users" ? "default" : "ghost"}
											aria-label="Users"
											className={`text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 ${pathname === "/admin/users" ? "" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
										>
											<span className="hidden sm:inline">Users</span>
											<span className="sm:hidden" aria-hidden="true">👥</span>
										</Button>
									</Link>

									<Link href="/admin/verifications" className="shrink-0">
										<Button
											variant={pathname === "/admin/verifications" ? "default" : "ghost"}
											aria-label="Verifications"
											className={`text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10 ${pathname === "/admin/verifications" ? "" : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"}`}
										>
											<span className="hidden sm:inline">Verifications</span>
											<span className="sm:hidden" aria-hidden="true">✓</span>
										</Button>
									</Link>

									<Link href="/dashboard" className="shrink-0">
										<Button
											variant="ghost"
											aria-label="Back to dashboard"
											className="text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm px-2 sm:px-4 h-8 sm:h-10"
										>
											<span className="hidden sm:inline">← Back</span>
											<span className="sm:hidden" aria-hidden="true">←</span>
										</Button>
									</Link>
								</>
							)}

							<div className="shrink-0">
								<UserButton afterSignOutUrl="/">
									<UserButton.MenuItems>
										<UserButton.Link
											label="Settings"
											labelIcon={<span>⚙️</span>}
											href="/settings"
										/>
										<UserButton.Action label="manageAccount" />
										{isAdmin && (
											<UserButton.Link
												label="Admin Panel"
												labelIcon={<span>👑</span>}
												href="/admin"
											/>
										)}
									</UserButton.MenuItems>
								</UserButton>
							</div>
						</>
					)}
				</div>
			</div>
		</nav>
	);
}
