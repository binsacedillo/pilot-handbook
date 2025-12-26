import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { useRouter } from 'next/navigation';

const UserManagementTable = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const { data, isLoading } = trpc.admin.getAllUsers.useQuery({
    skip: page * 10,
    take: 10,
    search,
  });

  const router = useRouter();

  const promoteDemoteMutation = trpc.admin.promoteDemoteUser.useMutation({
    onSuccess: () => router.refresh(),
  });
  const verifyPilotMutation = trpc.admin.verifyPilot.useMutation({
    onSuccess: () => router.refresh(),
  });

  const handleChangeRole = (userId: string, role: 'ADMIN' | 'USER') => {
    promoteDemoteMutation.mutate({ userId, newRole: role });
  };

  const handleTogglePilotVerification = (
    userId: string,
    action: 'verify' | 'unverify'
  ) => {
    verifyPilotMutation.mutate({
      userId,
      action: action === 'verify' ? 'approve' : 'reject',
    });
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <input
        type="text"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 p-2 border rounded"
      />
      <table className="min-w-full border">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Role</th>
            <th className="border p-2">Joined Date</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data?.users.map((user) => (
            <tr key={user.id}>
              <td className="border p-2">{user.firstName} {user.lastName}</td>
              <td className="border p-2">{user.email}</td>
              <td className="border p-2">{user.role}</td>
              <td className="border p-2">{new Date(user.createdAt).toLocaleDateString()}</td>
              <td className="border p-2">
                <select
                  className="border p-2 rounded"
                  defaultValue=""
                  onChange={(e) => {
                    const value = e.target.value;

                    if (!value) return;

                    if (value === 'promote') {
                      handleChangeRole(user.id, 'ADMIN');
                    } else if (value === 'demote') {
                      handleChangeRole(user.id, 'USER');
                    } else if (value === 'verify') {
                      handleTogglePilotVerification(user.id, 'verify');
                    } else if (value === 'unverify') {
                      handleTogglePilotVerification(user.id, 'unverify');
                    }

                    e.target.value = '';
                  }}
                >
                  <option value="">Select action</option>
                  <option value="promote">Promote to Admin</option>
                  <option value="demote">Demote to User</option>
                  <option value="verify">Verify Pilot</option>
                  <option value="unverify">Unverify Pilot</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4">
        <button onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0} className="mr-2 p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition disabled:cursor-not-allowed disabled:opacity-60">Previous</button>
        <button onClick={() => setPage((prev) => prev + 1)} disabled={(data?.users?.length ?? 0) < 10} className="p-2 bg-blue-500 text-white rounded cursor-pointer hover:bg-blue-600 transition disabled:cursor-not-allowed disabled:opacity-60">Next</button>
      </div>
    </div>
  );
};

export default UserManagementTable;