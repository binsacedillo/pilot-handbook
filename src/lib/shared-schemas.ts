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
  make: z.string().min(1, 'Aircraft make is required').max(100, 'Make too long'),
  model: z.string().min(1, 'Aircraft model is required').max(100, 'Model too long'),
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

const flightBaseSchema = z.object({
  date: z.date().max(new Date(), { message: 'Flight date cannot be in the future' }),
  departureCode: z.string().min(3).max(4),
  arrivalCode: z.string().min(3).max(4),
  duration: z.number().min(0.1, 'Duration must be at least 0.1 hours'),
  picTime: z.number().min(0, 'PIC time cannot be negative'),
  dualTime: z.number().min(0, 'Dual time cannot be negative'),
  // Add other duration fields as needed (e.g., night, instrument)
  dayLandings: z.number().int().min(0),
  nightLandings: z.number().int().min(0),
  remarks: z.string().max(500, 'Remarks limited to 500 characters').optional(),
  aircraftId: z.string().min(1, 'Aircraft is required'),
});

const flightDurationGuard = (data: { duration?: number; picTime?: number; dualTime?: number }, ctx: z.RefinementCtx) => {
  if (data.duration !== undefined && data.picTime !== undefined && data.picTime > data.duration) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'PIC or Dual time cannot exceed total flight duration',
      path: ['picTime'],
    });
  }
  if (data.duration !== undefined && data.dualTime !== undefined && data.dualTime > data.duration) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'PIC or Dual time cannot exceed total flight duration',
      path: ['dualTime'],
    });
  }
};

export const createFlightSchema = flightBaseSchema.superRefine((data, ctx) => {
  flightDurationGuard(data, ctx);
});

export const updateFlightSchema = flightBaseSchema.partial().extend({
  id: z.string().min(1, 'Flight ID is required'),
}).superRefine((data, ctx) => {
  flightDurationGuard(data, ctx);
});
