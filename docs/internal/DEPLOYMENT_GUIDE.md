# 🚀 Deployment Guide (10-Minute Quick Start)

Deploy your Pilot Handbook app to Vercel in about 10 minutes.

---

## Phase 1: Preparation (Do This Now)

### 1️⃣ Push Latest Code to GitHub

Make sure your latest code is committed and pushed:

```bash
git add .
git commit -m "Pre-deployment: ready for production"
git push origin main
```

**Include:** The db.ts fix and all schema changes.

---

### 2️⃣ Gather Your Environment Variables

Open your local `.env.local` file and have these ready to copy-paste into Vercel:

**Required for App Runtime:**
```
DATABASE_URL=postgresql://[user]:[password]@[host]:6543/[db]?schema=public
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_WEBHOOK_SECRET=whsec_...
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
NODE_ENV=production
```

**Required for Migrations (Vercel Build Step):**
```
DIRECT_URL=postgresql://[user]:[password]@[host]:5432/[db]?schema=public
```

**Quick tip:** Find these in:
- Supabase dashboard → Connection strings (DATABASE_URL uses pooler port 6543)
- Clerk dashboard → API Keys (for CLERK_* vars)
- Your local `.env.local` file (copy the exact values)

---

## Phase 2: Deploy to Vercel

### Step 1: Connect Your GitHub Repo
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New..."** → **"Project"**
3. Search for your GitHub repo (`pilothandbook`)
4. Click **"Import"**

### Step 2: Configure Environment Variables
1. In the "Environment Variables" section, add each variable:
   - **Name:** (e.g., `DATABASE_URL`)
   - **Value:** (paste from your `.env.local`)
   - Click **"Add"**

**Critical:** Add **ALL 7 variables** above, including `DIRECT_URL` for migrations.

### Step 3: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (~2-3 minutes)
3. Get your live URL: `https://your-app-name.vercel.app`

---

## Phase 3: Post-Deployment Verification

### ✅ Step 1: Test App Loads
Visit your deployed URL. You should see:
- Landing page loads ✓
- Sign-in/Sign-up buttons appear ✓
- No 500 errors in console

### ✅ Step 2: Configure Clerk Webhook
Clerk needs to notify your app when users are created:

1. Go to **Clerk Dashboard** → **Webhooks**
2. Click **"Create Endpoint"**
3. URL: `https://your-app-name.vercel.app/api/webhooks/clerk`
4. Events: Check `user.created` and `user.updated`
5. Copy the signing secret and add to Vercel env vars as `CLERK_WEBHOOK_SECRET`
6. Redeploy or manually trigger: Settings → Redeploy

### ✅ Step 3: Test User Creation
1. Sign up a new user at `https://your-app-name.vercel.app/sign-up`
2. Complete email verification
3. You should be redirected to `/dashboard`
4. Check database: new user appears in `public."User"` table

### ✅ Step 4: Set Up Admin Users (Optional)
If you need admin users:

```bash
npm run make:admin <clerkUserId>
```

This promotes a user to admin role in both Clerk and the database.

---

## 🖐 Troubleshooting

### ❌ Build Failed - "DIRECT_URL not found"
**Cause:** Missing `DIRECT_URL` environment variable
**Fix:** 
1. Go to Vercel → Settings → Environment Variables
2. Add `DIRECT_URL` with your direct connection string (port 5432)
3. Redeploy

### ❌ App Crashes at Runtime - "Database Connection Error"
**Cause:** DATABASE_URL wrong or connection pool exhausted
**Fix:**
1. Verify `DATABASE_URL` uses **port 6543** (pgBouncer)
2. Check Supabase is running and accessible
3. Check Vercel logs: `vercel logs` or dashboard → Deployments → Logs

### ❌ Sign-Up Not Working - Webhook Error
**Cause:** `CLERK_WEBHOOK_SECRET` missing or wrong
**Fix:**
1. Go to Clerk → Webhooks → Find your endpoint
2. Copy the signing secret
3. Add to Vercel as `CLERK_WEBHOOK_SECRET`
4. Redeploy

### ❌ "User creation blocked" but sign-up completes
**Cause:** Webhook endpoint not configured or unreachable
**Fix:**
1. In Clerk dashboard, test the webhook endpoint
2. You should see a 200 response with `{ "success": true }`
3. If it fails, check Vercel URL is accessible from internet
4. Verify your endpoint is `https://your-app.vercel.app/api/webhooks/clerk`

### ❌ TypeScript Errors During Build
**Cause:** Type mismatch in schema or code
**Fix:**
1. Run locally: `npm run typecheck`
2. Fix errors
3. Push to GitHub
4. Redeploy from Vercel

---

## 📋 Pre-Deployment Checklist

- [ ] Latest code pushed to GitHub
- [ ] All 7 environment variables gathered
- [ ] `DATABASE_URL` uses port **6543** (pooler)
- [ ] `DIRECT_URL` uses port **5432** (direct, migrations only)
- [ ] `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` from Clerk dashboard
- [ ] No `npm run build` errors locally
- [ ] No `npm run typecheck` errors locally

---

## 📋 Deployment Checklist

- [ ] GitHub repo imported to Vercel
- [ ] All 7 env vars added in Vercel dashboard
- [ ] Build succeeded (check Vercel logs)
- [ ] App loads at live URL
- [ ] Clerk webhook endpoint configured
- [ ] Test user creation flow works
- [ ] User appears in database

---

## 🎯 What Happens During Deploy

1. **Vercel builds your app:**
   - Runs `npm install`
   - Runs `prisma generate` (uses DIRECT_URL)
   - Runs `npm run build`
   - Creates optimized Next.js bundle

2. **Vercel runs migrations (if enabled):**
   - Uses DIRECT_URL for schema changes
   - Creates tables, indexes, etc.

3. **App starts on Vercel's servers:**
   - Uses DATABASE_URL for runtime connections
   - Scales connection pool based on traffic
   - Clerk auth ready to go

4. **User flow:**
   - User signs up → Clerk webhook fires → Your API creates database user

---

## 🔗 Quick Links

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Supabase Dashboard:** https://supabase.com/dashboard
- **Your App:** `https://your-app-name.vercel.app`

---

## 💡 Pro Tips

- **Test locally first:** Run `npm run build` locally before deploying
- **Monitor errors:** Set up error tracking (Sentry, LogRocket) in production
- **Gradual rollout:** Test with 5% of traffic before full deployment
- **Keep backups:** Always have database backups before major changes

---

## 📞 Still Stuck?

Check [BUILD_DEPLOYMENT_ANALYSIS.md](BUILD_DEPLOYMENT_ANALYSIS.md) for deep technical details on:
- Connection pooling architecture
- Database dual-connection strategy
- Webhook synchronization issues
- Admin role management

