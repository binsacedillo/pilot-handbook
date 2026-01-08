// app/admin/layout.tsx

import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get Clerk User
  const user = await currentUser();
  
  if (!user) {
    redirect("/sign-in");
  }

  // 2. FORCE a Database Check (The "Real" Truth)
  // Do not trust user.publicMetadata.role alone!
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true },
  });

  // 3. Strict Redirect
  if (!dbUser || dbUser.role !== "ADMIN") {
    const email = user.emailAddresses?.[0]?.emailAddress || "unknown";
    console.warn(`Unauthorized admin access attempt by: ${email}`);
    redirect("/dashboard");
  }

  return <>{children}</>;
}
