
import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function ProfilePage() {
  const profileQuery = trpc.user.getProfile.useQuery();
  const updateProfile = trpc.user.updateProfile.useMutation();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    license: '',
  });
  const [message, setMessage] = useState<string | null>(null);

  React.useEffect(() => {
    if (profileQuery.data) {
      setForm({
        firstName: profileQuery.data.firstName || '',
        lastName: profileQuery.data.lastName || '',
        license: profileQuery.data.license || '',
      });
    }
  }, [profileQuery.data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateProfile.mutateAsync(form);
      setMessage('Profile updated!');
    } catch {
      setMessage('Update failed.');
    }
  };

  if (profileQuery.isLoading) return <div>Loading...</div>;

  return (
    <Card className="max-w-md mx-auto mt-10 p-6">
      <h2 className="text-xl font-bold mb-4">Profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">First Name</label>
          <Input name="firstName" value={form.firstName} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1">Last Name</label>
          <Input name="lastName" value={form.lastName} onChange={handleChange} />
        </div>
        <div>
          <label className="block mb-1">License Number</label>
          <Input name="license" value={form.license} onChange={handleChange} />
        </div>
        <Button type="submit" disabled={updateProfile.isPending}>Update</Button>
        {message && <div className="mt-2 text-sm">{message}</div>}
      </form>
    </Card>
  );
}
