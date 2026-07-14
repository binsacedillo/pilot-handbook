# 🛠 SaaS Maintenance & Operational Playbook

> **Purpose:** This document outlines the recurring tasks, emergency procedures, and administrative workflows required to keep the Pilot Handbook SaaS running reliably in production.

---

## 🚨 1. Emergency Response (The "Fire" Drill)

If the site is down or throwing 500 errors, follow these steps in order:

### Phase A: Identify the Source
1. **Check Vercel Status:** [vercel-status.com](https://www.vercel-status.com/) (Is the hosting down?)
2. **Check Neon Status:** [status.neon.tech](https://status.neon.tech/) (Is the database down?)
3. **Check Clerk Status:** [status.clerk.com](https://status.clerk.com/) (Is authentication down?)
4. **Inspect Vercel Logs:** Go to **Vercel Dashboard > Project > Logs**. Look for "Runtime Errors" or "Deployment Failures."

### Phase B: Common Emergency Fixes
* **Database Connection Limit:** If Neon is throwing "Too many connections," ensure the connection string in Vercel uses the pooled port (usually `5432` with Neon's built-in pooling or check `troubleshooting.md`).
* **Environment Variable Mismatch:** If a new feature works locally but fails in prod, verify the `.env` variables match between local and Vercel.
* **Clerk Webhook Delay:** If users sign up but don't appear in the dashboard, check the **Clerk Dashboard > Webhooks > Retries** to see if the webhook is failing.

---

## 🗄 2. Database Operations (Neon + Prisma)

### Backup & Restore
Neon performs automatic backups (Point-in-Time Recovery).
* **To Restore:** Go to the Neon Console, select your Branch, and use the "Restore" feature to create a new branch from a specific timestamp.
* **Manual Snapshot:** Before running a risky migration, create a manual branch in Neon as a safety snapshot.

### Safe Production Migrations
1. **Test Locally:** Always run `npx prisma migrate dev` on your local machine first.
2. **Review SQL:** Check the generated SQL file in `prisma/migrations` to ensure it doesn't drop critical columns.
3. **Deploy:** Run `npx prisma migrate deploy` against production from a trusted environment after verifying the target database state. **NEVER** use `migrate reset` in production.

---

## 👤 3. User & Admin Management

### Promoting a User to Admin
To give a user access to internal tools or administrative views:
```bash
# Run locally (connected to Production DB)
npm run make:admin <clerk_user_id>
```
*Verification:* Check the user's `public_metadata` in the Clerk Dashboard; it should have `role: "admin"`.

### Handling Data Deletion Requests (GDPR/Compliance)
If a user requests their account be deleted:
1. Delete the user from the **Clerk Dashboard**.
2. The webhook *should* handle the database cleanup, but verify by running:
   ```sql
   DELETE FROM "User" WHERE email = 'user@example.com';
   ```
   *(Prisma's `onDelete: Cascade` should handle related flights/aircraft).*

---

## 📈 4. Operational Health Checks

### Monthly Tasks
- [ ] **Check Neon Storage:** Ensure the DB isn't approaching its free-tier limit.
- [ ] **Review Error Logs:** Scan Vercel logs for recurring warnings that don't crash the site but indicate "silent" bugs.
- [ ] **Audit Admin Actions:** If multiple people have admin access, review recent changes to aircraft/decision logic.

### Quarterly Tasks
- [ ] **Update Dependencies:** Run `npm outdated` and update core packages (`next`, `@clerk/nextjs`, `prisma`).
- [ ] **Rotate Secrets:** Consider rotating the `CLERK_SECRET_KEY` and `DATABASE_URL` every 6-12 months for security.
- [ ] **Database Optimization:** Run `EXPLAIN ANALYZE` on slow queries (if any) in the Neon SQL Editor.

---

## 📞 5. Support & Feedback Loop

### Bug Reporting
All bugs reported by pilots should be logged in [Issue Tracker/GitHub]. Include:
* User ID
* Aircraft ID (if applicable)
* The specific POH value they entered vs the expected result.

### Critical Logic Errors
If a pilot reports a calculation error in the **Decision Engine**:
1. Duplicate the inputs in a local development environment.
2. Run the `vitest` suite to see if any tests fail.
3. Update `lib/decision/engine.ts` and add a new regression test in `server/routers/__tests__/` or `lib/__tests__/`.

---

**Last Updated:** May 2026
**Owner:** [Your Name/Role]
