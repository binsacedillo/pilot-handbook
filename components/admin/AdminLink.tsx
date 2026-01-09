import Link from 'next/link';
import { isCurrentUserAdmin } from '@/lib/clerk-roles';
import { ShieldAlert } from 'lucide-react';

/**
 * Server component that conditionally renders admin link
 * Only shows if current user has ADMIN role
 */
export async function AdminLink() {
  const isAdmin = await isCurrentUserAdmin();

  if (!isAdmin) {
    return null;
  }

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
