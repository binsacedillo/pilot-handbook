'use client';

import { useThemeSync } from '@/lib/hooks/useThemeSync';

/**
 * Wraps the app to safely execute theme synchronization hook
 * Syncs user's saved theme preference from database on app load
 */
export function ThemeWrapper({ children }: { children: React.ReactNode }) {
  // Initialize theme sync on client side
  useThemeSync();

  return <>{children}</>;
}
