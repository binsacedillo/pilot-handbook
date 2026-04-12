/**
 * Fuel Planning Calculation Engine
 * Pure functions for estimating fuel burn and endurance.
 */

export interface FuelResult {
  tripFuel: number;
  reserveFuel: number;
  taxiFuel: number;
  contingencyFuel: number;
  totalRequired: number;
  enduranceHours: number;
  enduranceFormatted: string;
}

export const FUEL_CONSTANTS = {
  TAXI_FUEL_DEFAULT: 1.1, // Gallons for C172S
  CONTINGENCY_PERCENT: 0.1, // 10%
  VFR_NIGHT_RESERVE_MINS: 45,
  VFR_DAY_RESERVE_MINS: 30,
};

/**
 * Calculates fuel requirements based on trip parameters
 */
export function calculateFuel(params: {
  distance: number;
  groundspeed: number;
  burnRate: number; // GPH
  reserveMinutes: number;
  taxiFuel?: number;
}): FuelResult {
  const { distance, groundspeed, burnRate, reserveMinutes } = params;
  const taxiFuel = params.taxiFuel ?? FUEL_CONSTANTS.TAXI_FUEL_DEFAULT;

  // Trip time in hours
  const tripTime = groundspeed > 0 ? distance / groundspeed : 0;
  const tripFuel = tripTime * burnRate;
  
  const reserveFuel = (reserveMinutes / 60) * burnRate;
  const contingencyFuel = tripFuel * FUEL_CONSTANTS.CONTINGENCY_PERCENT;
  
  const totalRequired = taxiFuel + tripFuel + reserveFuel + contingencyFuel;
  
  const enduranceHours = burnRate > 0 ? (totalRequired / burnRate) : 0;
  
  const wholeHours = Math.floor(enduranceHours);
  const minutes = Math.round((enduranceHours - wholeHours) * 60);

  return {
    tripFuel: parseFloat(tripFuel.toFixed(1)),
    reserveFuel: parseFloat(reserveFuel.toFixed(1)),
    taxiFuel: parseFloat(taxiFuel.toFixed(1)),
    contingencyFuel: parseFloat(contingencyFuel.toFixed(1)),
    totalRequired: parseFloat(totalRequired.toFixed(1)),
    enduranceHours,
    enduranceFormatted: `${wholeHours}h ${minutes}m`,
  };
}
