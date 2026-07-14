# Development Setup: Pilot Handbook

This document provides technical instructions for setting up the Pilot Handbook development environment.

---

## 🚀 1. Prerequisites

- **Node.js**: v18+ (v20 recommended)
- **Database**: PostgreSQL (Neon.tech recommended)
- **Auth**: Clerk Account
- **OS**: Windows / macOS / Linux

---

## 🔑 2. Environment Variables

Create a `.env.local` file in the root directory. You can use `.env.example` as a template.

```bash
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# Database (Neon / PostgreSQL)
DATABASE_URL="postgresql://user:pass@ep-hostname.region.aws.neon.tech/neondb?sslmode=verify-full"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000" # Local dev port (or http://localhost:8080 when running npm run start)
```

---

## 🛠 3. Technical Installation

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Initialize Database**:
    ```bash
    npx prisma generate
    npx prisma migrate dev
    ```

    If you are connecting local code to an existing shared environment that already has migration history applied, use:
    ```bash
    npx prisma migrate deploy
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

---

## 🧪 4. Testing

The project uses **Vitest** for core logic testing.

- **Run all tests**: `npm test -- --run`
- **Watch mode**: `npm test`
- **Coverage**: `npm run test:coverage`

---

## 📦 5. Common Commands

- `npm run build`: Production build.
- `npm run lint`: Run ESLint checks.
- `npx prisma studio`: Visual database explorer.
- `npm run dev:clean`: Clear Next.js cache and restart dev server.

---

## ✈️ 6. Next Steps

Once set up, refer to the [Architecture Guide](ARCHITECTURE.md) to understand the Student Pilot Assistant framework and the Explanation UX layer.
