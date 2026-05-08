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
  const { theme: currentTheme, setTheme } = useTheme();
  const { isLoaded, isSignedIn } = useAuth();
 
  // Avoid hitting protected tRPC route when signed out
  const { data: prefs, isLoading } = trpc.preferences.getPreferences.useQuery(undefined, {
    enabled: isLoaded && isSignedIn,
    staleTime: 1000 * 60 * 5, // Preferences are very stable
    refetchOnWindowFocus: false,
  });
 
  useEffect(() => {
    if (!isLoading && prefs?.theme) {
      const themeValue = prefs.theme.toLowerCase();
      // Only update if the theme actually changed to avoid render loops
      if (currentTheme !== themeValue) {
        setTheme(themeValue);
      }
    }
  }, [prefs, isLoading, setTheme, currentTheme]);

  return { isLoading };
}
