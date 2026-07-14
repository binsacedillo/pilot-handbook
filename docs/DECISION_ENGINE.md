# Logic Guide: The Decision Engine

The `lib/decision/engine.ts` Decision Engine is the core of the "Student Pilot Assistant." It transforms raw calculation results into meaningful safety assessments.

---

## 🏗 1. Data Structure: FlightSafetyDecision

Every safety evaluation returns this interface:

```typescript
export interface FlightSafetyDecision {
  status: SafetyStatus;   // NORMAL | CAUTION | WARNING | INVALID
  reason: string;         // The technical root cause
  recommendation: string; // Actionable pilot instruction
  implication: string;    // Plain-language consequence
  mentorship: string;     // Training habit or tip
}
```

---

## 🚦 2. Status Definitions

- **NORMAL (Emerald)**: Results are within POH/AFM certified limits. No immediate safety concerns.
- **CAUTION (Amber)**: Close to limits, or requires increased pilot awareness (e.g., fuel reserves below 45 minutes but above legal minimums).
- **WARNING (Red)**: Certified limits exceeded. Flight should not be conducted without remediation.
- **INVALID**: Provided inputs are logically impossible or outside the formula domain.

---

## 🧪 3. Evaluation Modules

### A. Weight & Balance (Loading Check)
- **Status**: Warning if Overweight or Out of CG.
- **Implication**: Focuses on "Stability" and "Climb Performance."
- **Mentorship**: Tips on loading order (Heavy items vs. light items).

### B. Performance (Density Altitude)
- **Status**: Warning if DA significantly exceeds Field Elevation.
- **Implication**: Focuses on "Propeller Efficiency" and "Runway Length."
- **Mentorship**: How humidity affects performance (often overlooked by students).

### C. Fuel Planning
- **Status**: Caution if below "Pilot Discretion" buffers (e.g., 60 mins). Warning if below legal VFR reserves.
- **Implication**: Risk of starvation or limited diversion options.
- **Mentorship**: Importance of "leaning for cruise" and groundspeed verification.

---

## 🛠 4. How to Add New Logic

1.  **Define Formula**: In `lib/calculations/`.
2.  **Add Switch Case**: Add a new type to `evaluateFlightSafety`.
3.  **Draft Mentorship Content**:
    - Keep it under 150 characters.
    - Focus on the **Habit** (e.g., "Check the crosswind component on final").
    - Use the [Terminology Standards](TERMINOLOGY.md).

---

**Last Updated:** April 19, 2026
