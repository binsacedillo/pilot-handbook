"use client";

import { Button } from "@/components/ui/button";
import type { RouterOutputs } from "@/trpc/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import StatusAnnunciator from "@/components/common/StatusAnnunciator";
import { useFlightMutations } from "@/hooks/useFlightMutations";
import { InstructorVerification } from "./InstructorVerification";

type FlightFormData = {
  date: string;
  departureCode: string;
  arrivalCode: string;
  duration: string;
  picTime: string;
  dualTime: string;
  dayLandings: string;
  nightLandings: string;
  remarks: string;
  aircraftId: string;
  instructorName: string;
  signatureData: string | null;
};

// Inferred types from tRPC router output
type FlightData = RouterOutputs["flight"]["getAll"][number];
type AircraftData = RouterOutputs["aircraft"]["getAll"][number];

interface FlightFormProps {
  initialData?: FlightData | null;
}

export default function FlightForm({ initialData }: FlightFormProps) {
  const router = useRouter();
  const { data: aircraft } = trpc.aircraft.getAll.useQuery();
  
  const isEditMode = !!initialData;
  const { createFlight, updateFlight, isPending, isSuccess, successMessage } = useFlightMutations({ aircraft });

  // Compute initial form state based on initialData (Edit Mode) or defaults (Create Mode)
  const getInitialFormState = (): FlightFormData => {
    if (!initialData) {
      return {
        date: "",
        departureCode: "",
        arrivalCode: "",
        duration: "",
        picTime: "0",
        dualTime: "0",
        dayLandings: "0",
        nightLandings: "0",
        remarks: "",
        aircraftId: "",
        instructorName: "",
        signatureData: null,
      };
    }

    const data = initialData;
    const formattedDate = data.date 
      ? new Date(data.date).toISOString().split("T")[0] || ""
      : "";

    return {
      date: formattedDate,
      departureCode: data.departureCode || "",
      arrivalCode: data.arrivalCode || "",
      duration: (data.duration ?? "").toString(),
      picTime: (data.picTime ?? "0").toString(),
      dualTime: (data.dualTime ?? "0").toString(),
      dayLandings: (data.dayLandings ?? 0).toString(),
      nightLandings: (data.nightLandings ?? 0).toString(),
      remarks: data.remarks || "",
      aircraftId: data.aircraftId || "",
      instructorName: data.instructorName || "",
      signatureData: data.signatureData || null,
    };
  };

  const [form, setForm] = useState<FlightFormData>(getInitialFormState);
  const [formError, setFormError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    if (!form.aircraftId) {
      setFormError("Please select an aircraft.");
      return;
    }
    if (!form.date) {
      setFormError("Please enter a flight date.");
      return;
    }
    const dateObj = new Date(form.date);
    if (isNaN(dateObj.getTime())) {
      setFormError("Invalid date format.");
      return;
    }

    const flightData = {
      date: dateObj,
      departureCode: form.departureCode.toUpperCase(),
      arrivalCode: form.arrivalCode.toUpperCase(),
      duration: Number(form.duration),
      picTime: Number(form.picTime || 0),
      dualTime: Number(form.dualTime || 0),
      dayLandings: Number(form.dayLandings || 0),
      nightLandings: Number(form.nightLandings || 0),
      remarks: form.remarks || undefined,
      aircraftId: form.aircraftId,
      instructorName: form.instructorName || undefined,
      signatureData: form.signatureData || undefined,
    };

    if (isEditMode) {
      if (!initialData?.id) {
        setFormError("Unable to update flight: missing flight ID.");
        return;
      }
      updateFlight.mutate({
        operation: "UPDATE_FLIGHT",
        flightId: initialData.id,
        changes: flightData,
        clientVersion: initialData.version ?? 1,
      });
    } else {
      createFlight.mutate({
        operation: "CREATE_FLIGHT",
        data: flightData,
      });
    }
  }

  return (
    <form onSubmit={onSubmit} className={cn(
      "space-y-6 transition-all duration-700 relative overflow-hidden",
      isSuccess && "success-pulse pointer-events-none opacity-80"
    )}>
      {isSuccess && (
        <div className="absolute inset-0 z-50 flex items-start justify-center p-4 bg-background/20 backdrop-blur-[2px] animate-in fade-in duration-500 rounded-xl">
          <StatusAnnunciator 
            type="success" 
            title="Success" 
            message={successMessage}
            className="shadow-2xl shadow-emerald-500/20 max-w-lg mt-10"
          />
        </div>
      )}

      {formError && (
        <div className="bg-rose-500/10 text-rose-500 rounded-md px-4 py-3 mb-2 text-xs font-mono uppercase tracking-widest border border-rose-500/20 flex items-center gap-2">
          <span className="font-bold">Error:</span> {formError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="date" className="text-[10px] font-black uppercase tracking-widest text-blue-500">Flight Date</Label>
          <Input
            id="date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500 text-white font-mono text-sm h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="aircraft" className="text-[10px] font-black uppercase tracking-widest text-blue-500">Aircraft Configuration</Label>
          <Select
            value={form.aircraftId}
            onValueChange={(value) => setForm({ ...form, aircraftId: value })}
          >
            <SelectTrigger id="aircraft" className="w-full bg-zinc-900/50 border-zinc-800 focus:ring-blue-500 text-white font-mono text-sm h-11">
              <SelectValue placeholder="Select aircraft…" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-300">
              {(aircraft ?? []).map((a: AircraftData) => (
                <SelectItem key={a.id} value={a.id} className="focus:bg-blue-500/20 py-2">
                  <span className="font-mono text-blue-400">{a.registration}</span> <span className="text-zinc-500">•</span> {a.make} {a.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <Label htmlFor="dep" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Departure</Label>
          <Input
            id="dep"
            placeholder="KJFK"
            maxLength={4}
            required
            value={form.departureCode}
            onChange={(e) => setForm({ ...form, departureCode: e.target.value })}
            className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500 text-white font-mono text-center tracking-widest text-lg h-12 uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="arr" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Arrival</Label>
          <Input
            id="arr"
            placeholder="KBOS"
            maxLength={4}
            required
            value={form.arrivalCode}
            onChange={(e) => setForm({ ...form, arrivalCode: e.target.value })}
            className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500 text-white font-mono text-center tracking-widest text-lg h-12 uppercase"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Total Duration (hrs)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            step="0.1"
            required
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500 text-blue-400 font-mono text-center text-lg h-12"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border border-zinc-800/50 bg-zinc-900/20">
        <div className="space-y-2">
          <Label htmlFor="pic" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">PIC Time</Label>
          <Input
            id="pic"
            type="number"
            min={0}
            step="0.1"
            value={form.picTime}
            onChange={(e) => setForm({ ...form, picTime: e.target.value })}
            className="bg-zinc-900/80 border-zinc-800 focus:border-blue-500 text-white font-mono text-center h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dual" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Dual Time</Label>
          <Input
            id="dual"
            type="number"
            min={0}
            step="0.1"
            value={form.dualTime}
            onChange={(e) => setForm({ ...form, dualTime: e.target.value })}
            className="bg-zinc-900/80 border-zinc-800 focus:border-blue-500 text-white font-mono text-center h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dayLandings" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Day Landings</Label>
          <Input
            id="dayLandings"
            type="number"
            min={0}
            step="1"
            value={form.dayLandings}
            onChange={(e) => setForm({ ...form, dayLandings: e.target.value })}
            className="bg-zinc-900/80 border-zinc-800 focus:border-blue-500 text-white font-mono text-center h-10"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nightLandings" className="text-[9px] font-bold uppercase tracking-widest text-zinc-500">Night Landings</Label>
          <Input
            id="nightLandings"
            type="number"
            min={0}
            step="1"
            value={form.nightLandings}
            onChange={(e) => setForm({ ...form, nightLandings: e.target.value })}
            className="bg-zinc-900/80 border-zinc-800 focus:border-blue-500 text-white font-mono text-center h-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="remarks" className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Remarks / Operational Notes</Label>
        <Input
          id="remarks"
          placeholder="System notes..."
          maxLength={500}
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          className="bg-zinc-900/50 border-zinc-800 focus:border-blue-500 text-white font-mono text-sm h-11 placeholder:text-zinc-700"
        />
      </div>

      <InstructorVerification 
        instructorName={form.instructorName || ""} 
        signatureData={form.signatureData} 
        onInstructorNameChange={(val) => setForm({ ...form, instructorName: val })} 
        onSignatureChange={(val) => setForm({ ...form, signatureData: val })} 
      />

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800/50 mt-8">
        <Button 
          type="button" 
          variant="ghost" 
          onClick={() => router.back()}
          className="h-11 px-6 text-[10px] font-bold uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending}
          className="h-11 px-8 bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-95"
        >
          {isPending 
            ? "Saving..." 
            : isEditMode 
              ? "Update Flight Log" 
              : "Save Flight Log"
          }
        </Button>
      </div>
    </form>
  );
}
