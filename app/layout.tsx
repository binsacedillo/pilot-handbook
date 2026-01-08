
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { TRPCProvider } from "@/trpc/Provider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ThemeWrapper } from "@/components/ThemeWrapper";
import DevWarningBanner from "@/components/DevWarningBanner";

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`font-sans ${inter.variable} flex flex-col min-h-screen`}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <TRPCProvider>
              <ThemeWrapper>
                <div className="flex flex-col min-h-screen">
                  <DevWarningBanner />
                  {children}
                </div>
              </ThemeWrapper>
            </TRPCProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
