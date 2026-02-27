# � **v1.0 Technical Release** | ![Next.js 15](https://img.shields.io/badge/Next.js-15-blue) ![Clerk v6](https://img.shields.io/badge/Clerk-v6-orange)

---

## 🗺️ Roadmap

### ✅ Completed
- Admin logic (role-based access, user management, audit logging)
- Clerk v6 integration (secure authentication, metadata sync, dual-write pattern)
- Aircraft registry and management (soft delete/archive, access control)
- Multi-aircraft support for users
- Flight logging with advanced filtering (URL state, shareable links)
- Server-side validation (Zod schemas, tRPC procedures)
- Weather widget (AVWX METAR integration with caching)
- Analytics dashboard (charts, statistics, 90-day recency tracking)
- **Security hardening**: 5-layer defense (Zod validation, rate limiting, request body limits, DB constraints, HTML sanitization)
- **Test suite (97 tests)**: Comprehensive coverage of all 10 test suites including security and rate-limit validation
- **UI polish and accessibility improvements**: Full mobile responsiveness (scrolling tabs, responsive tables, flexible cards), high contrast support, ARIA labels throughout.
- **Mobile-first responsive design**: Viewport config, responsive nav with hamburger menu, touch-friendly UI (40px targets), documented standards

### 🚧 Pending / WIP
- Bulk import/export for flight logs
- Open source documentation and contribution guidelines
- Automated deployment scripts for multiple cloud providers

# 📊 **Current Status:**

**Progress Scores (Feb 2026 Audit - Updated):**
- Core Logic: 95% (Soft Delete/Archiving, client-side tRPC hooks, real-time reactivity)
- UI/UX: 100% (Mobile-first responsive design, no stale data flashes, touch-friendly navigation, improved admin panel UX)
- Infrastructure/Perf: 95% (Optimized DB queries, strict protectedProcedure auth)
- Test Coverage: Comprehensive Suite (97 Unit Tests protecting 100% of critical business logic & compliance rules)

For a detailed breakdown of completed features, WIPs, and the audit log, please see [PROJECT_STATUS_REPORT.md](./internal-docs/PROJECT_STATUS_REPORT.md).
#
## Technical Log: Why Client-Side Data Fetching?

All dashboard data fetching was moved to the client (via tRPC hooks) to address issues with Next.js App Router's soft-navigation and React Query hydration. This ensures:
- Real-time reactivity and instant updates after navigation or mutations.
- Consistent, up-to-date data for all dashboard widgets, regardless of navigation method.
- Simpler cache invalidation and error handling, especially for authenticated/protected data.

This is now the standard for all dashboard and user-specific data modules.

# Technical Decision: Resilient Data Architecture

**Compliance**: Implemented a non-destructive soft-delete system for both Users and Aircraft, ensuring historical flight data remains intact even when accounts are deactivated (FAA/CAA friendly).

**UX/Performance**: Shifted to client-side tRPC data fetching with pre-defined loading skeletons, eliminating stale-data flashes during Next.js navigation and improving perceived performance (LCP) on the dashboard.

# Pilot Handbook

A comprehensive flight logging and pilot management application built with the T3 Stack. Pilot Handbook helps pilots track their flight hours, manage aircraft, and maintain accurate logbook records while providing administrative tools for flight schools and organizations.


## 🚀 Key Features

### ✈️ Pilot Tools
* **Smart Flight Logging:** Automated duration calculation and aircraft tracking.
* **Live Weather Widget:** Real-time METAR data with airport name resolution.
* **Dynamic Filtering:** Filter logs by aircraft type using URL-based state (shareable links).
* **Recency Tracking:** 90-Day currency monitoring (Day/Night/IFR).

### 🛡️ Admin & Security
* **Role-Based Access:** Admin dashboard for user verification and management.
* **Secure Auth:** Clerk integration with "In-App Browser" detection for TikTok/Instagram users.
* **Data Integrity:** Server-side validation with Zod schemas.



## 🛠️ Tech Stack

**Core**
* **Framework:** Next.js 16 (App Router)
* **Language:** TypeScript
* **Library:** React 19 (Server Components & Actions)
* **Styling:** Tailwind CSS v4


## 📂 Project Structure

