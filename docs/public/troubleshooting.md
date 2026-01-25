# Troubleshooting Guide

> **Purpose:** This document captures real errors encountered during development and deployment, plus the exact solutions that fixed them. If you see one of these errors, you're not alone—and the fix is right here.

**Last Updated:** January 2026  
**Relevant To:** Supabase + Vercel + Clerk integration

---

## SSL Certificate Error - Self-Signed Certificate in Certificate Chain

### Error Message
```
Error: self signed certificate
Error: certificate verify failed
UNABLE_TO_VERIFY_LEAF_SIGNATURE
node:internal/tls:1
```

### When It Happens
- Deploying to Vercel
- Connecting to Supabase database via pgBouncer (port 6543)
- Building/running migrations on a remote server

### Root Cause
Supabase's pgBouncer connection pooler uses self-signed SSL certificates internally for security and performance. Node.js rejects these by default, causing connection failures.

### The Fix

**File:** [lib/db.ts](lib/db.ts)

Add this at the top of your database initialization:

```typescript
// Accept self-signed certificates from Supabase Pooler in production
if (process.env.NODE_ENV === "production") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}
```

**Why it works:**
- Sets Node.js to trust self-signed certificates in production
- Only applies to production to maintain security in development
- Must be set **before** Prisma client creation

### Verification
```bash
# Test locally
DATABASE_URL="your-pooler-url" node -e "require('./lib/db.ts')"

# After deploying to Vercel, check logs
# Should show successful connection, no SSL errors
```

---

## Database Connection Errors in Vercel Deployment

### Error Message
```
Error connecting to database: ECONNREFUSED
Error: connect ETIMEDOUT
Error: connect ENOTFOUND
```

### When It Happens
- Vercel deployment starts but app can't reach database
- Migrations fail during build step
- Serverless functions timeout waiting for database

### Root Cause
Vercel environment variables aren't properly configured. You need **two different connection strings**:

| Variable | Purpose | Port | When Used |
|----------|---------|------|-----------|
| `DATABASE_URL` | Application runtime | 6543 (pgBouncer) | Every API call |
| `DIRECT_URL` | Migrations & schema | 5432 (direct) | Build step only |

### The Fix

**In Vercel Dashboard:**

1. Go to **Settings** → **Environment Variables**
2. Add these variables:

```
DATABASE_URL = postgresql://user:password@host.supabase.co:6543/postgres?schema=public&pgbouncer=true
DIRECT_URL = postgresql://user:password@host.supabase.co:5432/postgres?schema=public
NODE_ENV = production
```

**In [prisma.config.ts](../prisma.config.ts) (✅ NOW CONFIGURED):**
```typescript
export default defineConfig({
  schema: 'prisma/schema.prisma',
  datasource: {
    // Prisma CLI uses DIRECT_URL for migrations (port 5432)
    // Application uses DATABASE_URL for queries (port 6543)
    url: env('DIRECT_URL') || env('DATABASE_URL'),
  },
})
```

**Why it works (Prisma 7 approach):**
- Prisma CLI commands (migrate, generate) use `DIRECT_URL` (port 5432 - direct)
- Application runtime queries use `DATABASE_URL` (port 6543 - pgBouncer) via lib/db.ts
- `DATABASE_URL` uses pgBouncer for connection pooling in serverless
- `DIRECT_URL` uses direct connection for schema operations
- No manual port overrides needed anymore!

**Port Usage Summary:**

| Port | Service | Used By | Purpose |
|------|---------|---------|---------|
| **6543** | pgBouncer Pooler | Application runtime (DATABASE_URL) | Connection pooling for serverless |
| **5432** | Direct PostgreSQL | Prisma CLI (DIRECT_URL) | Migrations & schema operations |

### Verification
1. Check Vercel logs during deployment
2. Look for: `"Migrations executed"` (no errors)
3. Visit deployed app → should load dashboard or sign-in page
4. Check Supabase dashboard → connection count should be low (<5)

