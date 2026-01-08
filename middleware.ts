import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/api/webhooks(.*)"
]);

const isAdminRoute = createRouteMatcher(["/admin(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  // 1. Get the auth state
  const { userId, sessionClaims } = await auth();

  // 2. If it's a public route, let them pass
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 3. If NOT a public route and NOT logged in, redirect to sign-in
  if (!userId) {
    // This is the manual version of .protect() that TS cannot complain about
    const signInUrl = new URL("/sign-in", req.url);
    signInUrl.searchParams.set("redirect_url", req.url);
    return NextResponse.redirect(signInUrl);
  }

  // 4. Handle Admin Protection
  if (isAdminRoute(req)) {
    const role = sessionClaims?.metadata?.role;

    if (role !== "ADMIN") {
      const url = new URL("/dashboard", req.url);
      return NextResponse.redirect(url);
    }
  }

  // 5. Success - Proceed to the route
  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};