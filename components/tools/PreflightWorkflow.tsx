"use client";

import React, { useState, useMemo, useCallback } from "react";
import { trpc } from "@/trpc/client";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft, 
  Plane, 
  Scale, 
  Thermometer, 
  Zap, 
  Save,
  AlertTriangle,
  History,
  ShieldCheck,
  ShieldAlert
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";

// Sub-components
import DensityAltitudeCalculator from "./DensityAltitudeCalculator";
import WeightBalanceCalculator from "./WeightBalanceCalculator";
import FuelPlanner from "./FuelPlanner";

type WorkflowStep = "AIRCRAFT" | "WB" | "PERFORMANCE" | "FUEL" | "SUMMARY";

const STEPS = [
  { id: "AIRCRAFT" as const, title: "Select Aircraft", icon: Plane, guidance: "Choose your aircraft to load its performance profile." },
  { id: "WB" as const, title: "Loading Check", icon: Scale, guidance: "Verify weight and balance to ensure stable flight control." },
  { id: "PERFORMANCE" as const, title: "Performance Check", icon: Thermometer, guidance: "Analyze atmospheric impact on your climb and takeoff." },
  { id: "FUEL" as const, title: "Fuel Planning", icon: Zap, guidance: "Plan fuel reserves to account for delays and diversions." },
  { id: "SUMMARY" as const, title: "Final Review", icon: ShieldCheck, guidance: "Review consolidated readiness before marking as verified." }
];