**Test Prisma migrations locally:**
```bash
# Check migration status (should use port 5432)
npx prisma migrate status

# Generate Prisma client
npx prisma generate

# Run a migration (if needed)
npx prisma migrate dev --name test_migration

# All commands should work without manual DATABASE_URL overrides
```

---

## Clerk Webhook Not Syncing Users

### Error Message
```
Webhook secret not configured
Failed to verify webhook signature
User not found in database after sign-up
```

### When It Happens
- User signs up successfully at sign-in page
- User is created in Clerk but **not** in your database
- Admin dashboard shows empty user list even though users signed up

### Root Cause
Clerk webhook endpoint isn't configured or `CLERK_WEBHOOK_SECRET` is missing from environment variables.

When a user signs up:
1. Clerk creates user account ✅
2. Clerk sends webhook to your app (`/api/webhooks/clerk`) 📨
3. Your app creates user record in Supabase 🗂️
4. **WITHOUT the webhook secret, step 3 never happens** ❌

### The Fix

**Step 1: Get Webhook Secret from Clerk**
1. Go to **Clerk Dashboard** → **Webhooks**
2. Click **Create Endpoint**
3. Enter: `https://your-app.vercel.app/api/webhooks/clerk`
4. Select events: `user.created`, `user.updated`
5. Copy the **Signing Secret**

**Step 2: Add to Vercel Environment**
1. Go to Vercel → **Settings** → **Environment Variables**
2. Add: `CLERK_WEBHOOK_SECRET = whsec_xxxxxxxxxx` (from step 1)
3. Redeploy your app

**Step 3: Verify**
```bash
# Check that webhook secret exists
echo $CLERK_WEBHOOK_SECRET

# Test: sign up a new user at your app
# Go to Supabase → public.User table
# Should see new user row within 5 seconds
```

**File Reference:** [app/api/webhooks/clerk/route.ts](app/api/webhooks/clerk/route.ts)

---

## Migrations Fail During Vercel Build

### Error Message
```
Error: P1000 Authentication failed
Error: DIRECT_URL not set
Can't reach database
```

### When It Happens
- Pushing code to GitHub and Vercel auto-deploys
- Build step fails even though local `npm run build` works
- You see "Migrations executed" but then build fails

### Root Cause
Vercel's build step runs `prisma migrate deploy` which needs `DIRECT_URL` to execute schema changes. If it's missing, migrations are skipped or fail silently.

### The Fix

**Ensure Both URLs Are Set:**

```bash
# In Vercel environment variables:
DATABASE_URL = postgresql://pooler...    # port 6543
DIRECT_URL = postgresql://direct...      # port 5432
```

**Ensure Prisma Config Routes to DIRECT_URL (✅ ALREADY CONFIGURED):**

File: [prisma.config.ts](../prisma.config.ts)
```typescript
export default defineConfig({
  datasource: {
    url: env('DIRECT_URL') || env('DATABASE_URL'),  // Migrations use port 5432
  },
})
```

**Note:** Prisma 7 uses `prisma.config.ts` instead of `url`/`directUrl` in schema.prisma.

**Skip Migrations if DIRECT_URL is Missing (Optional Safety):**

File: `vercel.build-output.js` or your build script:
```bash
# In package.json scripts
"build": "prisma generate && prisma migrate deploy && next build"
```

### Verification
1. Check Vercel deployment logs
2. Look for: `"Migrations executed successfully"` ✅
3. If you see: `"Migrations skipped"` → DIRECT_URL is missing

---

## Admin Role Issues

### Error Message
```
User can't access admin panel after promotion
Admin status is inconsistent
```

### When It Happens
- You manually promote a user to admin
- User still can't access admin panel
- Admin status is inconsistent between Clerk and database

### Root Cause
Admin role data lives in **two places**:
1. **Clerk:** `public_metadata.role = "admin"`
2. **Supabase:** `User.role = "admin"`

They must stay in sync. If one updates without the other, inconsistency happens.

### The Fix

