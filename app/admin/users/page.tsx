import UserManagementTable from '@/src/components/UserManagementTable';

export default function AdminUsersPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserManagementTable />
    </div>
  );
}
