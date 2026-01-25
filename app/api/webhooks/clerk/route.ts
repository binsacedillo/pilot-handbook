import { Webhook } from "svix";
import { headers } from "next/headers";
import { syncClerkUserToPrisma, syncPrismaRoleToClerk } from "@/lib/clerk-roles";
import { db } from "@/lib/db";

/**
 * Clerk Webhook Handler
 * 
 * This endpoint syncs user data from Clerk to Prisma whenever a user is created or updated.
 * 
 * Setup Instructions:
 * 1. Go to Clerk Dashboard → Webhooks
 * 2. Create new endpoint pointing to: https://yourdomain.com/api/webhooks/clerk
 * 3. Subscribe to events: user.created, user.updated, user.deleted
 * 4. Copy the signing secret and add to .env.local as CLERK_WEBHOOK_SECRET
 */

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("CLERK_WEBHOOK_SECRET is not configured");
    return new Response("Webhook secret not configured", { status: 500 });
  }

  // Get headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error: Missing Svix headers", {
      status: 400,
    });
  }

  // Get body
  const body = await req.text();

  // Create new Svix instance with secret
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt;
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error verifying webhook", {
      status: 400,
    });
  }

  // Handle the webhook
  try {
    if (evt.type === "user.created" || evt.type === "user.updated") {
      const data = evt.data;
      // Sync from Clerk to database
      await syncClerkUserToPrisma(data.id, {
        email_addresses: data.email_addresses,
        first_name: data.first_name,
        last_name: data.last_name,
        public_metadata: data.public_metadata,
      });
      // Then sync database role back to Clerk metadata
      await syncPrismaRoleToClerk(data.id);
    } else if (evt.type === "user.deleted") {
      const clerkId = evt.data.id;
      // Use deleteMany to avoid throwing if the user doesn't exist
      await db.user.deleteMany({ where: { clerkId } });
    }

    return new Response("Webhook processed", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response("Error processing webhook", { status: 500 });
  }
}

interface ClerkWebhookEvent {
  type: "user.created" | "user.updated" | string;
  data: {
    id: string;
    email_addresses?: Array<{ email_address: string }>;
    first_name?: string;
    last_name?: string;
    public_metadata?: Record<string, unknown>;
  };
}