**Step 1: Run the Sync Script**
```bash
npm run make:admin
```

File: [lib/clerk-admin-tools.ts](lib/clerk-admin-tools.ts)

**Step 2: Verify in Database**
```sql
-- Check admin users
SELECT id, email, role FROM public."User" WHERE role = 'admin';
```

**Step 3: Verify in Clerk**
1. Go to **Clerk Dashboard** → **Users**
2. Find the user
3. Check **Settings** → **Metadata** → **public_metadata**
4. Should show: `{ "role": "admin" }`

### Prevention
- Always use the sync script when promoting users
- Don't manually edit Clerk metadata without syncing database
- Webhook (`/api/webhooks/clerk`) automatically syncs on user.updated events

---

## Force Dynamic Not Refreshing Flight Hours

### Error Message
```
Flight hours showing stale data
Old flight still appears after deletion
New flights don't show in real-time
```

### When It Happens
- App is cached or using static generation
- Flight data updates in database but doesn't appear in UI
- Reloading page shows old data

### Root Cause
Next.js defaults to static generation (caching). For real-time data like flight hours, we need dynamic rendering.

### The Fix

**File:** [app/dashboard/page.tsx](app/dashboard/page.tsx)

Add at the top:
```typescript
export const dynamic = "force-dynamic";
```

**Why it works:**
- `force-dynamic` tells Next.js to never cache this page
- Every request re-fetches data from database
- Ensures flight hours are always current

### Alternative: On-Demand Revalidation
If you want caching but refresh on-demand:

```typescript
export const revalidate = 60; // Cache for 60 seconds

// Trigger refresh after database change
revalidateTag("flights");
```

---

## Port 6543 vs 5432 Confusion

### The Question
> *"Why do I need two Supabase connection strings with different ports?"*

### The Answer

| Port | Service | Use Case | Connection Pooling |
|------|---------|----------|-------------------|
| **6543** | pgBouncer (Pooler) | Application runtime | ✅ Yes (built-in) |
| **5432** | PostgreSQL Direct | Migrations & Admin | ❌ No (direct) |

**In Vercel/Serverless:**
- Each Lambda function is short-lived (seconds)
- Opening a direct connection to port 5432 wastes database connections
- pgBouncer (port 6543) multiplexes 1,000s of client connections into dozens of server connections

**For Schema Migrations:**
- Prisma needs a direct connection to acquire locks
- pgBouncer doesn't support advisory locks (needed for migration safety)
- Migration must use port 5432 (DIRECT_URL)

**Environment Variables:**
```
DATABASE_URL = pooler (port 6543)   → Used by app at runtime
DIRECT_URL   = direct (port 5432)   → Used by Prisma migrations
```

---

## Quick Reference: What to Check First

If something is broken, check in this order:

| Problem | Check First |
|---------|-------------|
| App won't start | `DATABASE_URL` is set? |
| Migrations fail | `DIRECT_URL` is set? |
| Users not syncing | `CLERK_WEBHOOK_SECRET` is set? |
| Admin can't access panel | Use `npm run make:admin <clerkUserId>` to promote user |
| Data is stale | Page has `export const dynamic = "force-dynamic"`? |
| SSL certificate error | Check [lib/db.ts](lib/db.ts) has NODE_TLS_REJECT_UNAUTHORIZED fix |

---

## Getting Help

If you see an error not listed here:

1. **Check Vercel logs:** Settings → Deployments → [latest] → Logs
2. **Check database:** Supabase Dashboard → SQL Editor → Run a test query
3. **Check Clerk:** Clerk Dashboard → Logs & Events
4. **Search this file** for keywords from your error message
5. **Ask in code review:** Paste error + logs + what you changed

---

## Contributing to This Guide

Found a new error? Fixed something not listed here?

**Add it to this file:**
1. Use the same format as above sections
2. Include: Error message, when it happens, root cause, fix
3. Add a verification step
4. Commit with message: `docs: troubleshooting - add [error type]`
