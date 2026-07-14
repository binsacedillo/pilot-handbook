# Brand & Terminology Standards: Student Pilot Assistant

To maintain the **Student-First** identity of the Pilot Handbook, all developers must adhere to the following terminology and tone standards.

---

## 🧭 1. Tone of Voice

- **Neighborly**: Help, don't lecture.
- **Factual**: All mentorship tips must be grounded in FAA/AFM standards.
- **Encouraging**: Use "Checkload" or "Constraint" instead of "Failure" or "Illegal."

---

## 🔤 2. Glossary: Tool vs. Assistant

We avoid "militarized" or "raw data" terms in the UI.

| Old Term (Avoid) | New Standard (Use) | Rationale |
| :--- | :--- | :--- |
| Weight & Balance | **Loading Check** | More intuitive for student pilots; implies a verification step. |
| Density Altitude | **Performance Check** | Focuses on the *outcome* (performance) rather than just the atmospheric data. |
| Fuel Planner | **Fuel Planning** | Reframes it as an active preflight habit. |
| Mission | **Flight / Training Leg** | Aligns with civilian General Aviation (GA). |
| Tactical HUD | **Guided Dashboard** | Removes combat connotations; emphasizes mentorship. |
| hardened | **Reliable / Stable** | More professional for aviation tools. |

---

## 💡 3. The "One-Sentence Implication" Rule

When writing `implication` strings for the Decision Engine:
1.  **Be Direct**: "Heavier aircraft require higher takeoff speeds."
2.  **Stay Practical**: "A forward CG might make it harder to flare during landing."
3.  **Avoid Jargon**: If you use a term like "flare," ensure it was introduced in the relevant training phase.

---

## ✅ 4. Labeling UI Elements

- **Status Badges**: Use standard aviation colors (Emerald for Normal, Amber for Caution, Red for Warning).
- **Tool Headers**: Always use the **Rebranded Name** in the card title (e.g., `Aircraft Loading Check`).
- **Internal Names**: You may use technical names in code (e.g., `WeightBalanceCalculator.tsx`) for clarity and searchability, but never show them to the student.

---

**Last Updated:** April 19, 2026
