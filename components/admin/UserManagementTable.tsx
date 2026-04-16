"use client";

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { GlassCard, GlassCardContent, GlassCardHeader } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/button';
import { DeleteDialog } from '@/components/common/DeleteDialog';
import { Trash2, Users, ChevronLeft, ChevronRight, UserCog } from 'lucide-react';
import { useToast } from '@/components/ui/toast';
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from '@/lib/error-utils';
import { cn } from '@/lib/utils';

const UserManagementTable = () => {
  const { showToast } = useToast();
  const [page, setPage] = useState(0);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
  }>({ open: false, userId: null, userName: null });

  const [verifyDialogState, setVerifyDialogState] = useState<{
    open: boolean;
    userId: string | null;
    userName: string | null;
    setToPilot: boolean;
  }>({ open: false, userId: null, userName: null, setToPilot: false });

  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.admin.getAllUsers.useQuery({
    skip: page * 10,
    take: 10,
  });

  const verifyPilotMutation = trpc.admin.verifyPilot.useMutation({
    onMutate: async ({ userId, verified }) => {
      await utils.admin.getAllUsers.cancel();
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
      if (context?.previousData) {
        utils.admin.getAllUsers.setData(
          { skip: page * 10, take: 10 },
          context.previousData
        );
      }
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("update user verification")
        : getServerErrorMessage("update user verification", err);
      showToast(errorMessage, "error");
    },
    onSettled: async () => {
      await utils.admin.getAllUsers.invalidate();
      await utils.admin.getStats.invalidate();
    },
  });

  const deleteUserMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: () => {
      setDeleteDialogState({ open: false, userId: null, userName: null });
      showToast("User record removed from system", "success");
    },
    onSettled: async () => {
      await utils.admin.getAllUsers.invalidate();
      await utils.admin.getStats.invalidate();
    },
  });

  const handleVerifyClick = (userId: string, userName: string, setToPilot: boolean) => {
    setVerifyDialogState({ open: true, userId, userName, setToPilot });
  };

  const handleConfirmVerify = () => {
    if (!verifyDialogState.userId) return;
    verifyPilotMutation.mutate({ userId: verifyDialogState.userId, verified: verifyDialogState.setToPilot });
    setVerifyDialogState(prev => ({ ...prev, open: false }));
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogState.userId) return;
    deleteUserMutation.mutate({ userId: deleteDialogState.userId });
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-zinc-950/20 rounded-xl border border-zinc-800">
        <div className="inline-block relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
            <div className="absolute inset-0 rounded-full border-t-2 border-blue-500 animate-spin" />
        </div>
        <p className="mt-4 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500/50">Loading Account Data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="data-heavy-view rounded-xl border border-zinc-800 shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50">
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Email Address</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Full Name</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Role</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Registration Date</th>
                <th className="py-4 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/30">
              {data?.users.map((user) => (
                <tr key={user.id} className="hover:bg-blue-500/5 transition-colors border-b border-zinc-900/50 group">
                  <td className="py-4 px-6">
                    <p className="text-sm font-bold text-foreground font-mono">{user.email}</p>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-sm font-semibold text-zinc-400">
                      {user.firstName} {user.lastName}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider border",
                      user.role === 'ADMIN' ? "bg-purple-500/10 text-purple-500 border-purple-500/20" : 
                      user.role === 'PILOT' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                      "bg-zinc-500/10 text-zinc-500 border-zinc-500/20"
                    )}>
                      {user.role}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <p className="text-[10px] font-mono text-zinc-500">
                      {new Date(user.createdAt).toISOString().split('T')[0]}
                    </p>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleVerifyClick(user.id, `${user.firstName} ${user.lastName}`, user.role !== 'PILOT')}
                        className={cn(
                          "h-8 text-[9px] font-black uppercase tracking-widest border border-zinc-800",
                          user.role === 'PILOT' ? "text-amber-500 hover:bg-amber-500/10" : "text-emerald-500 hover:bg-emerald-500/10"
                        )}
                      >
                         {user.role === 'PILOT' ? 'Revoke Pilot Role' : 'Approve Pilot'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setDeleteDialogState({ open: true, userId: user.id, userName: `${user.firstName} ${user.lastName}` })}
                        className="h-8 w-8 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 border border-zinc-800"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-zinc-900/50 border-t border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest px-2 py-1 bg-zinc-950/50 rounded border border-zinc-800">
              RECORDS: {page * 10 + 1}-{Math.min((page + 1) * 10, (data?.total ?? 0))} of {data?.total}
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
              disabled={page === 0}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-zinc-800 bg-zinc-900/50 hover:bg-blue-600/20 hover:text-blue-500"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={(data?.users?.length ?? 0) < 10}
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-zinc-800 bg-zinc-900/50 hover:bg-blue-600/20 hover:text-blue-500"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <DeleteDialog
        open={deleteDialogState.open}
        onOpenChange={(open) => setDeleteDialogState({ open, userId: null, userName: null })}
        title="Delete User Account"
        description="WARNING: You are about to permanently remove this user from the system. This action will delete all associated flight history, aircraft records, and logbook data. This cannot be reversed."
        itemName={deleteDialogState.userName || undefined}
        isLoading={deleteUserMutation.isPending}
        onConfirm={handleConfirmDelete}
        requireConfirmText="DELETE"
      />

      <DeleteDialog
        open={verifyDialogState.open}
        onOpenChange={(open) => setVerifyDialogState(prev => ({ ...prev, open }))}
        title={verifyDialogState.setToPilot ? "Approve Pilot Verification" : "Revoke Pilot Certification"}
        description={verifyDialogState.setToPilot
          ? "Are you sure you want to approve this pilot? This will grant them full access to flight planning and aircraft records."
          : "Are you sure you want to revoke this pilot's certification? They will lose access to operational features."}
        itemName={verifyDialogState.userName || undefined}
        isLoading={verifyPilotMutation.isPending}
        onConfirm={handleConfirmVerify}
        confirmLabel={verifyDialogState.setToPilot ? "Approve Pilot" : "Revoke Pilot"}
        confirmVariant={verifyDialogState.setToPilot ? "default" : "destructive"}
        titleClassName={verifyDialogState.setToPilot ? "text-emerald-500" : "text-amber-500"}
      />
    </div>
  );
};

export default UserManagementTable;