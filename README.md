# Pilot Handbook

A comprehensive flight logging and pilot management application built with the T3 Stack. Pilot Handbook helps pilots track their flight hours, manage aircraft, and maintain accurate logbook records while providing administrative tools for flight schools and organizations.

## Features

### 🛩️ Flight Logging
- **Flight Records Management**: Log and track all your flights with detailed information
- **Flight Statistics**: View total flight hours, PIC time, dual time, and landing counts
- **Airport Codes**: Track departure and arrival locations using standard airport codes
- **Flight Duration Tracking**: Record flight duration with automatic time calculations
- **Flight Remarks**: Add detailed notes and observations for each flight

### ✈️ Aircraft Management
- **Aircraft Registry**: Maintain a database of aircraft with make, model, and registration
- **Flight Hours Tracking**: Monitor total flight hours per aircraft
- **Aircraft Status**: Track operational status of each aircraft
- **Multi-Aircraft Support**: Manage multiple aircraft simultaneously

### 👨‍✈️ User Management
- **Role-Based Access Control**: Support for Admin, Pilot, and User roles
- **License Tracking**: Store pilot license information and expiry dates
- **User Profiles**: Manage personal information and preferences
- **Secure Authentication**: Powered by Clerk for robust user authentication

### 🔐 Admin Dashboard
- **System Statistics**: View total users, flights, and aircraft counts
- **Pilot Verifications**: Dedicated page to verify/revoke pilot accounts
- **User Management**: View all users with role management and deletion
- **User Deletion**: Safely delete users with confirmation requirements
- **Role Management**: Promote users to Pilot or Admin roles
- **Recent Activity**: Monitor recent user registrations and activity

### 🎨 User Experience
- **Dark/Light Theme**: System-aware theme with manual override
- **Theme Persistence**: Saved preferences synced across devices
- **Responsive Design**: Mobile-first design that works on all devices
- **Accessibility**: ARIA labels and semantic HTML throughout
- **Loading States**: Skeleton loaders and loading indicators

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **API Layer**: [tRPC](https://trpc.io/) for type-safe APIs
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: Custom components with [Lucide React](https://lucide.dev/) icons
- **Theming**: [next-themes](https://github.com/pacocoursey/next-themes) for dark/light mode
- **State Management**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Testing**: [Vitest](https://vitest.dev/) with 70+ comprehensive unit tests
- **Charts**: [Recharts](https://recharts.org/) for data visualization

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

## Project Structure

```
pilothandbook/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes (tRPC, webhooks)
│   ├── admin/             # Admin dashboard pages
│   │   ├── users/        # User management
│   │   └── verifications/ # Pilot verifications
│   ├── dashboard/         # User dashboard
│   ├── flights/          # Flight logging pages
│   ├── aircraft/         # Aircraft management
│   ├── settings/         # User settings & preferences
│   ├── sign-in/          # Authentication pages
│   └── sign-up/
├── components/            # React components
│   ├── admin/            # Admin-specific components
│   ├── landing/          # Landing page components
│   └── ui/               # Reusable UI components
├── lib/                   # Utility functions and configurations
│   └── hooks/            # Custom React hooks
├── prisma/               # Prisma schema and migrations
├── server/               # tRPC server configuration
│   └── routers/          # tRPC routers
├── trpc/                 # tRPC client setup
├── scripts/              # Utility scripts
└── __tests__/            # Test files (70+ tests)
```

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
