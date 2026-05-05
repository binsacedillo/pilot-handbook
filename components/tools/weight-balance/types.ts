import { FlightSafetyDecision } from "@/lib/decision/engine";

export interface WeightBalanceResults {
  totalWeight: number;
  centerOfGravity: number;
  totalMoment: number;
  isOverweight: boolean;
  isOutOfCG: boolean;
  decision: FlightSafetyDecision;
  margin: number;
  isNearLimit: boolean;
}

export interface WeightBalanceCalculatorProps {
  isCompact?: boolean;
  onResultChange?: (results: WeightBalanceResults) => void;
}
