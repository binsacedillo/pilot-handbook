"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Plane, CheckCircle, ArrowLeft, ExternalLink, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

function isInAppBrowser() {
	if (typeof window === "undefined") return false;
	const ua = navigator.userAgent || navigator.vendor;
	return (
		/FBAN|FBAV|Instagram|Messenger|Line|WeChat|Snapchat|Twitter|TikTok|wv/.test(ua) ||
		(window.navigator.standalone === false) ||
		(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches)
	);
}

function RedirectToExternal() {
	const [copied, setCopied] = useState(false);
	const [intentError, setIntentError] = useState(false);
	const url = typeof window !== "undefined" ? window.location.href : "";

	const handleCopy = () => {
		if (navigator.clipboard) {
			navigator.clipboard.writeText(url);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	const handleOpenBrowser = () => {
		// Android intent:// fallback
		try {
			if (/Android/i.test(navigator.userAgent)) {
				window.location.href = `intent://${window.location.host}${window.location.pathname}#Intent;scheme=https;end`;
			} else {
				window.open(url, "_blank");
			}
		} catch {
			setIntentError(true);
		}
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-blue-900 via-slate-900 to-blue-800 px-4">
			<div className="max-w-md w-full bg-white/10 rounded-xl shadow-xl p-6 text-center">
				<div className="flex items-center justify-center gap-2 mb-4">
					<Plane className="w-7 h-7 text-blue-500" />
					<span className="text-2xl font-bold text-white">Pilot Handbook</span>
				</div>
				<h2 className="text-xl font-semibold text-white mb-2">Google Sign-In Restricted</h2>
				<p className="text-slate-200 mb-4">
					Google and other providers block sign-in from this app&apos;s browser.<br />
					Please open this page in your device&apos;s browser for secure authentication.
				</p>
				<div className="flex flex-col gap-3 mt-4">
					<button
						onClick={handleCopy}
						className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow"
					>
						<Copy className="w-5 h-5" /> Copy Link
					</button>
					<button
						onClick={handleOpenBrowser}
						className="flex items-center justify-center gap-2 bg-slate-700 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded-lg shadow"
					>
						<ExternalLink className="w-5 h-5" /> Open in Browser
					</button>
				</div>
				{copied && <div className="mt-2 text-green-400 font-semibold">Link Copied!</div>}
				{intentError && <div className="mt-2 text-red-400 font-semibold">Could not open browser. Please copy the link manually.</div>}
				<div className="mt-6 text-xs text-slate-300">Tip: On iOS, tap <span className="font-bold">•••</span> or <span className="font-bold">Share</span> and choose <span className="font-bold">Open in Browser</span>.</div>
			</div>
		</div>
	);
}

export default function SignInPage() {
	const { theme } = useTheme();
	const { isLoaded } = useUser();
	const isEmbedded = isInAppBrowser();

	if (!isLoaded) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<Loader2 className="h-12 w-12 animate-spin text-primary" />
			</div>
		);
	}

	if (isEmbedded) {
		return <RedirectToExternal />;
	}

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
			</div>

			{/* Right Side - Sign In Form */}
			<div className="flex-1 flex items-center justify-center p-8">
				<div className="w-full max-w-md">
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