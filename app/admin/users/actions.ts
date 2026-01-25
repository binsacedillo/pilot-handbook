// app/admin/users/actions.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { syncPrismaRoleToClerk } from '@/lib/clerk-roles';

export async function POST(req: Request) {
  const { userId, newRole } = await req.json();
  const { sessionClaims } = await auth();
  
  if (sessionClaims?.metadata?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  // Update role in database first
  await db.user.update({
    where: { clerkId: userId },
    data: { role: newRole },
  });

  // Sync the new role to Clerk's public metadata
  await syncPrismaRoleToClerk(userId);

  return NextResponse.json({ success: true });
}