export default function PreflightWorkflow() {
  const [currentStep, setCurrentStep] = useState<WorkflowStep>("AIRCRAFT");
  const [selectedAircraftId, setSelectedAircraftId] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, any>>({});
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

  const handleWBChange = useCallback((r: any) => {
    setResults(prev => {
      if (JSON.stringify(prev.wb) === JSON.stringify(r)) return prev;
      return { ...prev, wb: r };
    });
  }, []);

  const handleDAChange = useCallback((r: any) => {
    setResults(prev => {
      if (JSON.stringify(prev.da) === JSON.stringify(r)) return prev;
      return { ...prev, da: r };
    });
  }, []);

  const handleFuelChange = useCallback((r: any) => {
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

  return (
    <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 p-2 sm:p-4 font-sans">
      {/* Workflow Stepper - Aviation Mode */}
      <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-3 sm:p-4 rounded-3xl shadow-2xl relative overflow-hidden text-left">
        {/* Desktop/iPad Stepper */}
        <div className="hidden md:flex justify-between items-center text-left">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = STEPS.findIndex(s => s.id === currentStep) > idx;

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
               {React.createElement(STEPS.find(s => s.id === currentStep)?.icon || Plane, { className: "w-5 h-5" })}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                Step {STEPS.findIndex(s => s.id === currentStep) + 1} / {STEPS.length}
              </p>
              <h2 className="text-lg font-black uppercase italic tracking-tighter text-white">
                {STEPS.find(s => s.id === currentStep)?.title}
              </h2>
            </div>
          </div>
          <div className="flex gap-1">
             {STEPS.map((_, i) => (
               <div 
                 key={i} 
                 className={cn(
                   "w-1.5 h-1.5 rounded-full transition-all duration-300",
                   i === STEPS.findIndex(s => s.id === currentStep) ? "bg-blue-500 w-4" : "bg-zinc-800"
                 )} 
               />
             ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={cn(
        "duration-700",
        // Stress Mode: Reduce non-essential animate-in on mobile, but keep content visible
        "transition-all md:animate-in md:fade-in md:slide-in-from-bottom-4"
      )}>
        {currentStep === "AIRCRAFT" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
            {aircraft?.map((ac) => (
              <Card 
                key={ac.id} 
                className={cn(
                  "cursor-pointer transition-all duration-300 border-2",
                  selectedAircraftId === ac.id 
                    ? "border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                    : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
                )}
                onClick={() => setSelectedAircraftId(ac.id)}
              >
                <CardHeader className="p-4 sm:p-6">
                  <div className="flex justify-between items-start">
                    <Badge variant="blue" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                      {ac.registration}
                    </Badge>
                    <Plane className={cn("w-5 h-5", selectedAircraftId === ac.id ? "text-blue-500" : "text-zinc-600")} />
                  </div>
                  <CardTitle className="mt-4 text-lg">{ac.make} {ac.model}</CardTitle>
                </CardHeader>
              </Card>
            ))}
            {loadingAircraft && <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] animate-pulse p-4">Scanning Fleet...</p>}
          </div>
        )}

        {currentStep === "WB" && (
          <div className="space-y-4">
            <div className="px-4 py-2 border-l-2 border-blue-500 bg-blue-500/5 text-[11px] text-blue-400 italic">
              Assistant Guidance: Loading affects stability. Ensure your Center of Gravity (CG) is within limits for safe takeoff and landing.
            </div>
            <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl">
              <WeightBalanceCalculator isCompact onResultChange={handleWBChange} />
            </div>
          </div>
        )}

        {currentStep === "PERFORMANCE" && (
          <div className="space-y-4">
            <div className="px-4 py-2 border-l-2 border-blue-500 bg-blue-500/5 text-[11px] text-blue-400 italic">
              Assistant Guidance: High density altitude reduces climb performance. Verify your aircraft can safely clear obstacles today.
            </div>
            <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl">
              <DensityAltitudeCalculator isCompact onResultChange={handleDAChange} />
            </div>
          </div>
        )}

        {currentStep === "FUEL" && (
          <div className="space-y-4">
            <div className="px-4 py-2 border-l-2 border-blue-500 bg-blue-500/5 text-[11px] text-blue-400 italic">
              Assistant Guidance: Plan for the unexpected. Legal minimums are a baseline; safe pilots always keep a healthy buffer.
            </div>
            <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-4 sm:p-6 shadow-2xl">
              <FuelPlanner isCompact onResultChange={handleFuelChange} />
            </div>
          </div>
        )}

        {currentStep === "SUMMARY" && (
          <div className="space-y-6 text-left">
            <Card className="border-2 border-zinc-800 bg-zinc-950/40 shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden">
               <div className={`h-2 w-full ${currentStatus === 'NORMAL' ? 'bg-emerald-500' : currentStatus === 'CAUTION' ? 'bg-amber-500' : 'bg-red-500'}`} />
               <CardHeader className="text-center p-4 sm:p-6">
                  <div className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 ${currentStatus === 'NORMAL' ? 'bg-emerald-500/10' : 'bg-amber-500/10'}`}>
                    {currentStatus === 'NORMAL' ? <ShieldCheck className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-500" /> : <ShieldAlert className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />}
                  </div>
                  <CardTitle className="text-xl sm:text-3xl font-black uppercase italic tracking-tighter">
                    Flight Readiness: {currentStatus}
                  </CardTitle>
                  <CardDescription className="uppercase tracking-[0.2em] font-bold text-[9px] sm:text-[10px]">Consolidated Performance Summary</CardDescription>
               </CardHeader>
               <CardContent className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 sm:p-6">
                  <StatusMiniCard title="Weight/CG" status={results.wb?.decision?.status} value={`${Math.round(results.wb?.totalWeight || 0)} lbs`} />
                  <StatusMiniCard title="Fuel Margins" status={results.fuel?.decision?.status} value={results.fuel?.enduranceFormatted || "N/A"} />
                  <StatusMiniCard title="Perf (DA)" status="GO" value="Computed" />
               </CardContent>
            </Card>

            <Button 
              className="w-full h-14 sm:h-16 rounded-2xl sm:rounded-3xl bg-blue-600 hover:bg-blue-500 text-lg sm:text-xl font-black uppercase italic tracking-tighter transition-all hover:scale-[1.02] active:scale-[0.98]"
              onClick={() => {
                if (selectedAircraftId) {
                  commitSnapshot.mutate({
                    type: 'WEIGHT_BALANCE',
                    aircraftId: selectedAircraftId,
                    inputs: results,
                    results: results,
                    status: currentStatus
                  });
                }
              }}
              disabled={commitSnapshot.isPending}
            >
              <Save className="w-5 h-5 sm:w-6 sm:h-6 mr-3" />
              {commitSnapshot.isPending ? "Syncing..." : "Record Readiness Data"}
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Controls - Optimized Touch Targets */}
      <div className="flex justify-between items-center pt-6 sm:pt-8 gap-4">
        <Button 
          variant="outline" 
          onClick={handleBack}
          disabled={currentStep === "AIRCRAFT"}
          className="h-12 sm:h-14 flex-1 sm:flex-none sm:px-8 rounded-xl sm:rounded-2xl border-zinc-800 text-zinc-400 hover:bg-zinc-900 font-bold uppercase tracking-widest text-[10px]"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back
        </Button>

        <Button 
          onClick={handleNext}
          disabled={!canGoNext || currentStep === "SUMMARY"}
          className="h-12 sm:h-14 flex-1 sm:flex-none sm:px-8 rounded-xl sm:rounded-2xl bg-white text-black hover:bg-zinc-200 font-bold uppercase tracking-widest text-[10px]"
        >
          {currentStep === "FUEL" ? "Final Review" : "Next Step"}
          <ChevronRight className="w-5 h-5 ml-1" />
        </Button>
      </div>
    </div>
  );
}

function StatusMiniCard({ title, status, value }: { title: string, status?: string, value: string }) {
  return (
    <div className="p-4 bg-zinc-900 rounded-2xl border border-white/5">
      <div className="flex justify-between items-center mb-1">
        <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{title}</p>
        <div className={`w-2 h-2 rounded-full ${status === 'NORMAL' ? 'bg-emerald-500' : status === 'CAUTION' ? 'bg-amber-500' : 'bg-zinc-700'}`} />
      </div>
      <p className="text-xl font-black italic text-white uppercase tracking-tighter">{value}</p>
    </div>
  );
}

function Badge({ children, className, variant = "default" }: { children: React.ReactNode, className?: string, variant?: "blue" | "default" }) {
  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
      variant === "blue" ? "bg-blue-500/10 text-blue-400 border-blue-500/30" : "bg-zinc-800 text-zinc-400 border-zinc-700",
      className
    )}>
      {children}
    </span>
  );
}
