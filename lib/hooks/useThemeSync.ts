'use client';

import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { useAuth } from '@clerk/nextjs';
import { trpc } from '@/trpc/client';

/**
 * Syncs user's saved theme preference from database with next-themes
 * Automatically applies the theme on component mount
 */
export function useThemeSync() {
  const { setTheme } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();

  // Avoid hitting protected tRPC route when signed out
  const { data: prefs, isLoading } = trpc.preferences.getPreferences.useQuery(undefined, {
    enabled: isLoaded && isSignedIn,
  });

  useEffect(() => {
    if (!isLoading && prefs?.theme) {
      // Map database theme to next-themes format
      // LIGHT → light, DARK → dark, SYSTEM → system
      const themeValue = prefs.theme.toLowerCase();
      setTheme(themeValue);
    }
  }, [prefs, isLoading, setTheme]);

  return { isLoading };
}
