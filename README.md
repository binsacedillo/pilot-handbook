# ✈️ **Pilot Handbook** | ![Next.js 16](https://img.shields.io/badge/Next.js-16-000000) ![React 19](https://img.shields.io/badge/React-19-61DAFB) ![Tailwind 4](https://img.shields.io/badge/Tailwind-4-38B2AC) ![Clerk v6](https://img.shields.io/badge/Clerk-v6-orange)

---

## 🗺️ Roadmap

### ✅ Completed
- **Unified Design System**: Premium "Glass Cockpit" aesthetic using Tailwind 4, glassmorphism (`GlassCard`), and interactive ambient lighting.
- **Security Hardening**: 5-layer defense including `IdleTimeoutManager` with session security (FAA/CAA friendly logic).
- **Admin logic**: Role-based access control (RBAC), user management, and detailed audit logging.
- **Clerk v6 Integration**: Modern authentication with secure metadata synchronization and dual-write patterns.
- **Aircraft Registry**: Full lifecycle management with soft-delete/archive support for historical sequence integrity.
- **Flight Logging**: Advanced logging with real-time reactivity and multi-parameter filtering (URL state-synced).
- **Server-side Validation**: Strict Zod schemas and type-safe tRPC procedures.
- **Weather Integration**: AVWX METAR integration with intelligent caching and fallback logic.
- **Analytics Dashboard**: High-clarity statistics, recency tracking (90-day currency), and flight trends.
- **Test Suite (97 tests)**: Full coverage of critical business logic and security guardrails.
- **Mobile-first Design**: ISO 9241-11 compliant interface, touch-friendly targets, and responsive data tables.

### 🚧 Pending / WIP
- Bulk import/export for flight logs (CSV/Manual)
- Contribution guidelines for community contributors
- Automated deployment scripts for AWS/Azure environments

# 📊 **Current Status:**

**Progress Scores (April 2026 Audit):**
- **Core Logic**: 98% (Soft Delete, client-side tRPC, master caution alerts)
- **UI/UX**: 100% (Premium Pilot-grade HUD, no stale data flashes, high-contrast support)
- **Infrastructure/Perf**: 97% (Neon Serverless Postgres, strict protectedProcedure auth)
- **Security**: 100% (Token-bucket rate limiting, session idle protection, strict Zod)

For a detailed breakdown of completed features, WIPs, and the audit log, please see [PROJECT_STATUS_REPORT.md](./internal-docs/PROJECT_STATUS_REPORT.md).

# 🏢 **Software Architecture**

### Premium Design System ("Glass Cockpit")
The application utilizes a specialized design language inspired by modern avionics (Garmin G3000 style):
- **Atmospheric Lighting**: Context-aware background blurs (`blur-150px`) that adjust based on session state.
- **Glassmorphism**: Backdrop blurs and high-clarity borders via the `GlassCard` design token.
- **High-Impact Typography**: `font-black` headings with specialized tracking for maximum readability in high-stress operational environments.

### Security & Compliance
- **Inactivity Protection**: Automatic session monitoring with the `IdleTimeoutManager`, providing a "Master Caution" alert before automatic logout.
- **FAA/CAA Data Integrity**: Soft-delete architecture ensures all historical flight hours are preserved for logging requirements even if an aircraft or user is archived.

## 🛠️ Tech Stack

**Core**
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Library**: React 19 (Server Components & Actions)
- **API**: tRPC v11 (Full-stack Type Safety)
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma 7
- **Authentication**: Clerk v6
- **Styling**: Tailwind CSS v4

---

## 📂 Project Structure

```bash
├── app/                # Next.js App Router (UI, pages, layouts)
│   ├── (dashboard)/    # Grouped dashboard features (stats, flights, aircraft)
│   ├── admin/          # Protected admin dashboard (RBAC)
│   ├── tools/          # Operational tools (performance, weight/balance)
│   ├── settings/       # User account preferences
│   └── ...             # Auth and public pages
├── components/         # Shared React components
│   ├── common/         # AppHeader, AppFooter, Glows
│   ├── dashboard/      # Status cards and analytics widgets
│   ├── flights/        # Flight log tables and forms
│   └── ui/             # Atomic design tokens (GlassCard, Button)
├── lib/                # Core utilities, DB, and custom hooks
├── prisma/             # Schema and database migrations
├── server/             # tRPC API routers and backend logic
└── ...
```

## 🏁 Getting Started

### Prerequisites
- **Node.js** 20+
- **pnpm** (recommended) or npm
- **Neon/Postgres** connection string

### 1. Clone & Install
```bash
git clone https://github.com/binsacedillo/pilot-handbook.git
cd pilothandbook
pnpm install
```

### 2. Configure Environment
Create a `.env` file:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=***
CLERK_SECRET_KEY=***
DATABASE_URL=postgresql://...
CLERK_WEBHOOK_SECRET=***
UPSTASH_REDIS_REST_URL=***
UPSTASH_REDIS_REST_TOKEN=***
```

### 3. Initialize
```bash
pnpm prisma generate
pnpm prisma db push
pnpm dev
```

---

## 🧪 Testing Suite

The application includes **97 passing tests** covering:
- **Admin Security**: RBAC verification and audit trail integrity.
- **Rate Limiting**: Token-bucket algorithm and IP isolation.
- **Business Logic**: FAA recency rules (Day/Night/IFR) and float precision.
- **Weather Reliability**: Cache hit/miss and API fallback logic.

Run the suite:
```bash
npm run test          # Headless (Vitest)
npm run test:ui       # Interactive Dashboard
npm run test:coverage # Compliance Audit
```

## 🚀 Deployment

Optimized for **Vercel** + **Neon**:
1. Connect via Git for automatic CI/CD.
2. Ensure `CLERK_WEBHOOK_SECRET` is set for user lifecycle sync.
3. Run `npx prisma migrate deploy` in build pipeline for schema synchronization.

---

## ⚖️ License
Private and Proprietary. Built for professional aviators.
ontributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For questions or issues, please open an issue in the repository.
