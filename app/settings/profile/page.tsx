'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { UserButton } from '@clerk/nextjs';
import { trpc } from '@/trpc/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from '@/lib/error-utils';

export default function ProfilePage() {
  const { isLoaded } = useUser();
  const { showToast } = useToast();
  const profileQuery = trpc.user.getProfile.useQuery();
  const updateProfileMutation = trpc.user.updateProfile.useMutation({
    onSuccess: async () => {
      await profileQuery.refetch();
      showToast("Profile updated successfully!", "success");
    },
    onError: (err, variables) => {
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("update profile")
        : getServerErrorMessage("update profile", err);
      showToast(errorMessage, "error", {
        action: {
          label: "Retry",
          onClick: () => updateProfileMutation.mutate(variables),
        },
      });
    },
  });

  // Derive form data from query data instead of syncing with setState
  const formInitialData = {
    firstName: profileQuery.data?.firstName || '',
    lastName: profileQuery.data?.lastName || '',
    license: profileQuery.data?.license || '',
  };

  const [formData, setFormData] = useState(formInitialData);

  const isLoading = !isLoaded || profileQuery.isLoading;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await updateProfileMutation.mutateAsync({
      firstName: formData.firstName || undefined,
      lastName: formData.lastName || undefined,
      license: formData.license || null,
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <div className="mb-8">
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-32 w-full mb-4" />
        <Skeleton className="h-10 w-32" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Profile Settings</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage your personal information and preferences.
        </p>
      </div>

      {/* Avatar Section */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Profile Picture</h2>
        <div className="flex items-center gap-6">
          <div className="shrink-0">
            <UserButton
              appearance={{
                elements: {
                  avatarBox: 'h-24 w-24',
                },
              }}
            />
          </div>
          <div className="flex-1">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Click your profile picture above to upload a new avatar or manage your account settings.
              Avatar management is handled securely by Clerk.
            </p>
          </div>
        </div>
      </Card>

      {/* Profile Form */}
      <Card className="p-6">
        <h2 className="mb-6 text-xl font-semibold text-gray-900 dark:text-white">Personal Information</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* First Name */}
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-gray-700 dark:text-gray-300">
                First Name
              </Label>
              <Input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="John"
                maxLength={100}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>

            {/* Last Name */}
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-gray-700 dark:text-gray-300">
                Last Name
              </Label>
              <Input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Doe"
                maxLength={100}
                className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
              />
            </div>
          </div>

          {/* Email (Read-only) */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              value={profileQuery.data?.email || ''}
              disabled
              className="border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Email is managed by your authentication provider and cannot be changed here.
            </p>
          </div>

          {/* License Number */}
          <div className="space-y-2">
            <Label htmlFor="license" className="text-gray-700 dark:text-gray-300">
              Pilot License Number
            </Label>
            <Input
              id="license"
              name="license"
              type="text"
              value={formData.license}
              onChange={handleChange}
              placeholder="e.g., 12345678"
              maxLength={50}
              className="border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Your pilot license number for record keeping.
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (profileQuery.data) {
                  setFormData({
                    firstName: profileQuery.data.firstName || '',
                    lastName: profileQuery.data.lastName || '',
                    license: profileQuery.data.license || '',
                  });
                }
              }}
              disabled={updateProfileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateProfileMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
            >
              {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Card>

      {/* Additional Info */}
      <Card className="p-6">
        <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">Account Information</h2>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Account Created</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {profileQuery.data?.createdAt
                ? new Date(profileQuery.data.createdAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between border-b border-gray-200 pb-3 dark:border-gray-700">
            <span className="text-gray-600 dark:text-gray-400">Last Updated</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {profileQuery.data?.updatedAt
                ? new Date(profileQuery.data.updatedAt).toLocaleDateString()
                : 'N/A'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">Account Role</span>
            <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
              {profileQuery.data?.role || 'USER'}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
