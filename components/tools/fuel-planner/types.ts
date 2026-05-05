import { FlightSafetyDecision } from "@/lib/decision/engine";

export interface FuelPlannerResults {
  tripFuel: number;
  reserveFuel: number;
  taxiFuel: number;
  contingencyFuel: number;
  totalRequired: number;
  enduranceHours: number;
  enduranceFormatted: string;
  decision: FlightSafetyDecision;
}

export interface FuelPlannerProps {
  isCompact?: boolean;
  onResultChange?: (results: FuelPlannerResults) => void;
}
