import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/routers/_app';

/**
 * A set of strongly-typed React hooks from your `AppRouter` type signature
 */
export const trpc = createTRPCReact<AppRouter>();
