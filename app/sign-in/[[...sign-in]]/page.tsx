"use client";

import { SignIn, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { Plane, CheckCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { dark } from "@clerk/themes";
import AuthFooter from "@/components/auth/AuthFooter";

export default function SignInPage() {
  const { theme } = useTheme();
  const { isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-vh-100 bg-zinc-950 font-sans">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col font-sans relative overflow-hidden">
      {/* Background: Pure Operational Slate */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md flex flex-col items-center">
          {/* Logo Header */}
          <Link href="/" className="flex flex-col items-center gap-4 mb-10 group transition-all duration-300">
            <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl group-hover:border-blue-500/50 transition-colors">
              <Plane className="w-10 h-10 text-blue-500" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black tracking-tighter text-white uppercase">Pilot Handbook</h1>
              <p className="text-[10px] font-bold text-zinc-500 tracking-[.3em] uppercase mt-1">Operational Entry System</p>
            </div>
          </Link>

          <SignIn
            routing="path"
            path="/sign-in"
            signUpUrl="/sign-up"
            fallbackRedirectUrl="/dashboard"
            appearance={{
              baseTheme: theme === "dark" ? dark : undefined,
              variables: {
                colorPrimary: "#2563eb",
                borderRadius: "1rem",
                fontSize: "14px",
                fontFamily: "Inter, sans-serif"
              },
              elements: {
                rootBox: "w-full shadow-2xl",
                card: "border border-zinc-800 bg-zinc-900/95 shadow-none",
                headerTitle: "text-white text-xl font-bold tracking-tight",
                headerSubtitle: "text-zinc-500 font-medium",
                socialButtonsBlockButton: "border-zinc-800 bg-zinc-900 text-white hover:bg-zinc-800 h-12 transition-all",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white h-12 text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all",
                formFieldInput: "bg-zinc-950 border-zinc-800 text-white h-12 focus:border-blue-500 transition-all",
                formFieldLabel: "text-zinc-400 font-bold uppercase text-[9px] tracking-widest mb-1",
                footerActionLink: "text-blue-500 hover:text-blue-400 font-bold",
                dividerText: "text-zinc-600 text-[10px] font-black uppercase",
                dividerLine: "bg-zinc-800",
                identityPreviewText: "text-white",
                formFieldAction: "text-blue-500 hover:text-blue-400 font-bold text-xs"
              },
            }}
          />

          <Link href="/" className="mt-8 inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600 hover:text-white transition-colors group">
            <ArrowLeft className="h-3 w-3 transform group-hover:-translate-x-1 transition-transform" />
            Return to Surface
          </Link>
        </div>
      </div>

      <AuthFooter />
    </div>
  );
}