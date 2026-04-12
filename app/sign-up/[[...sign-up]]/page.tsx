"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Plane, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Footer from "@/components/landing/Footer";

// Extend Navigator type to include 'standalone' for iOS PWA detection
declare global {
	interface Navigator {
		standalone?: boolean;
	}
}

export default function SignUpPage() {
	const { theme } = useTheme();
	const { isSignedIn, isLoaded } = useUser();
	const router = useRouter();

	useEffect(() => {
		if (isSignedIn) {
			router.push("/");
		}
	}, [isSignedIn, router]);

	if (!isLoaded) {
		return (
			<div className="flex justify-center items-center min-h-screen font-sans">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
			</div>
		);
	}

	// Always show the form, regardless of browser detection
	return (
		<div className="flex flex-col min-h-screen bg-slate-900 font-sans">
			<div className="flex-1 flex flex-col lg:flex-row bg-linear-to-br from-gray-900 via-black to-gray-800">
				{/* Left Side - Branding */}
				<div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden">
					<div className="absolute inset-0 opacity-10">
						<div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
						<div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-600 rounded-full blur-3xl"></div>
					</div>

					<div className="relative z-10">
						<Link href="/" className="flex items-center gap-3 mb-8 hover:opacity-80 transition-opacity">
							<div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
								<Plane className="w-8 h-8 text-white" />
							</div>
							<span className="text-3xl font-bold text-white">Pilot Handbook</span>
						</Link>

						<div className="mt-20">
							<h1 className="text-5xl font-bold text-white mb-6 leading-tight">
								Create Your
								<br />
								Account
							</h1>
							<p className="text-xl text-gray-300 max-w-md mb-8">
								Sign up to access your flight logs, manage your aircraft, and track your aviation career.
							</p>

							<div className="space-y-4">
								<div className="flex items-center gap-3 text-white">
									<CheckCircle className="w-6 h-6 shrink-0" />
									<span className="text-lg font-medium">Secure authentication</span>
								</div>
								<div className="flex items-center gap-3 text-white">
									<CheckCircle className="w-6 h-6 shrink-0" />
									<span className="text-lg font-medium">Professional logbook access</span>
								</div>
								<div className="flex items-center gap-3 text-white">
									<CheckCircle className="w-6 h-6 shrink-0" />
									<span className="text-lg font-medium">Integrated flight history</span>
								</div>
								<div className="flex items-center gap-3 text-white">
									<CheckCircle className="w-6 h-6 shrink-0" />
									<span className="text-lg font-medium">Fleet management tools</span>
								</div>
							</div>
						</div>
					</div>

					<div className="relative z-10 border-l-4 border-blue-600 pl-6 py-2">
						<p className="text-gray-400 text-sm italic">
							&ldquo;This logbook has transformed how I track my hours. It&apos;s intuitive,
							reliable, and exactly what I needed.&rdquo;
						</p>
						<p className="text-white font-semibold mt-2">
							— Capt. Sarah Chen, Commercial Pilot
						</p>
					</div>
				</div>

				{/* Right Side - Sign Up Form */}
				<div className="flex-1 flex items-center justify-center p-8">
					<div className="w-full max-w-md">
						<Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors mb-6 group">
							<ArrowLeft className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" />
							Back to home
						</Link>
						<div className="lg:hidden mb-10 text-center">
							<div className="flex items-center justify-center gap-3 mb-4">
								<Plane className="w-8 h-8 text-blue-500" />
								<span className="text-3xl font-bold text-white">
									Pilot Handbook
								</span>
							</div>
							<p className="text-slate-400 text-lg">Create your professional account</p>
						</div>

						<SignUp
							routing="path"
							path="/sign-up"
							signInUrl="/sign-in"
							fallbackRedirectUrl="/dashboard"
							appearance={{
								baseTheme: theme === "dark" ? dark : undefined,
								variables: {
									colorPrimary: "#2563eb",
									borderRadius: "0.75rem",
									fontSize: "15px",
								},
								elements: {
									rootBox: "w-full shadow-2xl overflow-hidden rounded-xl",
									card: "border border-slate-700/50 bg-slate-900/50 backdrop-blur-md",
									headerTitle: "text-white",
									headerSubtitle: "text-slate-400",
									socialButtonsBlockButton: "border-slate-700 bg-slate-800 text-white hover:bg-slate-700",
									formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white h-11 transition-all",
									formFieldInput: "bg-slate-800 border-slate-700 text-white focus:border-blue-500",
									formFieldLabel: "text-slate-300",
									footerActionLink: "text-blue-500 hover:text-blue-400",
									dividerText: "text-slate-500",
									dividerLine: "bg-slate-700",
									identityPreviewText: "text-white",
								},
							}}
						/>
					</div>
				</div>
			</div>
			{/* High-quality footer for legal and links */}
			<Footer />
		</div>
	);
}