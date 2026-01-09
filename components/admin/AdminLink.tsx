import type { JSX } from 'react';
import Link from 'next/link';
import { isCurrentUserAdmin } from '@/lib/clerk-roles';
import { ShieldAlert } from 'lucide-react';

/**
 * Server component that conditionally renders admin link.
 * Handles errors, type safety, and is ready for Suspense.
 */
export async function AdminLink(): Promise<JSX.Element | null> {
  let isAdmin: boolean = false;
  try {
    isAdmin = await isCurrentUserAdmin();
  } catch (error) {
    // Log error for observability, but fail silent for security
    console.error('AdminLink: Failed to check admin status', error);
    // Optionally, report to error tracking service here
    return null;
  }

  if (!isAdmin) return null;

  return (
    <li>
      <Link
        href="/admin"
        className="text-lg text-amber-600 dark:text-amber-500 hover:text-amber-700 dark:hover:text-amber-400 transition-colors flex items-center gap-2 font-semibold"
        title="Admin Panel - System Management"
      >
        <ShieldAlert className="h-4 w-4" aria-hidden="true" />
        Admin
      </Link>
    </li>
  );
}
