import type { User as ClerkUser } from "@clerk/nextjs/server";

function listFromEnv(name: string): string[] {
  const raw = process.env[name];
  if (!raw) return [];
  return raw.split(",").map((s) => s.trim()).filter(Boolean);
}

export function isAdminByEnv(params: { clerkId?: string | null; email?: string | null }) {
  const adminIds = listFromEnv("ADMIN_CLERK_IDS");
  const adminEmails = listFromEnv("ADMIN_EMAILS");
  const { clerkId, email } = params;
  return (
    (clerkId && adminIds.includes(clerkId)) ||
    (email && adminEmails.includes(email))
  );
}

export function deriveRoleFromClerkUser(clerk: Partial<ClerkUser> | null | undefined): "ADMIN" | "USER" {
  if (!clerk) return "USER";
  // Prefer metadata-driven role
  const pm = clerk.privateMetadata as Record<string, unknown> ?? {};
  const pub = clerk.publicMetadata as Record<string, unknown> ?? {};
  const metaRole = (pm.role ?? pub.role) as string | undefined;
  if (metaRole === "ADMIN") return "ADMIN";

  // Fallback to env-based allowlists
  const email = clerk.emailAddresses?.[0]?.emailAddress as string | undefined;
  const id = clerk.id as string | undefined;
  return isAdminByEnv({ clerkId: id, email }) ? "ADMIN" : "USER";
}