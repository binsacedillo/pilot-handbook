/**
 * Aviation Math Utilities
 * 
 * IMPORTANT: These calculations are for supplemental planning purposes only.
 * The official Pilot Operating Handbook (POH) or Airplane Flight Manual (AFM)
 * must be used for all flight planning and performance calculations.
 */

/**
 * Calculates Pressure Altitude (PA)
 * Formula: Elevation + (29.92 - Altimeter Setting) * 1000
 * 
 * @param elevation Ground elevation in feet
 * @param altimeter Altimeter setting in inches of mercury (inHg)
 * @returns Pressure Altitude in feet
 */
export function calculatePressureAltitude(elevation: number, altimeter: number): number {
  return Math.round(elevation + (29.92 - altimeter) * 1000);
}

/**
 * Calculates the Standard Temperature (ISA) at a given Pressure Altitude
 * Formula: 15 - (PA / 1000 * 2)
 * 
 * @param pressureAltitude Pressure Altitude in feet
 * @returns Standard Temperature in Celsius
 */
export function calculateISATemperature(pressureAltitude: number): number {
  return 15 - (pressureAltitude / 1000 * 2);
}

/**
 * Calculates Density Altitude (DA)
 * Formula (Approximation): PA + [120 * (OAT - ISA_at_PA)]
 * 
 * @param pressureAltitude Pressure Altitude in feet
 * @param outsideAirTemp Outside Air Temperature (OAT) in Celsius
 * @returns Density Altitude in feet
 */
export function calculateDensityAltitude(pressureAltitude: number, outsideAirTemp: number): number {
  const isaTemp = calculateISATemperature(pressureAltitude);
  return Math.round(pressureAltitude + 120 * (outsideAirTemp - isaTemp));
}

/**
 * Estimates Ground Roll increase based on Density Altitude
 * Rule of Thumb: Ground roll increases by approximately 10% for every 1000ft of DA.
 * 
 * @param baseGroundRoll Standard sea-level ground roll from POH
 * @param densityAltitude Calculated Density Altitude in feet
 * @returns Estimated ground roll in feet
 */
export function estimateGroundRoll(baseGroundRoll: number, densityAltitude: number): number {
  if (densityAltitude <= 0) return baseGroundRoll;
  const increaseFactor = 1 + (0.1 * (densityAltitude / 1000));
  return Math.round(baseGroundRoll * increaseFactor);
}
