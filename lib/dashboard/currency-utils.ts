/**
 * Dashboard & Legality Decision Engine
 * Pure functions for consolidated Go/No-Go logic.
 */

import { differenceInDays, isAfter, subDays, differenceInHours } from "date-fns";

export interface DashboardLegalityStatus {
  isTotalGo: boolean;
  landingCurrency: {
    isCurrent: boolean;
    count: number;
    daysRemaining: number;
  };
  medical: {
    isCurrent: boolean;
    expiryDate: Date | null;
    daysRemaining: number;
  };
  rest: {
    isCurrent: boolean;
    lastRestDate: Date | null;
    hoursSinceRest: number;
  };
  alerts: string[];
}

/**
 * Aggregates all legality checks into a single Go/No-Go decision.
 */
export function calculateOverallLegality(params: {
  flights: Array<{ date: Date; dayLandings: number; nightLandings: number }>;
  medicalExpiry: Date | null;
  lastRestDate: Date | null;
}): DashboardLegalityStatus {
  const now = new Date();
  const alerts: string[] = [];

  // 1. Landing Currency (FAA 61.57 - 90 days)
  const ninetyDaysAgo = subDays(now, 90);
  const recentFlights = params.flights.filter(f => new Date(f.date) >= ninetyDaysAgo);
  const totalLandings = recentFlights.reduce((sum, f) => {
    const day = typeof f.dayLandings === 'number' ? f.dayLandings : 0;
    const night = typeof f.nightLandings === 'number' ? f.nightLandings : 0;
    return sum + (day + night);
  }, 0);
  const isLandingCurrent = totalLandings >= 3;

  if (!isLandingCurrent) {
    alerts.push(`Currency Alert: ${3 - totalLandings} more landings required for passenger carrying.`);
  }

  // 2. Medical Validity
  const isMedicalCurrent = params.medicalExpiry ? isAfter(new Date(params.medicalExpiry), now) : false;
  const medicalDaysRemaining = params.medicalExpiry 
    ? differenceInDays(new Date(params.medicalExpiry), now) 
    : -1;

  if (!isMedicalCurrent) {
    alerts.push("System Alert: Medical Certificate is expired or missing.");
  } else if (medicalDaysRemaining < 30) {
    alerts.push(`Medical Advisory: Certificate expires in ${medicalDaysRemaining} days.`);
  }

  // 3. Rest Requirements (Approximate 10-hour rule for dashboard glance)
  // Logic: Must have completed a rest period within the last 24 hours.
  const hoursSinceRest = params.lastRestDate 
    ? differenceInHours(now, new Date(params.lastRestDate)) 
    : 999;
  const isRestCurrent = hoursSinceRest <= 24 && hoursSinceRest >= 0;

  if (!isRestCurrent) {
    alerts.push("Rest Warning: Standard rest period requirement not recorded in last 24h.");
  }

  const isTotalGo = isLandingCurrent && isMedicalCurrent && isRestCurrent;

  return {
    isTotalGo,
    landingCurrency: {
      isCurrent: isLandingCurrent,
      count: totalLandings,
      daysRemaining: 90, // Bound by FAA reg
    },
    medical: {
      isCurrent: isMedicalCurrent,
      expiryDate: params.medicalExpiry,
      daysRemaining: medicalDaysRemaining,
    },
    rest: {
      isCurrent: isRestCurrent,
      lastRestDate: params.lastRestDate,
      hoursSinceRest,
    },
    alerts,
  };
}
