"use client";

import { SignOutButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { trpc } from "@/trpc/client";
import { Plane, Clock, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
	// Use tRPC hooks to fetch data
	const { data: user, isLoading: userLoading } = trpc.user.getOrCreate.useQuery();
	const { data: flights, isLoading: flightsLoading } = trpc.flight.getAll.useQuery();
	const { data: aircraft, isLoading: aircraftLoading } = trpc.aircraft.getAll.useQuery();
	const { data: stats, isLoading: statsLoading } = trpc.flight.getStats.useQuery();

	const router = useRouter();

	const isLoading = userLoading || flightsLoading || aircraftLoading || statsLoading;
	const isAdmin = user?.role === "ADMIN";

	if (isLoading) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-slate-600">Loading your dashboard...</p>
				</div>
			</div>
		);
	}

	if (!user) {
		return (
			<div className="flex min-h-screen items-center justify-center p-4">
				<div className="text-center">
					<h1 className="text-2xl font-bold mb-4">Access Denied</h1>
					<p className="text-slate-600 mb-6">
						Please sign in to access the dashboard.
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 p-8">
			<div className="max-w-4xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-4xl font-bold text-slate-900">
							Welcome back, {user.firstName || "Captain"}!
						</h1>
						<p className="text-slate-600 mt-2">Your pilot logbook dashboard</p>
					</div>
					<div className="flex items-center gap-2">
						{isAdmin && (
							<Button
								variant="outline"
								onClick={() => router.push("/admin")}
								className="border-blue-600 text-blue-700"
							>
								Admin
							</Button>
						)}
						<Button
							variant="outline"
							onClick={() => router.push("/")}
							className="hover:bg-slate-50"
						>
							Home
						</Button>
						<SignOutButton>
							<Button className="bg-white text-black border border-slate-300 hover:bg-slate-50">
								Sign Out
							</Button>
						</SignOutButton>
					</div>
				</div>

				{/* User Information Card */}
				<div className="bg-white rounded-lg shadow-lg p-8 mb-8">
					<h2 className="text-2xl font-bold text-slate-900 mb-6">
						Your Profile
					</h2>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* Basic Info */}
						<div>
							<h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
								Name
							</h3>
							<p className="text-lg text-slate-900">
								{user.firstName} {user.lastName}
							</p>
						</div>

						<div>
							<h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
								Email
							</h3>
							<p className="text-lg text-slate-900">{user.email}</p>
						</div>

						{/* License Info */}
						<div>
							<h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
								License
							</h3>
							<p className="text-lg text-slate-900">
								{user.license || "Not set"}
							</p>
						</div>

						<div>
							<h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">
								License Expiry
							</h3>
							<p className="text-lg text-slate-900">
								{user.licenseExpiry
									? new Date(user.licenseExpiry).toLocaleDateString()
									: "Not set"}
							</p>
						</div>
					</div>

					{/* Member Since */}
					<div className="mt-6 pt-6 border-t border-slate-200">
						<p className="text-sm text-slate-500">
							Member since {new Date(user.createdAt).toLocaleDateString()}
						</p>
					</div>
				</div>

				{/* Quick Stats - Now with real data from tRPC */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
					<div className="bg-white rounded-lg shadow p-6">
						<div className="text-center">
							<Plane className="w-8 h-8 text-blue-600 mx-auto mb-2" />
							<div className="text-3xl font-bold text-blue-600">
								{stats?.totalFlights ?? 0}
							</div>
							<p className="text-slate-600 mt-2">Total Flights</p>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="text-center">
							<BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
							<div className="text-3xl font-bold text-green-600">
								{aircraft?.length ?? 0}
							</div>
							<p className="text-slate-600 mt-2">Aircraft</p>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="text-center">
							<Clock className="w-8 h-8 text-purple-600 mx-auto mb-2" />
							<div className="text-3xl font-bold text-purple-600">
								{stats?.totalHours ?? 0}
							</div>
							<p className="text-slate-600 mt-2">Flight Hours</p>
						</div>
					</div>

					<div className="bg-white rounded-lg shadow p-6">
						<div className="text-center">
							<Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
							<div className="text-3xl font-bold text-orange-600">
								{stats?.totalPicHours ?? 0}
							</div>
							<p className="text-slate-600 mt-2">PIC Hours</p>
						</div>
					</div>
				</div>

				{/* Recent Flights */}
				{flights && flights.length > 0 ? (
					<div className="bg-white rounded-lg shadow-lg p-8 mt-8">
						<h2 className="text-2xl font-bold text-slate-900 mb-6">
							Recent Flights
						</h2>
						<div className="space-y-4">
							{flights.slice(0, 5).map((flight) => (
								<div
									key={flight.id}
									className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
								>
									<div>
										<p className="font-semibold text-slate-900">
											{flight.departureCode} → {flight.arrivalCode}
										</p>
										<p className="text-sm text-slate-600">
											{new Date(flight.date).toLocaleDateString()} • {flight.aircraft.registration}
										</p>
									</div>
									<div className="text-right">
										<p className="font-semibold text-blue-600">
											{flight.duration}h
										</p>
										<p className="text-sm text-slate-600">
											{flight.landings} landing{flight.landings > 1 ? 's' : ''}
										</p>
									</div>
								</div>
							))}
						</div>
					</div>
				) : (
					<div className="bg-white rounded-lg shadow-lg p-8 mt-8">
						<h2 className="text-2xl font-bold text-slate-900 mb-4">
							No Flights Yet
						</h2>
						<p className="text-slate-600">
							Start logging your flights to see them here!
						</p>
					</div>
				)}

				{/* Success Message */}
				<div className="bg-green-50 border border-green-200 rounded-lg p-6 mt-8">
					<h3 className="font-semibold text-green-900 mb-2">
						✓ T3 Stack Complete!
					</h3>
					<p className="text-green-800 text-sm">
						Your app is now a true T3 Stack project using tRPC! This dashboard
						fetches data through type-safe tRPC procedures with React Query for
						efficient caching. Check the browser console to see the tRPC API calls.
					</p>
				</div>
			</div>
		</div>
	);
}
