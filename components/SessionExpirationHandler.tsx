'use client';

import { useAuth } from '@clerk/nextjs';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { useToast } from './ui/toast';

/**
 * Handles Clerk session expiration gracefully by detecting auth errors
 * and redirecting to sign-in with a return URL.
 * 
 * Listens for UNAUTHORIZED errors from tRPC and triggers re-authentication.
 */
export function SessionExpirationHandler() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { showToast } = useToast();
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Only handle when auth is loaded
    if (!isLoaded) return;

    // If user becomes signed out while on a protected route
    if (!isSignedIn && pathname && !pathname.startsWith('/sign-in') && !pathname.startsWith('/sign-up')) {
      // Don't redirect from public pages
      const publicPages = ['/', '/about', '/contact', '/privacy', '/terms', '/help'];
      if (!publicPages.includes(pathname)) {
        if (!hasShownToast.current) {
          showToast('Your session has expired. Please sign in again.', 'info');
          hasShownToast.current = true;
        }
        
        // Redirect to sign-in with return URL
        const returnUrl = encodeURIComponent(pathname);
        router.push(`/sign-in?redirect_url=${returnUrl}`);
      }
    }

    // Reset toast flag when signed in
    if (isSignedIn) {
      hasShownToast.current = false;
    }
  }, [isSignedIn, isLoaded, pathname, router, showToast]);

  // This component doesn't render anything
  return null;
}
