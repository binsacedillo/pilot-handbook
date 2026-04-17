"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/trpc/client";
import { useToast } from "@/components/ui/toast";
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from "@/lib/error-utils";
import type { RouterOutputs } from "@/trpc/shared";

type FlightData = RouterOutputs["flight"]["getAll"][number];
type AircraftData = RouterOutputs["aircraft"]["getAll"][number];

interface UseFlightMutationsProps {
  aircraft: AircraftData[] | undefined;
}

export function useFlightMutations({ aircraft }: UseFlightMutationsProps) {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { showToast } = useToast();
  
  const [isSuccess, setIsSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const createFlight = trpc.flight.create.useMutation({
    onMutate: async (command) => {
      if (command.operation !== "CREATE_FLIGHT") return;
      const newFlight = command.data;
      
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
          version: 1,
        };

        const optimisticAircraft = { ...fallbackAircraft, ...(selectedAircraft ?? {}) };
        
        const optimisticItem = {
          ...newFlight,
          id: "optimistic",
          aircraft: optimisticAircraft,
          createdAt: new Date(),
          updatedAt: new Date(),
          userId: "",
          isVerified: false,
          instructorName: newFlight.instructorName ?? null,
          signatureData: newFlight.signatureData ?? null,
          landings: (newFlight.dayLandings ?? 0) + (newFlight.nightLandings ?? 0),
          remarks: newFlight.remarks ?? null,
          version: 1,
        } as FlightData;

        utils.flight.getAll.setData(
          {} as Record<string, unknown>,
          [optimisticItem, ...previousFlights]
        );
      }
      return { previousFlights };
    },
    onError: (err, command, context) => {
      if (context?.previousFlights) {
        utils.flight.getAll.setData({} as Record<string, unknown>, context.previousFlights);
      }
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("create flight")
        : getServerErrorMessage("create flight", err);
      showToast(errorMessage, "error", {
        action: {
          label: "Retry",
          onClick: () => createFlight.mutate(command),
        },
      });
    },
    onSettled: async () => {
      await utils.flight.getAll.invalidate();
      await utils.flight.getStats.invalidate();
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      setSuccessMessage(`FLIGHT LOG CREATED // ${data?.departureCode} -> ${data?.arrivalCode} // SYNC COMPLETE`);
      
      // Delay redirect for satisfying feedback
      setTimeout(() => {
        router.push("/flights");
      }, 1500);
    },
  });

  const updateFlight = trpc.flight.update.useMutation({
    onMutate: async (command) => {
      await utils.flight.getAll.cancel();
      const previousFlights = utils.flight.getAll.getData({} as Record<string, unknown>) as FlightData[] | undefined;
      
      if (previousFlights) {
        utils.flight.getAll.setData(
          {} as Record<string, unknown>,
          previousFlights.map(f => {
            if (f.id !== command.flightId) return f;
            
            return { 
              ...f, 
              ...command.changes,
              isVerified: f.isVerified,
              version: f.version + 1, // Optimistic version bump
            } as FlightData;
          })
        );
      }
      return { previousFlights };
    },
    onError: (err, command, context) => {
      if (context?.previousFlights) {
        utils.flight.getAll.setData({} as Record<string, unknown>, context.previousFlights);
      }
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("update flight")
        : getServerErrorMessage("update flight", err);
      showToast(errorMessage, "error", {
        action: {
          label: "Retry",
          onClick: () => updateFlight.mutate(command),
        },
      });
    },
    onSettled: async () => {
      await utils.flight.getAll.invalidate();
      await utils.flight.getStats.invalidate();
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      setSuccessMessage(`FLIGHT LOG UPDATED // ${data?.departureCode} -> ${data?.arrivalCode} // DATA INTEGRITY VERIFIED`);
      
      // Delay redirect for satisfying feedback
      setTimeout(() => {
        router.push("/flights");
      }, 1500);
    },
  });

  const isPending = createFlight.isPending || updateFlight.isPending;

  return {
    createFlight,
    updateFlight,
    isPending,
    isSuccess,
    successMessage,
  };
}
