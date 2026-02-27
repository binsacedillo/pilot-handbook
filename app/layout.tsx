import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";
import ClerkProviderClient from "@/components/providers/ClerkProviderClient";
import { TRPCProvider } from "@/trpc/Provider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemeWrapper } from "@/components/providers/ThemeWrapper";
import DevWarningBanner from "@/components/dev/DevWarningBanner";
import { FeedbackButton } from "@/components/feedback/feedback-index";
import { SessionExpirationHandler } from "@/components/SessionExpirationHandler";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Pilot Handbook",
  description: "Your personal pilot logbook",
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
    ],
  },
};

// Responsive viewport configuration for mobile devices
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Preconnect for external image domains */}
          <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://api.clerk.com" crossOrigin="anonymous" />
        </head>
        <body className={`font-sans ${inter.variable} flex flex-col min-h-screen`}>
          {/* Skip to main content for keyboard navigation (WCAG 2.1) */}
          <a href="#main-content" className="skip-to-main">
            Skip to main content
          </a>

          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
            <TRPCProvider>
              <ClerkProviderClient>
                <SessionExpirationHandler />
                <ThemeWrapper>
                  <div className="flex flex-col min-h-screen">
                    <DevWarningBanner />
                    {children}
                    <FeedbackButton />
                  </div>
                </ThemeWrapper>
              </ClerkProviderClient>
            </TRPCProvider>
          </ThemeProvider>
        </body>
      </html>
    </ToastProvider>
  );
}
