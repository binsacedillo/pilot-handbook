import { validatePerformanceInput } from "./validation";

export type SafetyStatus = 'NORMAL' | 'CAUTION' | 'WARNING' | 'INVALID';

export interface FlightSafetyDecision {
  status: SafetyStatus;
  reason: string;
  recommendation: string;
  implication: string; // Plain-language consequence
  mentorship: string;  // Tip or common mistake info
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
      recommendation: validationError,
      implication: 'Calculations cannot be safely performed with the provided data.',
      mentorship: 'Ensure all required fields are filled correctly according to the POH.'
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
        status: 'NORMAL',
        reason: 'Unknown evaluation type',
        recommendation: 'Verify result with POH manually.',
        implication: 'Safety status could not be automatically determined.',
        mentorship: 'When in doubt, always refer to the certified Aircraft Flight Manual (AFM) for your specific aircraft serial number.'
      };
  }
}

function evaluateDensityAltitude(data: { densityAltitude: number }): FlightSafetyDecision {
  const { densityAltitude } = data;
  
  if (densityAltitude > 8000) {
    return {
      status: 'WARNING',
      reason: 'Severe Density Altitude',
      recommendation: 'Extreme performance loss. Flight not recommended for naturally aspirated engines.',
      implication: 'Your aircraft will struggle to climb and requires significantly more runway for takeoff.',
      mentorship: 'High density altitude makes the air "thin," reducing both engine power and wing lift.'
    };
  }
  
  if (densityAltitude > 5000) {
    return {
      status: 'CAUTION',
      reason: 'High Density Altitude',
      recommendation: 'Expect significantly reduced climb rates and longer takeoff distances.',
      implication: 'The aircraft performance is degraded compared to standard sea-level conditions.',
      mentorship: 'Always consult your POH performance charts when outside standard conditions (15°C/29.92").'
    };
  }
  
  return {
    status: 'NORMAL',
    reason: 'Standard conditions',
    recommendation: 'Normal performance expected.',
    implication: 'Atmospheric conditions are ideal for standard aircraft performance.',
    mentorship: 'Did you know? Performance is best in high pressure and low temperature conditions.'
  };
}

function evaluateWeightBalance(data: { isOverweight: boolean; isOutOfCG: boolean; totalWeight: number; maxWeight?: number }): FlightSafetyDecision {
  if (data.isOverweight || data.isOutOfCG) {
    return {
      status: 'WARNING',
      reason: data.isOverweight ? 'Aircraft is Overweight' : 'Center of Gravity Out of Envelope',
      recommendation: 'Flight is hazardous. Redistribute load or reduce weight immediately.',
      implication: 'The aircraft may be unstable, difficult to control, or unable directly to climb.',
      mentorship: 'A rearward CG makes an aircraft more unstable and harder to recover from stalls.'
    };
  }

  // Check for 95% margin
  if (data.maxWeight && data.totalWeight > data.maxWeight * 0.95) {
    return {
      status: 'CAUTION',
      reason: 'Near Maximum Weight',
      recommendation: 'Low climb performance margin. Verify takeoff distance at current density altitude.',
      implication: 'You are close to the structural limit; performance will be noticeably slower.',
      mentorship: 'Heavier aircraft take longer to reach rotation speed and have shallower climb gradients.'
    };
  }

  return {
    status: 'NORMAL',
    reason: 'Within limits',
    recommendation: 'Weight and balance are safe for flight.',
    implication: 'The aircraft weight and distribution are within the safe structural envelope.',
    mentorship: 'Remember: Always secure your baggage to prevent CG shifts during flight.'
  };
}

function evaluateFuel(data: { totalRequired: number; reserveMinutes: number }): FlightSafetyDecision {
  if (data.reserveMinutes < 30) {
    return {
      status: 'WARNING',
      reason: 'Illegal Fuel Reserves',
      recommendation: 'Below VFR day legal minimums. Add fuel or plan an intermediate stop.',
      implication: 'You do not have enough fuel to safely handle delays or diversions.',
      mentorship: 'The FAA requires a 30-minute reserve for day VFR for a reason—don\'t cut it close.'
    };
  }
  
  if (data.reserveMinutes < 45) {
    return {
      status: 'CAUTION',
      reason: 'Minimum Reserves',
      recommendation: 'Legal for day VFR but tight for night/marginal conditions. Consider more fuel.',
      implication: 'Your safety margin is thin if weather or traffic forces a detour.',
      mentorship: 'Many professional pilots use 1 hour as their "personal minimum" for fuel reserves.'
    };
  }
  
  return {
    status: 'NORMAL',
    reason: 'Comfortable reserves',
    recommendation: 'Fuel planning meets safety standards.',
    implication: 'You have a healthy buffer of fuel for standard flight operations.',
    mentorship: 'Tip: Always verify your actual burn rate matched your planning after the flight.'
  };
}
