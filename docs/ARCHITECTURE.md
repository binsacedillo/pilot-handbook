# System Architecture: Student Pilot Assistant Handbook

This document outlines the architectural philosophy and technical rationale behind the Pilot Handbook, specifically its transition from a performance tool to a **Guided Training Assistant**.

---

## 🧭 1. Product Philosophy: The "Mentor" Model

Unlike traditional Electronic Flight Bags (EFBs) that focus purely on raw data output, the Pilot Handbook follows a **Design Thinking** approach centered on student pilots (pre-solo to checkride).

### The Hierarchy of Priority:

1.  **Mentorship**: Why does this calculation matter? What is the safety implication?
2.  **Accuracy**: Providing precise aviation data derived from certified POH/AFM formulas.
3.  **Frictionless Flow**: Reducing the "math anxiety" of preflight planning through automated workflows.

### The "Explanation UX" Layer

Every calculation module must implement a `FlightSafetyDecision` layer. This layer translates raw numbers into:

- **Status**: (Normal, Caution, Warning, Invalid)
- **Implication**: A plain-language consequence of the data.
- **Mentorship**: A tip or common mistake provided for educational reinforcement.

---

## 🛠 2. Technical Rationale: Client-Side Reactivity

The Pilot Handbook uses a **tRPC-heavy client-side fetching model** for all dashboard and planning modules.

### Why Client-Side Fetching?

Historically, the project moved away from server-side hydration for dynamic data to resolve specific UX issues:

- **Soft Navigation Sync**: Next.js App Router sub-navigation can lead to stale data if queries are hydrated on the server.
- **Real-Time Reactivity**: By using tRPC hooks on the client, mutations (like adding a flight or archiving an aircraft) trigger immediate cache invalidation and UI updates.
- **Loading State Control**: Provides more granular control over loading skeletons and "Search" states during atmospheric data fetches.

### Soft-Delete (Archiving) Logic

To preserve legal history, aircraft are never truly deleted. They are **archived**.

- **Active Fleet**: Filters `archived: false` in the UI.
- **Historical Stats**: Includes all aircraft (archived or not) to ensure logbook totals match the pilot's legal history.

---

## 📡 3. The Decision Engine

The `lib/decision/engine.ts` Decision Engine acts as the bridge between "Aviation Math" and "Pilot Mentorship."

### How to Extend:

When adding a new guided module (e.g., Crosswind Check):

1.  Define the math formula in `lib/calculations/`.
2.  Add a new `case` to `evaluateFlightSafety` in `lib/decision/engine.ts`.
3.  Implement the mentorship tips specific to that phase of flight.

---

## 📦 4. Data Layer

- **Database**: Neon (Serverless PostgreSQL)
- **ORM**: Prisma
- **Auth**: Clerk (Enforced at the tRPC boundary via `protectedProcedure`)

---

**Last Updated:** April 19, 2026
**Status:** Canonical Architecture Reference
