'use client';

import UserManagementTable from '@/src/components/UserManagementTable';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';

export default function AdminUsersPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">User Management</h1>
            <p className="text-muted-foreground">Manage user roles and permissions</p>
          </div>
          <UserManagementTable />
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
