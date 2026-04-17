# ✈️ **Pilot Handbook** | ![Next.js 16](https://img.shields.io/badge/Next.js-16-000000) ![React 19](https://img.shields.io/badge/React-19-61DAFB) ![Tailwind 4](https://img.shields.io/badge/Tailwind-4-38B2AC) ![Clerk v6](https://img.shields.io/badge/Clerk-v6-orange)

> **Professional-Grade Electronic Flight Bag (EFB) for Civilian Aviation.**

---

## 🗺️ Operational Roadmap

### ✅ Completed (Civilian Hardened)
- **Instrument-Grade UI (IGO)**: High-fidelity, zero-distraction operational environment using Tailwind 4 and a strict `Zinc-950` solid-surface architecture.
- **Flight Operations Suite**: Unified preflight dispatch system combining **Weight & Balance**, **Fuel Planning**, and **Performance Analysis (DA)**.
- **EFB-Standard HUD**: Aggressive responsive hardening for cockpit-use viewports (iPad Portrait/Landscape, iPhone), featuring 48pt+ tactical touch targets.
- **Safety Protocol 01 Integration**: Mandatory high-visibility safety anchors ensuring AFM (Airplane Flight Manual) precedence and PIC (Pilot in Command) authority.
- **Security Hardening**: 5-layer defense including `IdleTimeoutManager` with "Master Caution" session protection.
- **Aircraft Lifecycle Management**: Full history-safe registry with soft-delete patterns for logging integrity (FAA/CAA compliant).
- **AVWX Weather Integration**: Intelligent METAR fetching with high-ratio contrast support for direct-sunlight readability.
- **Logbook Analytics**: Currency tracking (90-day FAA/CAA), flight trends, and operational records sync.

### 🚧 Mission Targets
- Bulk CSV import/export for legacy logbook synchronization.
- Fleet-grade maintenance tracking and squawk integration.
- Automated Pilot Records Database (PRD) compliance reports.

---

## 🏗️ Software Architecture

### **Instrument-Grade Design System (IGO)**
The PilotHandbook adopts a specialized design language inspired by professional civilian avionics (Garmin G3000/G5000):
- **Zero-Distraction Strategy**: Removed legacy "carbon-fibre" and "cinematic glows" to prioritize static clarity and numeric acquisition.
- **Hierarchy Locking**: Critical safety data follows a strict sizing protocol: **Primary Value > Unit Label > Operational Context**.
- **Stress-Mode UX**: Minimized animations and transitions on mobile viewports to ensure the system remains stable and responsive under high-workload conditions.

### **Safety & Compliance Architecture**
- **AFM Precedence**: The system is architected to reinforce that calculations are for supplemental use only, requiring PIC verification against the certified AFM.
- **Logging Integrity**: Utilizes a dual-write and soft-delete pattern to ensure that every flight hour remains part of the audited historical record, even if parent aircraft or users are modified.

---

## 🛠️ Tech Stack ("The T3 Turbo Stack")

**Core Engine**
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
│   ├── (dashboard)/    # Flight operations, analytics, fleet
│   ├── admin/          # RBAC & system monitoring
│   ├── tools/          # Dispatch tools (W&B, Fuel, Performance)
│   └── ...             # Auth & Public operational pages
├── components/         # Shared React components (EFB-Modular)
│   ├── tools/          # Operational calculator logic
│   ├── ui/             # Atomic tactical tokens
│   └── ...
├── lib/                # Core engines (Decision, Validation, DB)
├── server/             # trpc Procedures & Route definitions
└── ...
```

---

## 🏁 Operational Setup

### 1. Repository Synchronization
```bash
git clone https://github.com/binsacedillo/pilot-handbook.git
cd pilothandbook
npm install
```

### 2. Environment Calibration
Create a `.env` file with the following variables:
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=***
CLERK_SECRET_KEY=***
DATABASE_URL=postgresql://...
CLERK_WEBHOOK_SECRET=***
AVWX_API_KEY=***
```

### 3. Initialize System
```bash
npx prisma generate
npx prisma db push
npm run dev
```

---

## 🧪 Operational Validation

The suite includes **97 passing tests** ensuring the integrity of the following systems:
- **Linguistic Compliance**: Verified civilian aviation terminology across all HUD components.
- **Rate Limiting**: Advanced token-bucket isolation for API security.
- **Business Logic**: FAA recency rules, float precision for fuel calculations, and CG envelope validation.
- **Weather Reliability**: Cache hit/miss and AVWX fallback stability.

```bash
npm run test          # Headless (Vitest)
npm run test:ui       # Interactive Dashboard
npm run test:coverage # Compliance Audit
```

---

## 🚀 Deployment Optimization

Optimized for **Vercel** + **Neon**:
1. Connect via Git for automatic CI/CD deployment.
2. Configure `CLERK_WEBHOOK_SECRET` for real-time user lifecycle synchronization.
3. The build pipeline automatically runs `npx prisma generate` for schema alignment.

---

## ⚖️ License
**Private and Proprietary.** This system is built for professional aviators and is not for unauthorized distribution.

---

*Professional Aviation Software. No place for placeholders. No room for error.* 🚀✈️🛡️
