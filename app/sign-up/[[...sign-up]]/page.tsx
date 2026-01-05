

"use client";

// Extend Navigator type to include 'standalone' for iOS PWA detection
declare global {
	interface Navigator {
		standalone?: boolean;
	}
}

import { SignUp } from "@clerk/nextjs";
// ...existing code...
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
export default function SignUpPage() {
	const { theme } = useTheme();
	const { isSignedIn } = useUser();
	const router = useRouter();
	const [isEmbedded, setIsEmbedded] = useState(false);
	const [copied, setCopied] = useState(false);
	// ...existing code...

	useEffect(() => {
		// Detect embedded browsers/webviews
		const ua = navigator.userAgent || navigator.vendor;
		const shouldEmbed =
			/FBAN|FBAV|Instagram|Messenger|Line|WeChat|Snapchat|Twitter|TikTok|wv/.test(ua) ||
			(window.navigator.standalone === false) ||
			(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);

		if (isEmbedded !== shouldEmbed) {
			setTimeout(() => setIsEmbedded(shouldEmbed), 0);
		}

		if (isSignedIn) {
			router.push("/");
		}
	}, [isSignedIn, router, isEmbedded]);

	if (isSignedIn) return null;

	if (isEmbedded) {
		return (
			<div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
				<h1 className="text-xl font-bold mb-4">⚠️ Browser Not Supported</h1>
				<p className="mb-6">
					Security features (like Google Login) are disabled inside apps like TikTok or Instagram.
				</p>
				<button
					onClick={() => {
						navigator.clipboard.writeText(window.location.href);
						setCopied(true);
						setTimeout(() => setCopied(false), 2000);
					}}
					className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold"
				>
					{copied ? "Link Copied!" : "Copy Link & Open Browser"}
				</button>
				{copied && (
					<span className="mt-2 text-green-600 font-semibold">Link copied! Open Chrome/Safari and paste it.</span>
				)}
				<p className="mt-4 text-sm text-gray-500">
					Tap the <span className="font-bold">•••</span> menu above and select <br />
					   <span className="font-bold">&quot;Open in Browser&quot;</span>
				</p>
			</div>
		);
	}

	// Only render SignUp if not embedded
	return (
		<div className="flex justify-center py-24">
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
	);
}
