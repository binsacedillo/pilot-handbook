/**
 * Weigh & Balance Calculation Engine
 * Pure functions for aviation-grade CG and weight limits.
 */

export interface Station {
  id: string;
  name: string;
  weight: number;
  arm: number;
}

export interface EnvelopePoint {
  weight: number;
  arm: number;
}

export interface WBResult {
  totalWeight: number;
  totalMoment: number;
  centerOfGravity: number;
  isOverweight: boolean;
  isOutOfCG: boolean;
  limits: {
    maxWeight: number;
    forwardLimit: number; // At current weight
    aftLimit: number;     // At current weight
  };
}

/**
 * Standard Cessna 172S Baseline Configuration
 * Data source: C172S POH
 */
export const C172S_DEFAULT = {
  maxGrossWeight: 2550,
  emptyWeight: 1642,
  emptyMoment: 62410, // ~38.01 arm
  stations: [
    { id: "front-seats", name: "Pilot & Front Passenger", arm: 37.0 },
    { id: "rear-seats", name: "Rear Passengers", arm: 73.0 },
    { id: "baggage-1", name: "Baggage Area 1 (Max 120lbs)", arm: 95.0 },
    { id: "baggage-2", name: "Baggage Area 2 (Max 50lbs)", arm: 123.0 },
    { id: "fuel", name: "Fuel (6.0 lbs/gal)", arm: 48.0 },
  ],
  // Utility Category Envelope
  envelope: [
    { weight: 1500, arm: 35.0 },
    { weight: 1900, arm: 35.0 },
    { weight: 2550, arm: 41.0 },
    { weight: 2550, arm: 47.3 },
    { weight: 1500, arm: 47.3 },
  ],
};

/**
 * Calculates current Weight & Balance results
 */
export function calculateWB(
  stations: { id: string; weight: number }[],
  config = C172S_DEFAULT
): WBResult {
  let totalWeight = config.emptyWeight;
  let totalMoment = config.emptyMoment;

  stations.forEach((s) => {
    const stationDef = config.stations.find((def) => def.id === s.id);
    if (stationDef) {
      totalWeight += s.weight;
      totalMoment += s.weight * stationDef.arm;
    }
  });

  const cg = totalWeight > 0 ? totalMoment / totalWeight : 0;
  
  // Basic Envelope Check (Linear Interpolation for Forward Limit)
  // Forward limit: 35.0 at 1900 lbs, 41.0 at 2550 lbs
  let forwardLimit = 35.0;
  if (totalWeight > 1900) {
    const ratio = (totalWeight - 1900) / (2550 - 1900);
    forwardLimit = 35.0 + ratio * (41.0 - 35.0);
  }
  
  const aftLimit = 47.3;
  const isOverweight = totalWeight > config.maxGrossWeight;
  const isOutOfCG = cg < forwardLimit || cg > aftLimit;

  return {
    totalWeight,
    totalMoment,
    centerOfGravity: cg,
    isOverweight,
    isOutOfCG,
    limits: {
      maxWeight: config.maxGrossWeight,
      forwardLimit,
      aftLimit,
    },
  };
}
