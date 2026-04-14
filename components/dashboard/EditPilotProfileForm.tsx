"use client";

import React from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { trpc } from "@/trpc/client";
import { useToast } from "@/components/ui/toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard, GlassCardContent, GlassCardHeader } from "@/components/ui/GlassCard";
import { 
  Save, 
  RotateCcw, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ExternalLink,
  Medal,
  Award,
  GraduationCap,
  Star
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

// Schema for PilotProfile validation
const pilotProfileSchema = z.object({
  licenseNumber: z.string().min(1, "License number is required"),
  licenseType: z.string().min(1, "License type is required (e.g., PPL, CPL)"),
  medicalClass: z.number().min(1).max(3),
  medicalExpiry: z.string().min(1, "Medical expiry date is required"),
  lastRestDate: z.string().min(1, "Last rest date is required"),
  totalHoursGoal: z.number().min(0),
});

type PilotProfileFormValues = z.infer<typeof pilotProfileSchema>;

interface EditPilotProfileFormProps {
  initialData?: any;
  onSuccess?: () => void;
}

export default function EditPilotProfileForm({ initialData, onSuccess }: EditPilotProfileFormProps) {
  const { showToast } = useToast();
  const utils = trpc.useContext();

  // Helper to format date for input[type="date"]
  const formatDateForInput = (date: any) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toISOString().split("T")[0];
  };

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<PilotProfileFormValues>({
    resolver: zodResolver(pilotProfileSchema),
    defaultValues: {
      licenseNumber: initialData?.licenseNumber || "",
      licenseType: initialData?.licenseType || "PPL",
      medicalClass: initialData?.medicalClass || 3,
      medicalExpiry: formatDateForInput(initialData?.medicalExpiry),
      lastRestDate: formatDateForInput(initialData?.lastRestDate),
      totalHoursGoal: initialData?.totalHoursGoal || 1500,
    },
  });

  const updateProfile = trpc.user.updatePilotProfile.useMutation({
    onSuccess: () => {
      showToast("Pilot profile updated successfully.", "success");
      utils.flight.getStats.invalidate();
      utils.user.getProfile.invalidate();
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      showToast(error.message || "Failed to update profile.", "error");
    },
  });

  const onSubmit = (data: PilotProfileFormValues) => {
    updateProfile.mutate({
      ...data,
      medicalExpiry: new Date(data.medicalExpiry),
      lastRestDate: new Date(data.lastRestDate),
    });
  };

  return (
    <GlassCard bezel={true} className="w-full max-w-2xl mx-auto border-none">
      <GlassCardHeader className="flex items-center justify-between border-b border-zinc-800/50 pb-4">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-blue-500/10 rounded-lg">
             <ShieldCheck className="w-5 h-5 text-blue-500" />
           </div>
           <h2 className="text-base font-black uppercase tracking-[0.2em] text-zinc-100 italic font-mono">Pilot Legality Configuration</h2>
        </div>
        {/* Reset moved to footer to prevent overlap with dialogue close button */}
      </GlassCardHeader>
      
      <GlassCardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
            {/* License Section */}
            <div className="space-y-6">
               <div className="pb-1 border-b border-zinc-800/30">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                   <ExternalLink className="w-3 h-3" /> Credentials
                 </h3>
               </div>
              
              <div className="space-y-2.5">
                <Label htmlFor="licenseNumber" className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">License Number</Label>
                <Input 
                  id="licenseNumber"
                  {...control.register("licenseNumber")}
                  className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 text-zinc-100 h-11 text-base font-mono"
                  placeholder="e.g. 1234567"
                />
                {errors.licenseNumber && <p className="text-[10px] text-red-500 mt-1">{errors.licenseNumber.message}</p>}
              </div>

                <Controller
                  name="licenseType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                      <SelectTrigger className="w-full h-11 rounded-xl bg-zinc-950/50 border-zinc-800 text-zinc-100 text-sm px-4 font-bold focus:ring-blue-500 focus:border-blue-500/50">
                        <SelectValue placeholder="Select license type..." />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950/90 border-zinc-800 backdrop-blur-xl">
                        <SelectItem value="SPL" className="focus:bg-blue-500/20 focus:text-blue-400">
                          <div className="flex items-center gap-2">
                             <GraduationCap className="w-4 h-4 text-zinc-500" />
                             <span>Student Pilot (SPL)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="PPL" className="focus:bg-blue-500/20 focus:text-blue-400">
                          <div className="flex items-center gap-2">
                             <Medal className="w-4 h-4 text-blue-500" />
                             <span>Private Pilot (PPL)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="CPL" className="focus:bg-blue-500/20 focus:text-blue-400">
                          <div className="flex items-center gap-2">
                             <Award className="w-4 h-4 text-emerald-500" />
                             <span>Commercial Pilot (CPL)</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="ATPL" className="focus:bg-blue-500/20 focus:text-blue-400">
                          <div className="flex items-center gap-2">
                             <Star className="w-4 h-4 text-amber-500" />
                             <span>Airline Transport (ATP)</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
            </div>

            {/* Medical & Rest Section */}
            <div className="space-y-6">
               <div className="pb-1 border-b border-zinc-800/30">
                 <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
                   <Calendar className="w-3 h-3" /> Legality Dates
                 </h3>
               </div>

              <div className="space-y-2.5">
                <Label htmlFor="medicalExpiry" className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Medical Expiry Date</Label>
                <div className="relative group">
                  <Input 
                    id="medicalExpiry"
                    type="date"
                    {...control.register("medicalExpiry")}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 text-zinc-100 h-11 pl-11"
                  />
                  <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                    <Calendar className="w-4 h-4" />
                  </div>
                </div>
                {errors.medicalExpiry && <p className="text-[10px] text-red-500 mt-1">{errors.medicalExpiry.message}</p>}
              </div>

              <div className="space-y-2.5">
                <Label htmlFor="lastRestDate" className="text-[10px] font-black uppercase tracking-wider text-zinc-500 ml-1">Last Standard Rest Period</Label>
                <div className="relative group">
                  <Input 
                    id="lastRestDate"
                    type="datetime-local"
                    {...control.register("lastRestDate")}
                    className="bg-zinc-950/50 border-zinc-800 focus:border-blue-500/50 text-zinc-100 h-11 pl-11"
                  />
                  <div className="absolute left-4 top-3.5 text-zinc-500 group-focus-within:text-blue-500 transition-colors">
                    <Clock className="w-4 h-4" />
                  </div>
                </div>
                {errors.lastRestDate && <p className="text-[10px] text-red-500 mt-1">{errors.lastRestDate.message}</p>}
                <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-tight pl-1">
                  Enter the time you completed your last 10-hour rest.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4 w-full sm:w-auto">
               <div className="flex flex-col gap-1.5">
                 <Label htmlFor="totalHoursGoal" className="text-[10px] font-black uppercase tracking-wider text-zinc-500">Career Hour Goal</Label>
                 <Input 
                   id="totalHoursGoal"
                   type="number"
                   {...control.register("totalHoursGoal", { valueAsNumber: true })}
                   className="bg-zinc-950 border-zinc-800 text-zinc-100 h-11 w-32 font-black text-center text-blue-500"
                 />
               </div>
               <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest pt-5 hidden sm:block">Targets</div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <Button 
                variant="ghost" 
                type="button" 
                onClick={() => reset()}
                className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-zinc-200 h-12 px-6"
              >
                <RotateCcw className="w-3 h-3 mr-2" /> Reset
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || !isDirty}
                className="flex-1 sm:flex-none h-12 bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-[0.2em] px-10 shadow-[0_0_20px_rgba(37,99,235,0.2)] disabled:opacity-50 transition-all rounded-xl"
              >
                {isSubmitting ? "Syncing..." : (
                  <>
                    <Save className="w-4 h-4 mr-2.5" /> Commit Changes
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </GlassCardContent>
    </GlassCard>
  );
}
