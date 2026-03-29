"use client";

import { Button } from "@/components/ui/button";
import type { RouterOutputs } from "@/src/trpc/shared";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/src/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from "@/lib/error-utils";
import SignaturePad from "@/components/common/SignaturePad";
import { PenTool, CheckCircle2 } from "lucide-react";

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
  const utils = trpc.useUtils();
  const { showToast } = useToast();
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  
  const isEditMode = !!initialData;




  const createFlight = trpc.flight.create.useMutation({
    onMutate: async (newFlight) => {
      await utils.flight.getAll.cancel();
      const previousFlights = utils.flight.getAll.getData({} as Record<string, unknown>) as FlightData[] | undefined;
      
      if (previousFlights) {
        const selectedAircraft = aircraft?.find((a: AircraftData) => a.id === newFlight.aircraftId);
        
        const fallbackAircraft = {
          id: newFlight.aircraftId,
          registration: "",
          make: "",
          model: "",
          status: "",
          imageUrl: "",
          isArchived: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          flightHours: 0,
          userId: "",
        };

        const optimisticAircraft = { ...fallbackAircraft, ...(selectedAircraft ?? {}) };
        
        const optimisticItem = {
          ...newFlight,
          id: "optimistic",
          aircraft: optimisticAircraft,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "",
          isVerified: (newFlight as any).isVerified ?? false,
          instructorName: (newFlight as any).instructorName ?? null,
          signatureData: (newFlight as any).signatureData ?? null,
          landings: (newFlight as any).dayLandings + (newFlight as any).nightLandings,
          remarks: newFlight.remarks ?? null,
        } as any;

        utils.flight.getAll.setData(
          {} as Record<string, unknown>,
          [optimisticItem, ...previousFlights]
        );
      }
      return { previousFlights };
    },
    onError: (err, newFlight, context) => {
      if (context?.previousFlights) {
        utils.flight.getAll.setData({} as Record<string, unknown>, context.previousFlights);
      }
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("create flight")
        : getServerErrorMessage("create flight", err);
      showToast(errorMessage, "error", {
        action: {
          label: "Retry",
          onClick: () => createFlight.mutate(newFlight),
        },
      });
    },
    onSettled: async () => {
      await utils.flight.getAll.invalidate();
      await utils.flight.getStats.invalidate();
    },
    onSuccess: () => {
      showToast("Flight created successfully.", "success");
      router.push("/flights");
    },
  });

  const updateFlight = trpc.flight.update.useMutation({
    onMutate: async (updatedFlight) => {
      await utils.flight.getAll.cancel();
      const previousFlights = utils.flight.getAll.getData({} as Record<string, unknown>) as FlightData[] | undefined;
      
      if (previousFlights) {
        utils.flight.getAll.setData(
          {} as Record<string, unknown>,
          previousFlights.map(f => {
            if (f.id !== updatedFlight.id) return f;
            
            return { 
              ...f, 
              ...updatedFlight,
              isVerified: (updatedFlight as any).isVerified ?? (f as any).isVerified,
              instructorName: (updatedFlight as any).instructorName ?? (f as any).instructorName,
              signatureData: (updatedFlight as any).signatureData ?? (f as any).signatureData,
            } as any;
          })
        );
      }
      return { previousFlights };
    },
    onError: (err, updatedFlight, context) => {
      if (context?.previousFlights) {
        utils.flight.getAll.setData({} as Record<string, unknown>, context.previousFlights);
      }
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("update flight")
        : getServerErrorMessage("update flight", err);
      showToast(errorMessage, "error", {
        action: {
          label: "Retry",
          onClick: () => updateFlight.mutate(updatedFlight),
        },
      });
    },
    onSettled: async () => {
      await utils.flight.getAll.invalidate();
      await utils.flight.getStats.invalidate();
    },
    onSuccess: () => {
      showToast("Flight updated successfully.", "success");
      router.push("/flights");
    },
  });

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

    const data = initialData as any;
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

      // Edit Mode: Call update.mutate
      updateFlight.mutate({
        id: initialData.id,
        ...flightData,
      });
    } else {
      // Create Mode: Call create.mutate
      createFlight.mutate(flightData);
    }
  }

  const isPending = createFlight.isPending || updateFlight.isPending;

  return (
    <form onSubmit={onSubmit} className="bg-card text-card-foreground rounded-lg border border-border shadow p-6 space-y-6">
      {formError && (
        <div className="bg-red-100 text-red-700 rounded px-4 py-2 mb-2 text-sm border border-red-300">
          {formError}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="aircraft">Aircraft</Label>
          <Select
            value={form.aircraftId}
            onValueChange={(value) => setForm({ ...form, aircraftId: value })}
          >
            <SelectTrigger id="aircraft" className="w-full">
              <SelectValue placeholder="Select aircraft…" />
            </SelectTrigger>
            <SelectContent>
              {(aircraft ?? []).map((a: AircraftData) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.registration} • {a.make} {a.model}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="dep">Departure</Label>
          <Input
            id="dep"
            placeholder="e.g., KJFK"
            maxLength={4}
            required
            value={form.departureCode}
            onChange={(e) => setForm({ ...form, departureCode: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="arr">Arrival</Label>
          <Input
            id="arr"
            placeholder="e.g., KBOS"
            maxLength={4}
            required
            value={form.arrivalCode}
            onChange={(e) => setForm({ ...form, arrivalCode: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="duration">Duration (hrs)</Label>
          <Input
            id="duration"
            type="number"
            min={0}
            step="0.1"
            required
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="pic">PIC Time</Label>
          <Input
            id="pic"
            type="number"
            min={0}
            step="0.1"
            value={form.picTime}
            onChange={(e) => setForm({ ...form, picTime: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="dual">Dual Time</Label>
          <Input
            id="dual"
            type="number"
            min={0}
            step="0.1"
            value={form.dualTime}
            onChange={(e) => setForm({ ...form, dualTime: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="dayLandings">Day Landings</Label>
          <Input
            id="dayLandings"
            type="number"
            min={0}
            step="1"
            value={form.dayLandings}
            onChange={(e) => setForm({ ...form, dayLandings: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="nightLandings">Night Landings</Label>
          <Input
            id="nightLandings"
            type="number"
            min={0}
            step="1"
            value={form.nightLandings}
            onChange={(e) => setForm({ ...form, nightLandings: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Input
          id="remarks"
          placeholder="Optional notes"
          maxLength={500}
          value={form.remarks}
          onChange={(e) => setForm({ ...form, remarks: e.target.value })}
        />
      </div>

      <div className="border-t pt-4 space-y-4">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <PenTool className="w-4 h-4" /> Instructor Verification (Optional)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
          <div>
            <Label htmlFor="instructorName">Instructor Name</Label>
            <Input
              id="instructorName"
              placeholder="Full Name"
              value={form.instructorName}
              onChange={(e) => setForm({ ...form, instructorName: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-2">
             {form.signatureData ? (
               <div className="flex items-center gap-2 bg-green-50 dark:bg-green-900/20 p-2 rounded border border-green-200 dark:border-green-800">
                 <CheckCircle2 className="w-4 h-4 text-green-500" />
                 <span className="text-xs text-green-700 dark:text-green-400 font-medium">Signed</span>
                 <Button 
                   type="button" 
                   variant="ghost" 
                   size="sm" 
                   className="text-xs ml-auto h-7"
                   onClick={() => setForm({ ...form, signatureData: null })}
                 >
                   Clear Signature
                 </Button>
               </div>
             ) : (
               <Button 
                 type="button" 
                 variant="outline" 
                 onClick={() => setShowSignaturePad(true)}
                 className="w-full"
               >
                 Add Signature
               </Button>
             )}
          </div>
        </div>
      </div>

      {showSignaturePad && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <SignaturePad 
            onSave={(data) => {
              setForm({ ...form, signatureData: data });
              setShowSignaturePad(false);
            }} 
            onCancel={() => setShowSignaturePad(false)} 
          />
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving…" : isEditMode ? "Update Flight" : "Save Flight"}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
