import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import ClerkProviderClient from "@/components/providers/ClerkProviderClient";
import { TRPCProvider } from "@/trpc/Provider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { ThemeWrapper } from "@/components/providers/ThemeWrapper";
import ReleaseAdvisory from "@/components/layout/ReleaseAdvisory";
import { FeedbackButton } from "@/components/feedback/feedback-index";
import { SessionExpirationHandler } from "@/components/SessionExpirationHandler";
import { IdleTimeoutManager } from "@/components/Security/IdleTimeoutManager";
import SmoothScroll from "@/components/providers/SmoothScroll";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pilot Handbook",
  description: "Your personal pilot logbook",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pilot Handbook",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        sizes: "any",
      },
      {
        url: "/logo.png",
        type: "image/png",
      },
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  },
};

// Responsive viewport configuration for mobile devices
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FF4D00",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isE2E = process.env.NEXT_PUBLIC_E2E === "true";

  return (
    <ToastProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Preconnect for external image domains */}
          <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://api.clerk.com" crossOrigin="anonymous" />
        </head>
        <body className={`font-sans ${inter.variable} flex flex-col min-h-screen transition-colors duration-300`}>
          {/* Skip to main content for keyboard navigation (WCAG 2.1) */}
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>

          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCProvider>
              {isE2E ? (
                <ThemeWrapper>
                  <SmoothScroll>
                    <div className="flex flex-col min-h-screen">
                      <ReleaseAdvisory />
                      {children}
                      <FeedbackButton />
                    </div>
                  </SmoothScroll>
                </ThemeWrapper>
              ) : (
                <ClerkProviderClient>
                  <SessionExpirationHandler />
                  <IdleTimeoutManager />
                  <ThemeWrapper>
                    <SmoothScroll>
                      <div className="flex flex-col min-h-screen">
                        <ReleaseAdvisory />
                        {children}
                        <FeedbackButton />
                      </div>
                    </SmoothScroll>
                  </ThemeWrapper>
                </ClerkProviderClient>
              )}
            </TRPCProvider>
          </ThemeProvider>
        </body>
      </html>
    </ToastProvider>
  );
}
