import { z } from "zod";

/**
 * Performance Validation Schemas
 * Implements "Guardrails" for flight planning inputs.
 */

export const densityAltitudeSchema = z.object({
  elevation: z.number()
    .min(-1000, "Elevation too low (min -1,000 ft)")
    .max(15000, "Elevation too high for GA aircraft (max 15,000 ft)"),
  altimeter: z.number()
    .min(27.0, "Altimeter reading unusually low (min 27.0 inHg)")
    .max(32.0, "Altimeter reading unusually high (max 32.0 inHg)"),
  temperature: z.number()
    .min(-50, "Temperature too low (min -50°C)")
    .max(60, "Temperature too high (max 60°C)"),
});

export const weightBalanceSchema = z.object({
  totalWeight: z.number()
    .max(2550, "MTOW Exceeded: Total weight exceeds 2,550 lbs limit"),
  isOverweight: z.boolean(),
  isOutOfCG: z.boolean(),
});

export const fuelPlanSchema = z.object({
  distance: z.number().min(0, "Distance cannot be negative"),
  groundspeed: z.number().min(1, "Groundspeed must be at least 1 kt"),
  burnRate: z.number().min(1, "Burn rate must be at least 1 GPH"),
  reserveMinutes: z.number().min(30, "FAA Violation: Reserve must be at least 30 mins"),
});

export type DensityAltitudeInput = z.infer<typeof densityAltitudeSchema>;
export type WeightBalanceInput = z.infer<typeof weightBalanceSchema>;
export type FuelPlanInput = z.infer<typeof fuelPlanSchema>;

/**
 * Validates performance data against Zod schemas.
 * Returns the error message if invalid, or null if valid.
 */
export function validatePerformanceInput(type: 'density-altitude' | 'weight-balance' | 'fuel', data: any): string | null {
  let schema;
  switch (type) {
    case 'density-altitude':
      schema = densityAltitudeSchema;
      break;
    case 'weight-balance':
      schema = weightBalanceSchema;
      break;
    case 'fuel':
      schema = fuelPlanSchema;
      break;
  }

  const result = schema.safeParse(data);
  if (!result.success) {
    return result.error.issues[0]?.message || "Invalid input";
  }
  return null;
}
