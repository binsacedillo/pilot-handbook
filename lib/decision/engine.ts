import { validatePerformanceInput } from "./validation";

export type SafetyStatus = 'GO' | 'CAUTION' | 'NO_GO' | 'INVALID';

export interface FlightSafetyDecision {
  status: SafetyStatus;
  reason: string;
  recommendation: string;
}

/**
 * Evaluates flight safety based on performance calculation results.
 * This wraps existing outputs to provide "Success Beyond CRUD" logic.
 */
export function evaluateFlightSafety(type: 'density-altitude' | 'weight-balance' | 'fuel', data: any): FlightSafetyDecision {
  // 1. Validate Input First (Phase 2 Guardrails)
  const validationError = validatePerformanceInput(type, data);
  if (validationError) {
    return {
      status: 'INVALID',
      reason: 'Validation Error',
      recommendation: validationError
    };
  }

  switch (type) {
    case 'density-altitude':
      return evaluateDensityAltitude(data);
    case 'weight-balance':
      return evaluateWeightBalance(data);
    case 'fuel':
      return evaluateFuel(data);
    default:
      return {
        status: 'GO',
        reason: 'Unknown evaluation type',
        recommendation: 'Verify result with POH manually.'
      };
  }
}

function evaluateDensityAltitude(data: { densityAltitude: number }): FlightSafetyDecision {
  const { densityAltitude } = data;
  
  if (densityAltitude > 8000) {
    return {
      status: 'NO_GO',
      reason: 'Severe Density Altitude',
      recommendation: 'Extreme performance loss. Flight not recommended for naturally aspirated engines.'
    };
  }
  
  if (densityAltitude > 5000) {
    return {
      status: 'CAUTION',
      reason: 'High Density Altitude',
      recommendation: 'Expect significantly reduced climb rates and longer takeoff distances.'
    };
  }
  
  return {
    status: 'GO',
    reason: 'Standard conditions',
    recommendation: 'Normal performance expected.'
  };
}

function evaluateWeightBalance(data: { isOverweight: boolean; isOutOfCG: boolean; totalWeight: number; maxWeight?: number }): FlightSafetyDecision {
  if (data.isOverweight || data.isOutOfCG) {
    return {
      status: 'NO_GO',
      reason: data.isOverweight ? 'Aircraft is Overweight' : 'Center of Gravity Out of Envelope',
      recommendation: 'Flight is hazardous. Redistribute load or reduce weight immediately.'
    };
  }

  // Check for 95% margin
  if (data.maxWeight && data.totalWeight > data.maxWeight * 0.95) {
    return {
      status: 'CAUTION',
      reason: 'Near Maximum Weight',
      recommendation: 'Low climb performance margin. Verify takeoff distance at current density altitude.'
    };
  }

  return {
    status: 'GO',
    reason: 'Within limits',
    recommendation: 'Weight and balance are safe for flight.'
  };
}

function evaluateFuel(data: { totalRequired: number; reserveMinutes: number }): FlightSafetyDecision {
  if (data.reserveMinutes < 30) {
    return {
      status: 'NO_GO',
      reason: 'Illegal Fuel Reserves',
      recommendation: 'Below VFR day legal minimums. Add fuel or plan an intermediate stop.'
    };
  }
  
  if (data.reserveMinutes < 45) {
    return {
      status: 'CAUTION',
      reason: 'Minimum Reserves',
      recommendation: 'Legal for day VFR but tight for night/marginal conditions. Consider more fuel.'
    };
  }
  
  return {
    status: 'GO',
    reason: 'Comfortable reserves',
    recommendation: 'Fuel planning meets safety standards.'
  };
}
