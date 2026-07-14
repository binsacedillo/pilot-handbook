# Developer Guide: Building Guided Modules

This guide standardizes the creation of new calculation modules in the Pilot Handbook. All modules should follow this pattern to ensure a consistent "Student Pilot Assistant" experience.

---

## 🏗 1. The Composition Pattern

A standard module is composed of three layers:

1.  **The Pure Math**: `lib/calculations/name-of-module.ts`
2.  **The Decision Logic**: `lib/decision/engine.ts`
3.  **The Guided Dashboard UI**: `components/tools/NameOfModule.tsx`

---

## 🎨 2. UI Structure (Guided Dashboard Style)

All modules must be visual, interactive, and responsive.

### Standard Template:
- **Header**: Use `CardHeader` with a themed icon (e.g., `Scale`, `Thermometer`).
- **Input Area**: Left-aligned grid using `Label` and `Input`.
- **Active Dashboard (Phase 2)**: A visual representation of the data (e.g., CG Envelope graph, Fuel gauge).
- **Explanation UX (Phase 4)**: The Guidance Banner (Implication + Mentorship).

---

## 📝 3. Implementation Checklist

When adding a new module:

### Step 1: Theoretical Formula
- Research the certified FAA or POH formula.
- Implement as a pure, unit-testable function in `lib/calculations/`.

### Step 2: Safety Boundary
- Define what constitutes `WARNING` vs `CAUTION` for this specific check.
- Add to the [Decision Engine](DECISION_ENGINE.md).

### Step 3: Implication Logic
- Draft a plain-language consequence.
- *Bad:* "Takeoff roll increased by 200ft."
- *Good:* "Thin air reduces your climb-rate. You will need more runway than usual."

### Step 4: Guidance Injection
Ensure the UI renders the `implication` and `mentorship` fields from the decision engine results.

---

## 🔧 4. Reusable UI Components

- `StatusMiniCard`: Use in summary views for quick status checks.
- `GuidanceBanner`: (Backlog Refactor Target) Standardized component planned for formatting the Implication + Mentorship section (currently styled inline via custom warning cards).
- `AircraftSelector`: Always use this to load pre-defined performance data.

---

**Last Updated:** April 19, 2026
