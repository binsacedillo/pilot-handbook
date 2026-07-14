# 🧪 Test Suite Documentation

> **Status:** ✅ All Tests Passing (111 tests) | **Framework:** Vitest

## 📋 Table of Contents
- [Quick Start](#-quick-start)
- [Test Architecture](#-test-architecture)
- [Feature Testing Checklist](#-feature-testing-checklist)
- [Developer Guide](#-developer-guide)
- [Maintenance & CI/CD](#-maintenance--cicd)

---

## ⚡ Quick Start

```bash
npm test              # Run all tests
npm run test:ui       # Interactive UI dashboard
npm run test:coverage # View coverage report
```

---

## 🏗 Test Architecture

We use a layered testing strategy to ensure reliability and security:

| Module | Focus Areas | Location |
| :--- | :--- | :--- |
| **Flights** | Schema validation, time calculations, instruction logic. | `server/routers/__tests__/flight.test.ts` |
| **Aircraft** | Status grouping, fleet stats, model validation. | `server/routers/__tests__/aircraft.test.ts` |
| **Analytics** | Monthly aggregation, 90-day recency, PIC/Dual totals. | `server/routers/__tests__/analytics.test.ts` |
| **Decision** | Safety snapshot logging, enum validation, history retrieval. | `server/routers/__tests__/decision.test.ts` |
| **Security** | RBAC, user isolation, data ownership, input sanitization. | `server/routers/__tests__/security.test.ts` |
| **Weather** | METAR/TAF parsing and route-level weather behavior. | `server/routers/__tests__/weather.test.ts` |
| **Compliance** | Currency and compliance engine rules. | `lib/__tests__/compliance-engine.test.ts` |

---

## ✅ Feature Testing Checklist

### Core Modules
- [x] **Flights:** CRUD operations, time allocation validation, date filtering.
- [x] **Aircraft:** Fleet management, status tracking (Active/Maint/Inactive).
- [x] **Analytics:** 12-month history, average duration, recency compliance.
- [x] **Auth:** Clerk integration, session validation, role-based access (Admin/Pilot).
- [x] **Decision:** Safety snapshot validation, persistence, and history queries.
- [x] **Weather:** Forecast ingestion and operational edge cases.

### Security & Quality
- [x] **User Isolation:** Users can never see/edit data belonging to others.
- [x] **Input Validation:** Zod schema enforcement for all API boundaries.
- [x] **Performance:** Suite runs in < 3s to maintain developer velocity.

---

## 🛠 Developer Guide

### Adding a New Test
Follow the existing patterns in `server/routers/__tests__/` or `lib/__tests__/`. Use descriptive `it` blocks:
```typescript
it('should prevent overlapping PIC and Dual time', () => {
  // 1. Arrange (Setup mock data)
  // 2. Act (Perform operation)
  // 3. Assert (Check results)
});
```

### Manual Integration Testing
Before a major release, manually verify:
1. **Flight CRUD:** Create/Edit/Delete a flight in the UI.
2. **Admin Panel:** Verify a new user and promote them to Admin.
3. **PWA:** Test "Add to Home Screen" and offline visibility.

---

## 🔄 Maintenance & CI/CD

### When to update tests:
* **Schema Change:** Update the corresponding Zod validation tests.
* **New Feature:** Add at least one unit test and one security test.
* **Bug Fix:** Add a regression test to prevent the bug from returning.

### CI Integration:
Tests run automatically on every Pull Request via GitHub Actions:
```bash
# CI command
npm test -- --run
```

---

**Last Updated:** July 2026
