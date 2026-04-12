'use client';

import { QueryCache, MutationCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';
import { useToast } from '@/components/ui/toast';

function getBaseUrl() {
  if (typeof window !== 'undefined') return '';
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

// Exponential backoff with jitter for retries
function getRetryDelay(attemptIndex: number): number {
  const baseDelay = 1000; // 1 second
  const maxDelay = 10000; // 10 seconds
  const exponentialDelay = Math.min(baseDelay * Math.pow(2, attemptIndex), maxDelay);
  // Add jitter (±25% randomization)
  const jitter = exponentialDelay * 0.25 * (Math.random() * 2 - 1);
  return Math.round(exponentialDelay + jitter);
}

export function TRPCProvider({ children }: { children: React.ReactNode }) {
  const { showToast } = useToast();

  const [queryClient] = useState(
    () =>
      new QueryClient({
        queryCache: new QueryCache({
          onError: (error: unknown) => {
            const trpcError = error as { data?: { code?: string }; message?: string };
            // Avoid double-toasting if it's a session issue (handled by SessionExpirationHandler)
            if (trpcError?.data?.code === 'UNAUTHORIZED') return;

            // Only toast on the final retry failure or if retries are disabled
            // In TanStack Query v5, the meta/retry state can be checked if needed, 
            // but for global visibility, a "Background Refresh Failed" is helpful.
            showToast(
              trpcError.message || "Background refresh failed. Please check your connection.",
              "error",
              { duration: 4000 }
            );
          },
        }),
        mutationCache: new MutationCache({
          onError: (error: unknown) => {
            const trpcError = error as { data?: { code?: string }; message?: string };
            if (trpcError?.data?.code === 'UNAUTHORIZED') return;

            showToast(
              trpcError.message || "Action failed. Please try again.",
              "error"
            );
          },
        }),
        defaultOptions: {
          queries: {
            staleTime: 5 * 1000,
            refetchOnWindowFocus: false,
            // Exponential backoff retry with 3 attempts
            retry: (failureCount, error: unknown) => {
              // Don't retry on UNAUTHORIZED (session expired)
              if ((error as { data?: { code?: string } })?.data?.code === 'UNAUTHORIZED') {
                return false;
              }
              // Retry network errors and server errors up to 3 times
              return failureCount < 3;
            },
            retryDelay: getRetryDelay,
            // 5 second timeout for all queries
            networkMode: 'online',
          },
          mutations: {
            // Same retry logic for mutations
            retry: (failureCount, error: unknown) => {
              if ((error as { data?: { code?: string } })?.data?.code === 'UNAUTHORIZED') {
                return false;
              }
              // Only retry idempotent mutations (GET-like operations)
              // For now, disable mutation retries to avoid duplicate operations
              return false;
            },
            networkMode: 'online',
          },
        },
      })
  );

  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${getBaseUrl()}/api/trpc`,
          transformer: superjson,
          // 5 second timeout for HTTP requests
          fetch(url, options) {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);

            return fetch(url, {
              ...options,
              signal: controller.signal,
            }).finally(() => clearTimeout(timeoutId));
          },
          headers() {
            return {
              // Standard Next.js client headers will be automatically included
            };
          },
        }),
      ],
    })
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </trpc.Provider>
  );
}
