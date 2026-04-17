import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)",
  "/api/trpc(.*)",
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

export default clerkMiddleware(async (auth, req) => {
  // Only protect routes that are NOT public
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Next.js standard matcher for Clerk
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
