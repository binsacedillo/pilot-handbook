// app/admin/users/actions.ts
'use server';

import { auth, clerkClient } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { userId, newRole } = await req.json();
  const { sessionClaims } = await auth();
  if (sessionClaims?.metadata?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }
  const client = await clerkClient();
  await client.users.updateUserMetadata(userId, {
    publicMetadata: { role: newRole },
  });
  return NextResponse.json({ success: true });
}
