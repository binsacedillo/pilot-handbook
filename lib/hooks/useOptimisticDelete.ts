import { useCallback } from "react";

/**
 * useOptimisticDelete Hook - REFERENCE PATTERN
 *
 * ⚠️ This is a reference/documentation pattern showing how to implement optimistic updates
 * for delete operations. It is NOT currently used in the active codebase.
 * 
 * Provides optimistic updates for delete operations. This hook manages:
 * - Immediate removal of items from the UI (optimistic update)
 * - Rollback if the server request fails
 * - Loading state tracking
 *
 * @example
 * const { optimisticItems, deleteItem } = useOptimisticDelete(items, (id) => mutation.mutate({ id }));
 *
 * {optimisticItems.map(item => (
 *   <div key={item.id}>
 *     {item.name}
 *     <button onClick={() => deleteItem(item.id)} disabled={isPending}>Delete</button>
 *   </div>
 * ))}
 * 
 * @see DELETE_PATTERN.md for complete delete pattern documentation
 */
export function useOptimisticDelete<T extends { id: string | number }>(
  items: T[],
  onDelete: (id: string | number) => Promise<void> | void
) {
  const [optimisticItems, setOptimisticItems] = Array.isArray(items)
    ? [items, (newItems: T[]) => newItems]
    : [[], () => {}];

  const deleteItem = useCallback(
    async (id: string | number) => {
      // Optimistically remove the item
      const originalItems = optimisticItems;
      setOptimisticItems(optimisticItems.filter((item) => item.id !== id));

      try {
        // Send delete request to server
        await onDelete(id);
      } catch (error) {
        // Rollback on error
        setOptimisticItems(originalItems);
        throw error;
      }
    },
    [optimisticItems, setOptimisticItems, onDelete]
  );

  return {
    optimisticItems,
    deleteItem,
  };
}

/**
 * Alternative: Simple optimistic state management using local React state
 * This version doesn't depend on external state management
 *
 * @example
 * const [items, setItems] = useState<Flight[]>([...]);
 * const handleDelete = async (id: string) => {
 *   const originalItems = items;
 *   setItems(prev => prev.filter(item => item.id !== id)); // optimistic
 *
 *   try {
 *     await trpc.flight.delete.mutate({ id });
 *   } catch (error) {
 *     setItems(originalItems); // rollback
 *     throw error;
 *   }
 * };
 */

/**
 * Pattern for use with React Query / TanStack Query
 * Provides automatic optimistic updates with React Query's mutation system
 *
 * @example
 * const deleteMutation = trpc.flight.delete.useMutation({
 *   onMutate: async (deletedId) => {
 *     // Cancel outgoing fetches
 *     await queryClient.cancelQueries({ queryKey: ['flight', 'getAll'] });
 *
 *     // Snapshot previous data
 *     const previousFlights = queryClient.getQueryData(['flight', 'getAll']);
 *
 *     // Optimistically remove from cache
 *     queryClient.setQueryData(['flight', 'getAll'], (old?: Flight[]) =>
 *       old?.filter(f => f.id !== deletedId)
 *     );
 *
 *     return { previousFlights };
 *   },
 *   onError: (err, deletedId, context) => {
 *     // Rollback on error
 *     if (context?.previousFlights) {
 *       queryClient.setQueryData(['flight', 'getAll'], context.previousFlights);
 *     }
 *   },
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['flight', 'getAll'] });
 *   },
 * });
 */
