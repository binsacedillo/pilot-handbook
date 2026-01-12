"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Plane, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";

export default function SignInPage() {
	const { theme } = useTheme();
	const { isLoaded } = useUser();

	if (!isLoaded) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
			</div>
		);
	}

	// Always show the form, regardless of browser detection
	return (
		<div className="flex min-h-screen bg-linear-to-br from-gray-900 via-black to-gray-800">
			{/* Left Side - Branding */}
			<div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative overflow-hidden">
				<div className="absolute inset-0 opacity-10">
					<div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
					<div className="absolute bottom-20 right-10 w-96 h-96 bg-gray-600 rounded-full blur-3xl"></div>
				</div>

				<div className="relative z-10">
					<div className="flex items-center gap-3 mb-8">
						<div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
							<Plane className="w-8 h-8 text-white" />
						</div>
						<span className="text-3xl font-bold text-white">Pilot Logbook</span>
					</div>

					<div className="mt-20">
						<h1 className="text-5xl font-bold text-white mb-6 leading-tight">
							Welcome
							<br />
							Back Pilot
						</h1>
						<p className="text-xl text-gray-300 max-w-md mb-8">
							Access your flight logs, manage your aircraft, and continue tracking your aviation career.
						</p>

						<div className="space-y-4">
							<div className="flex items-center gap-3 text-white">
								<CheckCircle className="w-6 h-6 shrink-0" />
								<span className="text-lg">Secure authentication</span>
							</div>
							<div className="flex items-center gap-3 text-white">
								<CheckCircle className="w-6 h-6 shrink-0" />
								<span className="text-lg">Access your logbook</span>
							</div>
							<div className="flex items-center gap-3 text-white">
								<CheckCircle className="w-6 h-6 shrink-0" />
								<span className="text-lg">View flight history</span>
							</div>
							<div className="flex items-center gap-3 text-white">
								<CheckCircle className="w-6 h-6 shrink-0" />
								<span className="text-lg">Manage your aircraft</span>
							</div>
						</div>
					</div>
				</div>

				<div className="relative z-10">
					<p className="text-gray-400 text-sm">
						&ldquo;This logbook has transformed how I track my hours. It&apos;s intuitive,
						reliable, and exactly what I needed.&rdquo;
					</p>
					<p className="text-white font-semibold mt-2">
						— Sarah Chen, Commercial Pilot
					</p>
				</div>
			</div>z

			{/* Right Side - Sign In Form */}
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="w-full max-w-md">
					<div className="mb-6 p-3 rounded-md bg-yellow-100 border border-yellow-300 text-yellow-900 text-sm flex items-center gap-2">
						<span role="img" aria-label="Warning">⚠️</span>
						<span>Sign in only works in external browsers. If you see a 404 or “disallowed_useragent” error, please open this site in Chrome, Safari, or Firefox.</span>
					</div>
					<Link href="/" className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition-colors mb-6">
						<ArrowLeft className="h-4 w-4" aria-hidden />
						Back to home
					</Link>
					<div className="lg:hidden mb-8 text-center">
						<div className="flex items-center justify-center gap-2 mb-4">
							<Plane className="w-6 h-6 text-blue-600" />
							<span className="text-2xl font-bold text-foreground">
								Pilot Logbook
							</span>
						</div>
						<p className="text-muted-foreground">Welcome back! Sign in to your account</p>
					</div>

					<SignIn
						routing="path"
						path="/sign-in"
						signUpUrl="/sign-up"
						fallbackRedirectUrl="/dashboard"
						appearance={{
							baseTheme: theme === "dark" ? dark : undefined,
							variables: {
								colorPrimary: "#2563eb",
								borderRadius: "0.75rem",
								fontSize: "15px",
							},
							elements: {
								rootBox: "w-full",
								card: "shadow-xl border border-border bg-card",
								headerTitle: "text-foreground",
								headerSubtitle: "text-muted-foreground",
								socialButtonsBlockButton: "border-border bg-card text-card-foreground hover:bg-accent hover:text-accent-foreground",
								socialButtonsIconButton: "border-border bg-card text-card-foreground hover:bg-accent",
								formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white normal-case shadow-sm",
								formFieldInput: "bg-card border-border text-foreground placeholder:text-muted-foreground focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
								formFieldLabel: "text-foreground",
								identityPreviewText: "text-foreground",
								identityPreviewEditButton: "text-muted-foreground hover:text-foreground",
								formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
								otpCodeFieldInput: "bg-card border-border text-foreground",
								formResendCodeLink: "text-blue-600 hover:text-blue-700",
								footerActionLink: "text-blue-600 hover:text-blue-700",
								formHeaderTitle: "text-foreground",
								formHeaderSubtitle: "text-muted-foreground",
								dividerLine: "bg-border",
								dividerText: "text-muted-foreground",
								logoImage: "brightness-100 dark:brightness-100",
							},
						}}
					/>
				</div>
			</div>
		</div>
	);
}