# 🚀 Deployment Guide (Neon + Vercel)

Deploy your Pilot Handbook app to Vercel with Neon Database in about 10 minutes.

---

## Phase 1: Preparation

### 1️⃣ Push Latest Code to GitHub
Ensure all recent refactors (ISO Navigation, root directory structure) are committed:

```bash
git add .
git commit -m "refactor(core): prepare for Neon deployment"
git push origin main
```

### 2️⃣ Gather Your Environment Variables
Open your **Neon Console** and **Clerk Dashboard** to gather these keys:

**Required for App & Database:**
```bash
DATABASE_URL=postgresql://[user]:[password]@[host]/neondb?sslmode=require
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NODE_ENV=production
```

**Quick tip:** Neon provides a single connection string that works for both migrations and runtime.

---

## Phase 2: Deploy to Vercel

### Step 1: Connect Your GitHub Repo
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Import your `pilothandbook` repository.

### Step 2: Configure Environment Variables
1. Add each variable gathered in Phase 1 to the Vercel dashboard.
2. **Critical:** Ensure `DATABASE_URL` includes `?sslmode=require`.

### Step 3: Deploy
1. Click **"Deploy"**.
2. Wait for the build and Prisma generation to complete (~2 minutes).
3. Get your live URL: `https://your-app.vercel.app`

---

## Phase 3: Post-Deployment Verification

### ✅ Step 1: Configure Clerk Webhook
1. Go to **Clerk Dashboard** → **Webhooks**.
2. URL: `https://your-app.vercel.app/api/webhooks/clerk`
3. Events: `user.created`, `user.updated`.
4. Copy the secret back to Vercel as `CLERK_WEBHOOK_SECRET`.

### ✅ Step 2: Test User Sync
1. Sign up at your live URL.
2. Verify you are redirected to `/dashboard`.
3. Check **Neon SQL Editor**: `SELECT count(*) FROM "User";` (Should be 1+).

### ✅ Step 3: Setup Admin
If you need to access the Admin Panel:
```bash
# Run this from your local machine (connected to production DB)
npm run make:admin <clerkUserId>
```

---

## 🖐 Troubleshooting

### ❌ Build Failed - Prisma Generation
**Cause:** `DATABASE_URL` missing during build step.
**Fix:** Ensure the variable is added in Vercel **Settings > Environment Variables.**

### ❌ Connection Timeout
**Cause:** Database is "sleeping" (Neon Free Tier).
**Fix:** Visit the app again; Neon will wake up automatically within 2 seconds.

### ❌ Webhook Error (401/500)
**Cause:** `CLERK_WEBHOOK_SECRET` mismatch.
**Fix:** Synchronize the secret between Clerk Webhook settings and Vercel.

---

## 📋 Checklist
- [x] Code is in root structure (no `src` folder).
- [x] `DATABASE_URL` points to Neon (Port 5432).
- [x] `AppHeader` logo points to Dashboard for pilots.
- [x] Clerk Webhooks are live.

**Last Updated:** April 2026
**Status:** Active - Optimized for Neon + Next.js 16
