"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import { trpc } from "@/trpc/client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/DeleteDialog";
import { Trash2, Edit2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FlightFilterBar } from "@/src/components/flights/FlightFilterBar";

export default function FlightsPage() {
  const searchParams = useSearchParams();

  const filters = {
    search: searchParams.get("search") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    flightType: searchParams.get("flightType") || undefined,
  };

  const { data: flights } = trpc.flight.getAll.useQuery(filters);
  const deleteMutation = trpc.flight.delete.useMutation();
  const queryClient = useQueryClient();

  // State for optimistic updates (store flight IDs)
  const [optimisticFlights, setOptimisticFlights] = useState<string[]>([]);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    flightId: string | null;
    flightRoute: string | null;
  }>({ open: false, flightId: null, flightRoute: null });

  const filteredRows = useMemo(() => {
    if (!flights) return [];
    let result = flights.filter((f) => !optimisticFlights.includes(f.id));
    return result;
  }, [flights, optimisticFlights]);

  const handleDeleteClick = (flightId: string, route: string) => {
    setDeleteDialogState({
      open: true,
      flightId,
      flightRoute: route,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogState.flightId) return;
    const flightId = deleteDialogState.flightId;
    setOptimisticFlights((prev) => [...prev, flightId]);
    try {
      await deleteMutation.mutateAsync({ id: flightId });
      await queryClient.invalidateQueries({ queryKey: ["flight.getAll"] });
    } catch (error) {
      setOptimisticFlights((prev) => prev.filter((id) => id !== flightId));
      console.error("Failed to delete flight:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-6xl mx-auto p-6 md:p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Flights</h1>
          <Button asChild>
            <Link href="/flights/new">Log New Flight</Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="mb-6">
          <FlightFilterBar />
        </div>

        <DeleteDialog
          open={deleteDialogState.open}
          onOpenChange={(open) =>
            setDeleteDialogState((prev) => ({ ...prev, open }))
          }
          title="Delete Flight"
          description="Are you sure you want to delete this flight?"
          itemName={deleteDialogState.flightRoute || ""}
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
        />

        {filteredRows.length === 0 ? (
          <div className="bg-card text-foreground rounded-lg border border-border shadow p-8 text-center">
            <p className="text-muted-foreground mb-4">No flights yet.</p>
            <Button asChild>
              <Link href="/flights/new">Log your first flight</Link>
            </Button>
          </div>
        ) : (
          <div className="bg-card text-foreground rounded-lg border border-border shadow overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-muted text-muted-foreground text-left">
                <tr>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Route</th>
                  <th className="px-4 py-3 font-semibold">Aircraft</th>
                  <th className="px-4 py-3 font-semibold">Hours</th>
                  <th className="px-4 py-3 font-semibold">PIC</th>
                  <th className="px-4 py-3 font-semibold">Dual</th>
                  <th className="px-4 py-3 font-semibold">Landings</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((f) => (
                  <tr key={f.id} className="border-t border-border hover:bg-muted transition-colors">
                    <td className="px-4 py-3">{new Date(f.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      {f.departureCode} → {f.arrivalCode}
                    </td>
                    <td className="px-4 py-3">{f.aircraft?.registration}</td>
                    <td className="px-4 py-3">{f.duration}h</td>
                    <td className="px-4 py-3">{f.picTime}</td>
                    <td className="px-4 py-3">{f.dualTime}</td>
                    <td className="px-4 py-3">{f.landings}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/flights/${f.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:bg-muted/60"
                            title="Edit flight"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() =>
                            handleDeleteClick(
                              f.id,
                              `${f.departureCode} → ${f.arrivalCode}`
                            )
                          }
                          disabled={deleteMutation.isPending}
                          title="Delete flight"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
