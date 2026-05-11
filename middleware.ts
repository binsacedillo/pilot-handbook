import { NextResponse } from "next/server";
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/health",
  "/manifest.json",
  "/favicon.ico",
  "/logo.png",
  "/icon-192.png",
  "/icon-512.png",
  "/privacy(.*)",
  "/terms(.*)",
  "/about(.*)",
  "/contact(.*)",
  "/help(.*)",
]);

const isTRPC = createRouteMatcher(["/api/trpc(.*)"]);

const isE2E = process.env.NEXT_PUBLIC_E2E === "true";

// Bypass Clerk entirely in CI/E2E environments to prevent SSL/Redirect interference
export default clerkMiddleware(async (auth, req) => {
  if (isE2E) return NextResponse.next();
  
  // 1. Explicitly bypass middleware for tRPC to let procedures handle auth
  if (isTRPC(req)) return NextResponse.next();

  // 2. Only protect routes that are NOT public
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js standard matcher for Clerk
    "/((?!_next|.*\\..*).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};

