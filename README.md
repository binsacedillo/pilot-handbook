# 📊 **Current Status:** For a detailed breakdown of completed features, WIPs, and the audit log, please see [PROJECT_STATUS_REPORT.md](./PROJECT_STATUS_REPORT.md).

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

**Backend & Data**
* **Database:** PostgreSQL (via Supabase)
* **ORM:** Prisma
* **API:** tRPC (Type-safe APIs)
* **Validation:** Zod

**Tools & UI**
* **Auth:** Clerk (Secure Authentication)
* **Components:** Radix UI Primitives, Lucide Icons
* **Testing:** Vitest v4

## 📂 Project Structure

```bash
prisma/
	schema.prisma
	migrations/
public/
	favicon.ico
	logo.png
scripts/
	check-admin.ts
server/
	trpc.ts
	routers/
		admin.ts
		aircraft.ts
		flight.ts
		preferences.ts
		stats.ts
		user.ts
		weather.ts
		_app.ts
src/
	actions/
		theme.ts
	components/
		ThemeProvider.tsx
		UserManagementTable.tsx
		flights/
			FlightFilterBar.tsx
	lib/
		shared-schemas.ts
	trpc/
		client.ts
		react.tsx
		server.ts
		shared.ts
	utils/
trpc/
	client.ts
	Provider.tsx
__tests__/
	routers/
		aircraft.test.ts
		flight.test.ts
		stats.test.ts
	security/
		authorization.test.ts
```

## Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** 18.x or later
- **npm** or **yarn** or **pnpm**
- **PostgreSQL** database (local or hosted, e.g., Supabase)
- **Clerk** account for authentication

## Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd pilothandbook
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# Clerk Webhooks (for user sync)
CLERK_WEBHOOK_SECRET="whsec_..."

# Optional: Deployment
VERCEL_URL="" # Auto-populated on Vercel
```

**Required Environment Variables:**
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
- `CLERK_SECRET_KEY`: Your Clerk secret key
- `CLERK_WEBHOOK_SECRET`: Webhook secret for Clerk user sync

### 4. Set Up the Database

Run Prisma migrations to create the database schema:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Configure Clerk Webhooks

To sync Clerk users with your database:

1. Go to your [Clerk Dashboard](https://dashboard.clerk.com)
2. Navigate to **Webhooks** and create a new endpoint
3. Set the endpoint URL to: `https://your-domain.com/api/webhooks/clerk`
4. Subscribe to the `user.created` event
5. Copy the webhook secret and add it to your `.env` as `CLERK_WEBHOOK_SECRET`

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

### 7. Promote Your First Admin

After signing up through the app, promote your account to admin:

```bash
npm run make:admin <your-clerk-user-id>
```

You can find your Clerk user ID in the Clerk Dashboard or in your browser's developer console after logging in.

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

The application includes a comprehensive test suite with **70+ tests** covering:

- **Flight Router**: CRUD operations, filtering, time calculations
- **Aircraft Router**: Fleet management, validation, statistics
- **Stats Router**: Analytics, 90-day recency, summary calculations
- **Security**: Authorization, user isolation, RBAC enforcement

Run tests with:
```bash
npm run test          # Run all tests
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

Vercel will automatically detect Next.js and configure the build settings.

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
