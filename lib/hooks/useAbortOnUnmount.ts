import { useEffect, useMemo } from 'react';

/**
 * Hook that provides an AbortController that automatically aborts on component unmount.
 * Use this to cancel pending requests when a component is unmounted.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const abortController = useAbortOnUnmount();
 *   
 *   useEffect(() => {
 *     fetch('/api/data', { signal: abortController.signal })
 *       .then(res => res.json())
 *       .catch(err => {
 *         if (err.name === 'AbortError') {
 *           console.log('Request cancelled');
 *         }
 *       });
 *   }, []);
 * }
 * ```
 */
export function useAbortOnUnmount(): AbortController {
  const abortController = useMemo(() => new AbortController(), []);

  useEffect(() => {
    return () => {
      // Abort all pending requests on unmount
      abortController.abort();
    };
  }, [abortController]);

  return abortController;
}

/**
 * Hook that returns a stable abort signal that is aborted on unmount.
 * Use this directly with fetch or tRPC queries.
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const abortSignal = useAbortSignal();
 *   
 *   const { data } = trpc.user.get.useQuery(
 *     { id: '123' },
 *     { 
 *       context: { signal: abortSignal },
 *       enabled: !!abortSignal 
 *     }
 *   );
 * }
 * ```
 */
export function useAbortSignal(): AbortSignal {
  const controller = useAbortOnUnmount();
  return controller.signal;
}
