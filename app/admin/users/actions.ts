// app/admin/users/actions.ts
'use server';
import { auth, clerkClient } from '@clerk/nextjs/server';

export async function updateUserRole(userId: string, newRole: string) {
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'ADMIN') {
    throw new Error('Unauthorized');
  }

  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: newRole },
  });
}
