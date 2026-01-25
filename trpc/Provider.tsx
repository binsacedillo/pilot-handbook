'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import { trpc } from './client';

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
  const [queryClient] = useState(
    () =>
      new QueryClient({
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
              // Ensure cookies are sent with requests for auth
              credentials: 'include',
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
