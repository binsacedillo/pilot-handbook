// app/admin/layout.tsx
import { isCurrentUserAdmin } from '@/lib/clerk-roles';
import { redirect } from 'next/navigation';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await isCurrentUserAdmin();
  if (!isAdmin) {
    redirect('/dashboard');
  }
  return <>{children}</>;
}
