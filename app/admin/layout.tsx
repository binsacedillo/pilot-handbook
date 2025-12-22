// app/admin/layout.tsx
import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { sessionClaims } = await auth();
  const role = sessionClaims?.metadata?.role as string | undefined;

  if (role !== 'ADMIN') {
    redirect('/');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <nav className="space-x-8">
              <Link href="/admin" className="text-blue-600 hover:text-blue-800 font-medium">
                Overview
              </Link>
              <Link href="/admin/users" className="text-gray-700 hover:text-gray-900">
                Users
              </Link>
              <Link href="/admin/verifications" className="text-gray-700 hover:text-gray-900">
                Verifications
              </Link>
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
