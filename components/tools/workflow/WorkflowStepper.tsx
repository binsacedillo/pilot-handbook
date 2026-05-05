"use client";

import React from "react";
import { Plane, Scale, Thermometer, Zap, ShieldCheck, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowStep = "AIRCRAFT" | "WB" | "PERFORMANCE" | "FUEL" | "SUMMARY";

export const STEPS: { id: WorkflowStep; title: string; icon: LucideIcon; guidance: string }[] = [
  { id: "AIRCRAFT", title: "Select Aircraft", icon: Plane, guidance: "Choose your aircraft to load its performance profile." },
  { id: "WB", title: "Loading Check", icon: Scale, guidance: "Verify weight and balance to ensure stable flight control." },
  { id: "PERFORMANCE", title: "Performance Check", icon: Thermometer, guidance: "Analyze atmospheric impact on your climb and takeoff." },
  { id: "FUEL", title: "Fuel Planning", icon: Zap, guidance: "Plan fuel reserves to account for delays and diversions." },
  { id: "SUMMARY", title: "Final Review", icon: ShieldCheck, guidance: "Review consolidated readiness before marking as verified." }
];

interface WorkflowStepperProps {
  currentStep: WorkflowStep;
}

export function WorkflowStepper({ currentStep }: WorkflowStepperProps) {
  const currentIndex = STEPS.findIndex(s => s.id === currentStep);

  return (
    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-3 sm:p-4 rounded-3xl shadow-2xl relative overflow-hidden text-left">
      {/* Desktop/iPad Stepper */}
      <div className="hidden md:flex justify-between items-center text-left">
        {STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentIndex > idx;

          return (
            <div key={step.id} className="flex items-center group">
              <div 
                className={cn(
                  "flex flex-col items-center gap-2 transition-all duration-500",
                  isActive ? "scale-110 opacity-100" : isCompleted ? "opacity-60" : "opacity-30"
                )}
              >
                <div className={cn(
                  "p-3 rounded-2xl border transition-all",
                  isActive ? "bg-blue-500 border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.5)] text-white" : 
                  isCompleted ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-500" : "bg-zinc-800 border-zinc-700 text-zinc-400"
                )}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest">
                  {step.title}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="mx-4 lg:mx-8 w-8 lg:w-16 h-[2px] bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className={cn(
                      "h-full bg-blue-500 transition-all duration-1000",
                      isCompleted ? "w-full" : "w-0"
                    )} 
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Stepper - Single Active Mode */}
      <div className="md:hidden flex items-center justify-between px-2 text-left">
        <div className="flex items-center gap-4">
          <div className="bg-blue-500 p-3 rounded-2xl text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]">
             {React.createElement(STEPS[currentIndex]?.icon || Plane, { className: "w-5 h-5" })}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
              Step {currentIndex + 1} / {STEPS.length}
            </p>
            <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">
              {STEPS[currentIndex]?.title}
            </h2>
          </div>
        </div>
        <div className="flex gap-1">
           {STEPS.map((_, i) => (
             <div 
               key={i} 
               className={cn(
                 "w-1.5 h-1.5 rounded-full transition-all duration-300",
                 i === currentIndex ? "bg-blue-500 w-4" : "bg-zinc-800"
               )} 
             />
           ))}
        </div>
      </div>
    </div>
  );
}
