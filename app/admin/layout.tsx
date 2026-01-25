// AdminLayout: Enforces Principle of Least Privilege for admin routes
// 1. Security: Only authenticated users with 'ADMIN' role in the database can access admin pages
// 2. UX: Unauthorized users are redirected away, preventing confusion and exposure of admin UI
// 3. Never trust client-side metadata alone; always verify with the database
// 4. Logs unauthorized access attempts for auditing

// Next.js redirect utility
import { redirect } from "next/navigation";
// Clerk: Get current authenticated user
import { currentUser } from "@clerk/nextjs/server";
// Database client
import { db } from "@/lib/db";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // 1. Get the current authenticated user from Clerk
  const user = await currentUser();

  // If not signed in, redirect to sign-in page
  if (!user) {
    redirect("/sign-in");
  }

  // 2. Check the user's role in the database (server-side authority)
  // This prevents privilege escalation via client-side metadata
  const dbUser = await db.user.findUnique({
    where: { clerkId: user.id },
    select: { role: true },
  });

  // 3. If not an admin, log the attempt and redirect to dashboard
  if (!dbUser || dbUser.role !== "ADMIN") {
    const email = user.emailAddresses?.[0]?.emailAddress || "unknown";
    // Log unauthorized access attempt for monitoring
    console.warn(`Unauthorized admin access attempt by: ${email}`);
    // Redirect non-admins to dashboard (hide admin UI)
    redirect("/dashboard");
  }

  // 4. Render admin children for authorized users only
  return <>{children}</>;
}
