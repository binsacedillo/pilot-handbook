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

export default clerkMiddleware(async (auth, req) => {
  // 1. Explicitly bypass middleware for tRPC to let procedures handle auth
  if (isTRPC(req)) return;

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

