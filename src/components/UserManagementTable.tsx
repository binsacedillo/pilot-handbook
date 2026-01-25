"use client";
import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/DeleteDialog';
import { Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from '@/lib/error-utils';

const UserManagementTable = () => {
  const { showToast } = useToast();
  // Only pagination is used; search argument removed as backend does not support it
  const [page, setPage] = useState(0);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
  }>({ open: false, userId: null, userName: null });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getAllUsers.useQuery({
    skip: page * 10,
    take: 10,
  });

  // Verify pilot mutation with proper cache invalidation
  const verifyPilotMutation = trpc.admin.verifyPilot.useMutation({
    onMutate: async ({ userId, verified }) => {
      // Cancel outgoing refetches to avoid race conditions
      await utils.admin.getAllUsers.cancel();
      
      // Optimistically update the cache
      const previousData = utils.admin.getAllUsers.getData({ skip: page * 10, take: 10 });
      if (previousData) {
        utils.admin.getAllUsers.setData(
          { skip: page * 10, take: 10 },
          {
            ...previousData,
            users: previousData.users.map(user => 
              user.id === userId 
                ? { ...user, role: verified ? 'PILOT' : 'USER' as const }
                : user
            ),
          }
        );
      }
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.admin.getAllUsers.setData(
          { skip: page * 10, take: 10 },
          context.previousData
        );
      }
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("update user verification")
        : getServerErrorMessage("update user verification", err);
      showToast(errorMessage, "error", {
        action: {
          label: "Retry",
          onClick: () => verifyPilotMutation.mutate(variables),
        },
      });
    },
    onSettled: async () => {
      // Refetch to sync with server
      await utils.admin.getAllUsers.invalidate();
      await utils.admin.getStats.invalidate();
      await utils.admin.recentUsers.invalidate();
    },
  });

  // Delete user mutation with proper cache invalidation
  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onMutate: async ({ userId }) => {
      // Cancel outgoing refetches
      await utils.admin.getAllUsers.cancel();
      
      // Optimistically remove from cache
      const previousData = utils.admin.getAllUsers.getData({ skip: page * 10, take: 10 });
      if (previousData) {
        utils.admin.getAllUsers.setData(
          { skip: page * 10, take: 10 },
          {
            ...previousData,
            users: previousData.users.filter(user => user.id !== userId),
            total: previousData.total - 1,
          }
        );
      }
      return { previousData };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (context?.previousData) {
        utils.admin.getAllUsers.setData(
          { skip: page * 10, take: 10 },
          context.previousData
        );
      }
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("delete user")
        : getServerErrorMessage("delete user", err);
      showToast(errorMessage, "error", {
        action: {
          label: "Retry",
          onClick: () => deleteUserMutation.mutate(variables),
        },
      });
    },
    onSuccess: () => {
      setDeleteDialogState({ open: false, userId: null, userName: null });
    },
    onSettled: async () => {
      // Invalidate all admin queries to sync with server
      await utils.admin.getAllUsers.invalidate();
      await utils.admin.getStats.invalidate();
      await utils.admin.recentUsers.invalidate();
    },
  });

  // Role change is not implemented, so we do not handle it here

  const handleTogglePilotVerification = (
    userId: string,
    action: 'verify' | 'unverify'
  ) => {
    // Backend expects a boolean 'verified', not a string 'action'
    verifyPilotMutation.mutate({
      userId,
      verified: action === 'verify',
    });
  };

  const handleDeleteClick = (userId: string, userName: string) => {
    setDeleteDialogState({
      open: true,
      userId,
      userName,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogState.userId) return;
    deleteUserMutation.mutate({ userId: deleteDialogState.userId });
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex items-center justify-center" role="status" aria-live="polite" aria-busy="true">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="sr-only">Loading users...</span>
        </div>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      {/* Search input removed as backend does not support search */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-background divide-y divide-border">
            {data?.users.map((user) => (
              <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {user.firstName} {user.lastName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' :
                    user.role === 'PILOT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <div className="flex items-center gap-2">
                    <select
                      className="border border-input bg-background px-3 py-2 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-muted/50 transition"
                      defaultValue=""
                      onChange={(e) => {
                        const value = e.target.value;
                        if (!value) return;
                        if (value === 'verify') {
                          handleTogglePilotVerification(user.id, 'verify');
                        } else if (value === 'unverify') {
                          handleTogglePilotVerification(user.id, 'unverify');
                        }
                        e.target.value = '';
                      }}
                    >
                      <option value="">Select action</option>
                      <option value="verify">Verify Pilot</option>
                      <option value="unverify">Unverify Pilot</option>
                    </select>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteClick(user.id, `${user.firstName} ${user.lastName}`)}
                      title="Delete user"
                      aria-label={`Delete user ${user.firstName} ${user.lastName}`}
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  </div>
                  {/*
                    Promote/Demote Admin button and mutation are commented out for now.
                    Uncomment and implement when backend is ready.
                    Example:
                    <button
                      onClick={() => promoteDemoteMutation.mutate({ userId: user.id, promote: true })}
                      className="ml-2 p-2 bg-yellow-500 text-white rounded"
                    >
                      Promote to Admin
                    </button>
                  */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {page * 10 + 1} to {Math.min((page + 1) * 10, (data?.users?.length ?? 0) + page * 10)} of {data?.total ?? 0} users
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setPage((prev) => Math.max(prev - 1, 0))} 
            disabled={page === 0} 
            variant="outline"
            size="sm"
          >
            Previous
          </Button>
          <Button 
            onClick={() => setPage((prev) => prev + 1)} 
            disabled={(data?.users?.length ?? 0) < 10}
            variant="outline"
            size="sm"
          >
            Next
          </Button>
        </div>
      </div>

      <DeleteDialog
        open={deleteDialogState.open}
        onOpenChange={(open) => setDeleteDialogState({ open, userId: null, userName: null })}
        title="Delete User"
        description="⚠️ CRITICAL: This will permanently delete this user's account and ALL their flight data. This includes all flight hours, aircraft records, and logbook entries. This action CANNOT be undone and may affect the pilot's legal records."
        itemName={deleteDialogState.userName || undefined}
        isLoading={deleteUserMutation.isPending}
        onConfirm={handleConfirmDelete}
        requireConfirmText="DELETE"
      />
    </Card>
  );
};

export default UserManagementTable;