import { z } from 'zod';

// Pagination & Search (Used in Admin and User lists)
export const paginationSchema = z.object({
  skip: z.number().default(0),
  take: z.number().default(10),
  search: z.string().optional(),
});

// Common ID (Used in Delete/Update)
export const idSchema = z.object({ 
  id: z.string() 
});
