import { z } from 'zod';

// Pagination & Search (Used in Admin and User lists)
export const paginationSchema = z.object({
  skip: z.number().default(0),
  take: z.number().default(10),
  search: z.string().optional(),
});

// Common ID (Used in Delete/Update)
export const idSchema = z.object({
  id: z.string().min(1, 'Required'),
});

// ============================================================================
// AIRCRAFT SCHEMAS
// ============================================================================

export const createAircraftSchema = z.object({
  make: z.string().min(1, 'Aircraft make is required'),
  model: z.string().min(1, 'Aircraft model is required'),
  registration: z.string().min(1, 'Registration number is required').max(20, 'Registration number too long'),
  imageUrl: z.string().url().optional().or(z.literal('')),
  status: z.string().default('operational'),
  flightHours: z.number().min(0).optional(),
});

export const updateAircraftSchema = createAircraftSchema.partial().extend({
  id: z.string().min(1, 'Aircraft ID is required'),
  flightHours: z.number().min(0).optional(),
});

// ============================================================================
// FLIGHT SCHEMAS
// ============================================================================

export const createFlightSchema = z.object({
  date: z.date().max(new Date(), { message: 'Flight date cannot be in the future' }),
  departureCode: z.string().min(3).max(4),
  arrivalCode: z.string().min(3).max(4),
  duration: z.number().min(0.1, 'Duration must be at least 0.1 hours'),
  picTime: z.number().min(0, 'PIC time cannot be negative'),
  dualTime: z.number().min(0, 'Dual time cannot be negative'),
  // Add other duration fields as needed (e.g., night, instrument)
  dayLandings: z.number().int().min(0),
  nightLandings: z.number().int().min(0),
  remarks: z.string().optional(),
  aircraftId: z.string().min(1, 'Aircraft is required'),
});

export const updateFlightSchema = createFlightSchema.partial().extend({
  id: z.string().min(1, 'Flight ID is required'),
});
