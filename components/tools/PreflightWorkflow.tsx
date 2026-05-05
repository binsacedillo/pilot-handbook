"use client";

import React, { useState, useMemo, useCallback } from "react";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

// Sub-components
import DensityAltitudeCalculator from "./DensityAltitudeCalculator";
import WeightBalanceCalculator from "./WeightBalanceCalculator";
import FuelPlanner from "./FuelPlanner";

// Workflow Modules
import { WorkflowStepper, STEPS, WorkflowStep } from "./workflow/WorkflowStepper";
import { AircraftSelection } from "./workflow/AircraftSelection";
import { FlightSummary } from "./workflow/FlightSummary";
import { WorkflowNav } from "./workflow/WorkflowNav";

// Types
import { WeightBalanceResults } from "./weight-balance/types";
import { DensityAltitudeResults } from "./DensityAltitudeCalculator";
import { FuelPlannerResults } from "./fuel-planner/types";

interface WorkflowResults {
  wb?: WeightBalanceResults;
  da?: DensityAltitudeResults;
  fuel?: FuelPlannerResults;
}

/**
 * Preflight Workflow Orchestrator
 * Manages the multi-step flight readiness verification process.
 */
export default function PreflightWorkflow() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("AIRCRAFT");
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [results, setResults] = useState<WorkflowResults>({});
  const { showToast } = useToast();

  const { data: aircraft, isLoading: loadingAircraft } = trpc.aircraft.getAll.useQuery({
    includeArchived: false
  });

  const handleNext = useCallback(() => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex !== -1 && currentIndex < STEPS.length - 1) {
      const nextStep = STEPS[currentIndex + 1];
      if (nextStep) setCurrentStep(nextStep.id);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    const currentIndex = STEPS.findIndex(s => s.id === currentStep);
    if (currentIndex > 0) {
      const prevStep = STEPS[currentIndex - 1];
      if (prevStep) setCurrentStep(prevStep.id);
    }
  }, [currentStep]);

  const canGoNext = useMemo(() => {
    if (currentStep === "AIRCRAFT") return !!selectedAircraftId;
    return true;
  }, [currentStep, selectedAircraftId]);

  const handleWBChange = useCallback((r: WeightBalanceResults) => {
    setResults(prev => {
      if (JSON.stringify(prev.wb) === JSON.stringify(r)) return prev;
      return { ...prev, wb: r };
    });
  }, []);

  const handleDAChange = useCallback((r: DensityAltitudeResults) => {
    setResults(prev => {
      if (JSON.stringify(prev.da) === JSON.stringify(r)) return prev;
      return { ...prev, da: r };
    });
  }, []);

  const handleFuelChange = useCallback((r: FuelPlannerResults) => {
    setResults(prev => {
      if (JSON.stringify(prev.fuel) === JSON.stringify(r)) return prev;
      return { ...prev, fuel: r };
    });
  }, []);

  const commitSnapshot = trpc.decision.logSnapshot.useMutation({
    onSuccess: () => {
      showToast("Flight Data Synced", "success");
      setCurrentStep("SUMMARY");
    },
    onError: (error) => {
      showToast(error.message, "error");
    }
  });

  const currentStatus = useMemo(() => {
    const statuses = Object.values(results).map(r => r?.decision?.status);
    if (statuses.includes('WARNING')) return 'WARNING';
    if (statuses.includes('CAUTION')) return 'CAUTION';
    return 'NORMAL';
  }, [results]);

  const handleCommit = () => {
    if (selectedAircraftId) {
      commitSnapshot.mutate({
        type: 'WEIGHT_BALANCE',
        aircraftId: selectedAircraftId,
        inputs: results,
        results: results,
        status: currentStatus
      });
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-2 sm:p-4 font-sans">
      <WorkflowStepper currentStep={currentStep} />

      <div className={cn(
        "duration-700 transition-all md:animate-in md:fade-in md:slide-in-from-bottom-4"
      )}>
        {currentStep === "AIRCRAFT" && (
          <AircraftSelection 
            aircraft={aircraft} 
            loading={loadingAircraft} 
            selectedId={selectedAircraftId} 
            onSelect={setSelectedAircraftId} 
          />
        )}

        {currentStep === "WB" && (
          <div className="space-y-4">
            <GuidanceBox text="Assistant Guidance: Loading affects stability. Ensure your Center of Gravity (CG) is within limits for safe takeoff and landing." />
            <CalculatorBox>
              <WeightBalanceCalculator isCompact onResultChange={handleWBChange} />
            </CalculatorBox>
          </div>
        )}

        {currentStep === "PERFORMANCE" && (
          <div className="space-y-4">
            <GuidanceBox text="Assistant Guidance: High density altitude reduces climb performance. Verify your aircraft can safely clear obstacles today." />
            <CalculatorBox>
              <DensityAltitudeCalculator isCompact onResultChange={handleDAChange} />
            </CalculatorBox>
          </div>
        )}

        {currentStep === "FUEL" && (
          <div className="space-y-4">
            <GuidanceBox text="Assistant Guidance: Plan for the unexpected. Legal minimums are a baseline; safe pilots always keep a healthy buffer." />
            <CalculatorBox>
              <FuelPlanner isCompact onResultChange={handleFuelChange} />
            </CalculatorBox>
          </div>
        )}

        {currentStep === "SUMMARY" && (
          <FlightSummary 
            results={results} 
            currentStatus={currentStatus} 
            isPending={commitSnapshot.isPending} 
            onCommit={handleCommit} 
          />
        )}
      </div>

      <WorkflowNav 
        onBack={handleBack} 
        onNext={handleNext} 
        canGoBack={currentStep !== "AIRCRAFT"} 
        canGoNext={canGoNext} 
        isLastStep={currentStep === "FUEL"} 
      />
    </div>
  );
}

function GuidanceBox({ text }: { text: string }) {
  return (
    <div className="px-4 py-2 border-l-2 border-blue-500 bg-blue-500/5 text-[11px] text-blue-400 italic text-left">
      {text}
    </div>
  );
}

function CalculatorBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl">
      {children}
    </div>
  );
}
