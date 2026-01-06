"use client";

import { Button } from "@/components/ui/button";
import { Aircraft } from "@prisma/client";
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

type FlightFormData = {
  date: string;
  departureCode: string;
  arrivalCode: string;
  duration: string;
  picTime: string;
  dualTime: string;
  landings: string;
  remarks: string;
  aircraftId: string;
};



// Inferred type from tRPC router output
type FlightFromRouter = RouterOutputs["flight"]["getAll"][number];

interface FlightFormProps {
  initialData?: FlightFromRouter | null;
}

export default function FlightForm({ initialData }: FlightFormProps) {
  const router = useRouter();
  const { data: aircraft } = trpc.aircraft.getAll.useQuery();
  const utils = trpc.useUtils();
  
  const isEditMode = !!initialData;


// Inferred type from tRPC router output
type FlightWithAircraft = FlightFromRouter & { aircraft: Aircraft };

  const createFlight = trpc.flight.create.useMutation({
    // Optimistic update
    onMutate: async (newFlight) => {
      await utils.flight.getAll.cancel();
      const previousFlights = utils.flight.getAll.getData({} as Record<string, unknown>) as FlightWithAircraft[] | undefined;
      if (previousFlights) {
        const selectedAircraft = aircraft?.find((a: Aircraft) => a.id === newFlight.aircraftId);
        if (selectedAircraft) {
          utils.flight.getAll.setData(
            {} as Record<string, unknown>,
            [
              {
                ...newFlight,
                id: "optimistic",
                aircraft: selectedAircraft,
                createdAt: new Date(),
                updatedAt: new Date(),
                userId: selectedAircraft.userId,
                landings: newFlight.landings ?? 1,
                remarks: newFlight.remarks ?? null,
              },
              ...previousFlights.filter(f =>
                'createdAt' in f && 'updatedAt' in f && 'userId' in f
              ),
            ]
          );
        }
      }
      return { previousFlights };
    },
    onError: (_err, _newFlight, context) => {
      if (context?.previousFlights) {
        utils.flight.getAll.setData({} as Record<string, unknown>, context.previousFlights);
      }
    },
    onSettled: async () => {
      await utils.flight.getAll.invalidate();
      await utils.flight.getStats.invalidate();
    },
    onSuccess: () => {
      router.push("/flights");
    },
  });

  const updateFlight = trpc.flight.update.useMutation({
    // Optimistic update
    onMutate: async (updatedFlight) => {
      await utils.flight.getAll.cancel();
      const previousFlights = utils.flight.getAll.getData({} as Record<string, unknown>) as FlightWithAircraft[] | undefined;
      if (previousFlights) {
        utils.flight.getAll.setData(
          {} as Record<string, unknown>,
          previousFlights.map(f =>
            f.id === updatedFlight.id
              ? { ...f, ...updatedFlight } as FlightWithAircraft
              : f
          )
        );
      }
      return { previousFlights };
    },
    onError: (_err, _updatedFlight, context) => {
      if (context?.previousFlights) {
        utils.flight.getAll.setData({} as Record<string, unknown>, context.previousFlights);
      }
    },
    onSettled: async () => {
      await utils.flight.getAll.invalidate();
      await utils.flight.getStats.invalidate();
    },
    onSuccess: () => {
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
        landings: initialData.landings?.toString() ?? "1",
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
      landings: "1",
      remarks: "",
      aircraftId: "",
    };
  };

  const [form, setForm] = useState<FlightFormData>(getInitialFormState);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.aircraftId) return;

    const flightData = {
      date: new Date(form.date),
      departureCode: form.departureCode.toUpperCase(),
      arrivalCode: form.arrivalCode.toUpperCase(),
      duration: Number(form.duration),
      picTime: Number(form.picTime || 0),
      dualTime: Number(form.dualTime || 0),
      landings: Number(form.landings || 1),
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
              {(aircraft ?? []).map((a: Aircraft) => (
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
          <Label htmlFor="landings">Landings</Label>
          <Input
            id="landings"
            type="number"
            min={1}
            step="1"
            value={form.landings}
            onChange={(e) => setForm({ ...form, landings: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="remarks">Remarks</Label>
        <Input
          id="remarks"
          placeholder="Optional notes"
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