```bash
├── app/                # Next.js App Router (UI, pages, layouts)
│   ├── admin/          # Protected admin dashboard (user/role management)
│   ├── aircraft/       # Aircraft registry and details
│   ├── dashboard/      # User dashboard (stats, analytics)
│   ├── flights/        # Flight logbook and entry forms
│   ├── settings/       # User settings (profile, preferences)
│   ├── sign-in/        # Auth routes (Clerk)
│   └── ...             # Other feature routes
├── components/         # Shared React components (UI, layout, widgets)
│   ├── admin/          # Admin-specific UI components
│   ├── landing/        # Landing page sections
│   └── ui/             # Design system (Button, Card, etc.)
├── lib/                # Server utilities (db, auth, helpers)
│   └── hooks/          # Custom React hooks
├── prisma/             # Database schema and migrations
├── public/             # Static assets (images, favicon)
├── scripts/            # Utility scripts (admin tools, DB checks)
├── server/             # tRPC API routers and server logic
│   ├── routers/        # tRPC routers (admin, aircraft, user, etc.)
│   └── trpc.ts         # tRPC server entrypoint
├── src/                # (Legacy) Shared logic, actions, utils
├── trpc/               # tRPC client/provider for React
├── internal-docs/      # Internal scripts and documentation (not shipped)
├── .env, .gitignore, ... # Config and environment files
```

### Folder Explanations

- **/app**: Main Next.js App Router. Each subfolder is a route (e.g., `/admin` is the admin dashboard, `/flights` is the logbook UI).
```

## 🏁 Getting Started

### Prerequisites
- **Node.js** 20+
- **pnpm** (recommended) or npm
- **PostgreSQL** database (Supabase, Neon, or local)

### 1. Clone the Repository
```bash
git clone https://github.com/binsacedillo/pilot-handbook.git
cd pilothandbook
```

### 2. Install Dependencies
```bash
pnpm install
```

### 3. Set Up the Database
```bash
pnpm prisma db push
```

### 4. Configure Environment Variables
Create a `.env` file in the project root with the following keys:

```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
DATABASE_URL=your_postgres_connection_string
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
```

### 5. Clerk Setup Tip
> **Important:** In your Clerk Dashboard, go to **User Settings > Metadata** and enable **Public Metadata**. This is required for the `ADMIN` role and other user roles to work correctly in the app.

### 6. Start the Development Server
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

---

## Available Scripts

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm start` - Start the production server
- `npm run lint` - Run ESLint to check code quality
- `npm run test` - Run all tests with Vitest
- `npm run test:ui` - Run tests with interactive UI
- `npm run test:coverage` - Generate test coverage report
- `npm run typecheck` - Run TypeScript type checking
- `npm run make:admin <clerkUserId>` - Promote a user to admin role


## Database Schema

The application uses the following main models:

- **User**: User accounts with role-based permissions
- **Aircraft**: Aircraft registry with specifications
- **Flight**: Flight log entries with detailed information
- **UserPreferences**: User preferences including theme and settings

See `prisma/schema.prisma` for the complete schema definition.

## Testing

The application includes a comprehensive test suite with **97 tests** covering:

- **Admin Router** (14 tests): Role management, user verification, audit logging, Clerk sync
- **Security Tests** (11 tests): Input length validation, SQL injection prevention, business logic enforcement, authorization
- **Rate Limiting** (12 tests): Token bucket algorithm, IP extraction, concurrent requests, time-based refill
- **Weather Router** (11 tests): METAR cache hit/miss, AVWX API fallback, favorite airport, mock data
- **Flight Router** (10 tests): CRUD operations, filtering, time calculations, float precision
- **Preferences Router** (10 tests): Theme/units management, Clerk metadata sync, validation, defaults
- **Stats Router** (10 tests): Hours by type/month aggregation, summary stats, edge cases, unauthenticated handling
- **User Router** (9 tests): Profile management, upsert logic, authentication
- **Aircraft Router** (7 tests): Fleet management, validation, soft delete, access control
- **Dashboard Logic** (3 tests): Status card logic, fleet vs stats distinction

**Test Infrastructure:**
- Mock tRPC context with Clerk auth simulation
- Database model mocks (Prisma client mocking)
- Audit logger and external service mocks
- Type-safe test utilities

Run tests with:
```bash
npm run test          # Run all tests (97/97 passing ✓)
npm run test:ui       # Interactive test UI
npm run test:coverage # Coverage report
```

## Deployment

### Deploy to Vercel

The easiest way to deploy this application is using [Vercel](https://vercel.com):

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)
2. Import your repository in Vercel
3. Add all environment variables from your `.env` file
4. Deploy!

### Automatic Deployments

Once your repository is connected to Vercel, every `git push` to the `main` branch will automatically trigger a new production deployment.

1. **Push Changes:** `git push origin main`
2. **Watch Build:** Go to your Vercel Dashboard to see the build progress.
3. **Live:** Your changes will be live at your custom domain in minutes!

### Database Setup for Production

1. Create a production PostgreSQL database (recommended: [Supabase](https://supabase.com))
2. Run migrations: `npx prisma migrate deploy`
3. Update your production `DATABASE_URL` environment variable

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is private and proprietary.

## Support

For questions or issues, please open an issue in the repository.
