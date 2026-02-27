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
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from "@/lib/error-utils";

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
  
  const isEditMode = !!initialData;




  const createFlight = trpc.flight.create.useMutation({
    // Optimistic update
    onMutate: async (newFlight) => {
      await utils.flight.getAll.cancel();
      const previousFlights = utils.flight.getAll.getData({} as Record<string, unknown>) as FlightData[] | undefined;
      if (previousFlights) {
        // Find the full aircraft object from the aircraft list
        const selectedAircraft = aircraft?.find((a: AircraftData) => a.id === newFlight.aircraftId);
        // Fallback dummy values for all required fields
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
        // Merge selectedAircraft with fallback to ensure all fields are present
        const optimisticAircraft = { ...fallbackAircraft, ...(selectedAircraft ?? {}) };
        utils.flight.getAll.setData(
          {} as Record<string, unknown>,
          [
            {
              ...newFlight,
              id: "optimistic",
              aircraft: optimisticAircraft,
              createdAt: new Date(),
              updatedAt: new Date(),
              userId: "",
              dayLandings: typeof newFlight.dayLandings === 'number' ? newFlight.dayLandings : 0,
              nightLandings: typeof newFlight.nightLandings === 'number' ? newFlight.nightLandings : 0,
              landings: (typeof newFlight.dayLandings === 'number' ? newFlight.dayLandings : 0) + (typeof newFlight.nightLandings === 'number' ? newFlight.nightLandings : 0),
              remarks: newFlight.remarks ?? null,
            },
            ...previousFlights.filter(f =>
              'createdAt' in f && 'updatedAt' in f && 'userId' in f
            ),
          ]
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
    // Optimistic update
    onMutate: async (updatedFlight) => {
      await utils.flight.getAll.cancel();
      const previousFlights = utils.flight.getAll.getData({} as Record<string, unknown>) as FlightData[] | undefined;
      if (previousFlights) {
        utils.flight.getAll.setData(
          {} as Record<string, unknown>,
          previousFlights.map(f =>
            f.id === updatedFlight.id
              ? { ...f, ...updatedFlight } as FlightData
              : f
          )
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
    if (initialData) {
      return {
        date: new Date(initialData.date).toISOString().split("T")[0] || "",
        departureCode: initialData.departureCode,
        arrivalCode: initialData.arrivalCode,
        duration: initialData.duration?.toString() ?? "",
        picTime: initialData.picTime?.toString() ?? "0",
        dualTime: initialData.dualTime?.toString() ?? "0",
        dayLandings: (initialData.dayLandings ?? 0).toString(),
        nightLandings: (initialData.nightLandings ?? 0).toString(),
        remarks: initialData.remarks || "",
        aircraftId: initialData.aircraftId,
      };
    }
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
    };

    if (isEditMode) {
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
