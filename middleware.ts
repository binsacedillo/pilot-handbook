import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isAdminRoute = createRouteMatcher(['/admin', '/admin/(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isAdminRoute(req)) {
    const { userId, sessionClaims, redirectToSignIn } = await auth();

    if (!userId) {
      console.log('🛑 No userId → redirecting to sign in');
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    const role = sessionClaims?.metadata?.role as string | undefined;

    console.log('🔍 Middleware check:');
    console.log('   User ID:', userId);
    console.log('   Role from session claims:', role);

    if (role !== 'ADMIN') {
      console.log('🚫 Not ADMIN → redirecting to home');
      return Response.redirect(new URL('/', req.url));
    }

    console.log('✅ ADMIN access granted');
  }
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
};
