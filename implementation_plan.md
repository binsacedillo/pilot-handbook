# Implementation Plan: Phased CI/CD Pipeline (Refined)

As a Senior DevOps Engineer, I have refined our CI/CD strategy to a **10/10 production-grade model**. This plan prioritizes a **fail-fast philosophy**, explicit stack synchronization, and optimized caching to ensure the Pilot Handbook remains stable and efficient.

## Goal
Establish an industry-level system that protects itself from regressions using a tiered, debuggable verification model.

---

## 🟢 Phase 1: Code Safety (The "Fail-Fast" Foundation) [COMPLETED]
**Goal**: Verify code correctness. If TypeScript fails, we stop early to save CI time.
- **Tools**: GitHub Actions, TSC, ESLint, Vitest.
- **Execution Order**:
    1.  [x] **Type Check**: `npm run typecheck` (Passed 🛡️).
    2.  [x] **Linting**: `npm run lint` (Zero-Warning State achieved).
    3.  [x] **Unit Testing**: `npm run test` (Logic verified).
    4.  [x] **Build Check**: `npm run build` (Verified production bundling).
    5.  [x] **Security Instrumentation**: Integrated `rateLimitMiddleware` and `logSuspiciousPayload` into the tRPC lifecycle.🛡️

## 🟡 Phase 2: Stack Validation (Environment Correctness) [COMPLETED]
**Goal**: Integrate the backend and verify environment-specific configurations.
- **Tools**: Prisma, `.env.example`.
- **Explicit Sequence**:
    1.  [x] `npm install` / `npm ci`
    2.  [x] `npx prisma generate` (Sync the ORM client).
    3.  [x] **Env Validation**: Load dummy values for CI (Created `.env.example`).
    4.  [x] **Schema Validation**: `npx prisma validate` (Passed 🚀).
    5.  [x] **Connectivity Check**: Verified DB access via `check-admin.ts`.

## 🔵 Phase 3: Workflow Optimization
**Goal**: Speed and stability for the developer experience.
- **Actions**:
    - **Optimized Caching**: Cache `~/.npm` and `.next/cache` instead of `node_modules` for high stability across runs.
    - **Branch Protection**: Enforce that `main` only accepts code that has passed all Phase 1 & 2 checks.
    - **Vercel Guardrails**: Block production deploys if the CI pipeline fails.

## 🔴 Phase 4: Advanced Verification (Future)
**Goal**: Full system confidence.
- **Actions**:
    - **E2E Testing**: Integrate Playwright for critical pilot journeys.
    - **Visual Regression**: Detect UI breaks in Tailwind v4 styling.
    - **Performance Checks**: Automated LCP/CLS audits.

---

## 🛡️ Hardening Measures
- **Fail-Fast**: TypeScript errors block the rest of the pipeline instantly.
- **Explicit Stack Sync**: Prisma generation is required before any code verification.
- **Separation of Concerns**: Phase 1 targets code health; Phase 2 targets environment health.

## Verification Plan

### Phase 1 Verification
- Trigger a build with a TS type error; verify that Lint and Test steps are skipped (Fail-fast).
- Verify that a clean build completes all steps successfully.

### Phase 2 Verification
- Check CI logs to ensure `prisma generate` and dummy env loading are executed in the correct sequence.
