'use client';

import { trpc } from '@/trpc/client';
import AppHeader from '@/components/AppHeader';
import AppFooter from '@/components/AppFooter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle } from 'lucide-react';

export default function VerificationsPage() {
  const utils = trpc.useUtils();
  const { data: users, isLoading } = trpc.admin.getAllUsers.useQuery({
    skip: 0,
    take: 100, // Get all users for verification view
  });

  // TODO: Add loading state for mutation and disable button while pending
  const verifyPilotMutation = trpc.admin.verifyPilot.useMutation({
    onMutate: async ({ userId, verified }) => {
      // Optimistically update the cache
      await utils.admin.getAllUsers.cancel();
      const previousData = utils.admin.getAllUsers.getData({ skip: 0, take: 100 });
      if (previousData) {
        utils.admin.getAllUsers.setData(
          { skip: 0, take: 100 },
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
        utils.admin.getAllUsers.setData({ skip: 0, take: 100 }, context.previousData);
      }
      // FIXME: Use toast notification instead of alert for error feedback
      alert(`Failed to update user: ${err.message}`);
    },
    onSettled: async () => {
      await utils.admin.getAllUsers.invalidate();
      await utils.admin.getStats.invalidate();
    },
  });

  const handleVerify = (userId: string, verified: boolean) => {
    verifyPilotMutation.mutate({ userId, verified });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <AppFooter />
      </div>
    );
  }

  // Separate users by verification status (role)
  const unverifiedUsers = users?.users.filter(u => u.role === 'USER') ?? [];
  const verifiedPilots = users?.users.filter(u => u.role === 'PILOT') ?? [];
  const admins = users?.users.filter(u => u.role === 'ADMIN') ?? [];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <AppHeader />
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-foreground mb-2">Pilot Verifications</h1>
            <p className="text-muted-foreground">Review and verify pilot accounts</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Pending</p>
                <div className="h-3 w-3 bg-yellow-500 rounded-full" />
              </div>
              <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{unverifiedUsers.length}</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Verified</p>
                <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">{verifiedPilots.length}</p>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm uppercase tracking-wide text-muted-foreground">Admins</p>
                <div className="h-5 w-5 rounded bg-purple-600 dark:bg-purple-400 flex items-center justify-center text-white text-xs font-bold">A</div>
              </div>
              <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{admins.length}</p>
            </Card>
          </div>

          {/* Pending Verifications */}
          {unverifiedUsers.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Pending Verifications</h2>
              <div className="space-y-3">
                {unverifiedUsers.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                            <span className="text-lg font-semibold text-muted-foreground">
                              {user.firstName?.[0] || user.email?.[0]?.toUpperCase() || '?'}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
                          Pending
                        </span>
                        <Button
                          size="sm"
                          onClick={() => handleVerify(user.id, true)}
                          disabled={verifyPilotMutation.isPending}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Verify as Pilot
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {unverifiedUsers.length === 0 && (
            <Card className="p-8 mb-8">
              <div className="text-center text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p className="text-lg font-medium">No pending verifications</p>
                <p className="text-sm">All users have been verified</p>
              </div>
            </Card>
          )}

          {/* Verified Pilots */}
          {verifiedPilots.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-foreground mb-4">Verified Pilots</h2>
              <div className="space-y-3">
                {verifiedPilots.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                            <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">
                              {user.firstName} {user.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                          Verified
                        </span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleVerify(user.id, false)}
                          disabled={verifyPilotMutation.isPending}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          Revoke
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <AppFooter />
    </div>
  );
}
