"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

import { WorkflowStep } from "./WorkflowStepper";

interface WorkflowNavProps {
  onBack: () => void;
  onNext: () => void;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  currentStep: WorkflowStep;
}

export function WorkflowNav({ onBack, onNext, canGoBack, canGoNext, isLastStep, currentStep }: WorkflowNavProps) {
  return (
    <div className="flex justify-between items-center pt-6 sm:pt-8 gap-4">
      <Button 
        variant="outline" 
        onClick={onBack}
        disabled={!canGoBack}
        className="h-12 sm:h-14 flex-1 sm:flex-none sm:px-8 rounded-xl sm:rounded-2xl border-zinc-800 text-zinc-400 hover:bg-zinc-900 font-bold uppercase tracking-widest text-[10px]"
      >
        <ChevronLeft className="w-5 h-5 mr-1" />
        Back
      </Button>

      {currentStep !== "SUMMARY" && (
        <Button 
          onClick={onNext}
          disabled={!canGoNext}
          className="h-12 sm:h-14 flex-1 sm:flex-none sm:px-8 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest text-[10px]"
        >
          {isLastStep ? "Final Review" : "Next Step"}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      )}
    </div>
  );
}
