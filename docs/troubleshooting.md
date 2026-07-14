# 🛠 Troubleshooting Guide

> **Quick Tip:** If you're hitting an error in production, check **Vercel Logs** first. Most issues are caused by missing Environment Variables.

## 📋 Table of Contents
- [Quick Reference Table](#-quick-reference-table)
- [Database & Connection Issues](#-database--connection-issues)
- [Authentication & User Sync (Clerk)](#-authentication--user-sync-clerk)
- [UI & Data Freshness](#-ui--data-freshness)
- [Getting Help](#-getting-help)

---

## ⚡ Quick Reference Table

| Problem | Likely Cause | First Step |
| :--- | :--- | :--- |
| **App won't start** | Missing `DATABASE_URL` | Check Vercel Environment Variables |
| **Migrations fail** | Invalid `DATABASE_URL` | Verify Neon connection string and pooler settings |
| **Users not syncing** | Webhook Secret mismatch | Check Clerk Dashboard -> Webhooks |
| **Admin panel locked** | User role not promoted | Run `npm run make:admin <id>` |
| **Data is stale** | Next.js Caching | Add `export const dynamic = "force-dynamic"` |
| **SSL/TLS Errors** | Missing SSL parameter | Append `?sslmode=verify-full` to DB URL |

---

## 🗄 Database & Connection Issues

<details>
<summary><b>Error: P1000 / Connection Timeout</b></summary>

**Symptoms:** `ECONNREFUSED`, `ETIMEDOUT`, or `Can't reach database`.

**Root Cause:** Vercel cannot reach Neon.
1. **DATABASE_URL**: Used for app runtime, migrations, and prisma config.

**The Fix:**
- Ensure the connection string is set in Vercel.
- In Neon, the connection string usually looks like: `postgresql://user:pass@host/neondb?sslmode=verify-full`.
- If using a pooler connection string, verify the host is correct and SSL is enabled.
</details>

<details>
<summary><b>SSL Certificate Errors</b></summary>

**Symptoms:** `self signed certificate`, `UNABLE_TO_VERIFY_LEAF_SIGNATURE`.

**The Fix:**
1. Append `?sslmode=verify-full` to your connection strings.
2. If using a legacy setup that requires it, ensure `lib/db.ts` has the following (only as a last resort):
   ```typescript
   if (process.env.NODE_ENV === "production") {
     process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
   }
   ```
</details>

---

## 🔐 Authentication & User Sync (Clerk)

<details>
<summary><b>Users sign up but don't appear in Database</b></summary>

**Symptoms:** Clerk shows the user, but the Pilot Handbook DB is empty.

**The Fix:**
1. **Webhook Secret:** Ensure `CLERK_WEBHOOK_SECRET` in Vercel matches the "Signing Secret" in **Clerk Dashboard > Webhooks**.
2. **Endpoint URL:** Verify the Clerk webhook URL is set to `https://your-app.vercel.app/api/webhooks/clerk`.
3. **Events:** Ensure `user.created` and `user.updated` events are selected in Clerk.
</details>

<details>
<summary><b>Admin Access Issues</b></summary>

**Symptoms:** "Access Denied" on admin routes even after promotion.

**The Fix:**
Admin status must exist in **both** Clerk (metadata) and Database (User table).
1. Run the sync script: `npm run make:admin <clerk_user_id>`.
2. Verify in Clerk: Check **User > Metadata > Public Metadata** for `{"role": "admin"}`.
</details>

---

## 🕒 UI & Data Freshness

<details>
<summary><b>Stale Data / Missing Updates</b></summary>

**Symptoms:** Deleted flights still appear; new aircraft don't show up until a hard refresh.

**The Fix:**
Next.js aggressively caches pages. Force dynamic rendering on data-heavy pages:
```typescript
// app/dashboard/page.tsx (or relevant route)
export const dynamic = "force-dynamic";
```
Alternatively, use `revalidateTag` or `revalidatePath` in your tRPC mutations.
</details>

---

## 🆘 Getting Help

1. **Vercel Logs:** Check **Settings > Deployments > [Latest] > Logs**.
2. **Neon Console:** Use the **SQL Editor** to run `SELECT count(*) FROM "User";` to verify DB health.
3. **Clerk Logs:** Check **Dashboard > Logs & Events** to see if webhooks are being sent/received.
4. **Search:** Search the codebase for the error string; often it's a custom error thrown in a middleware or tRPC procedure.

---

**Last Updated:** May 2026
