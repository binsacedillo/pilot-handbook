"use client";

import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import { trpc } from "@/src/trpc/client";
import type { RouterOutputs } from "@/src/trpc/shared";
import Link from "next/link";
import { useState, useEffect } from "react";
import FlightForm from "@/components/flights/FlightForm";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import { 
  Plane, Calendar, Clock, MapPin, Edit, Trash2, 
  Download, FileDown, FileJson, Upload, CheckCircle, ShieldCheck, Plus 
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { FlightFilterBar } from "@/src/components/flights/FlightFilterBar";
import EmptyState from "@/components/common/EmptyState";
import { useToast } from "@/components/ui/toast";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { exportFlightsToCSV, parseFlightsFromCSV } from "@/lib/csv-utils";
import dynamic from "next/dynamic";
// import { PDFDownloadLink } from "@react-pdf/renderer";
const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((mod) => mod.PDFDownloadLink),
  {
    ssr: false,
    loading: () => (
      <Button variant="outline" size="sm" className="gap-2" disabled>
        <FileDown className="w-4 h-4" /> Loading...
      </Button>
    ),
  }
);
import { FlightPDF } from "@/components/flights/FlightPDF";
import { useUser } from "@clerk/nextjs";

type FlightData = RouterOutputs["flight"]["getAll"][number];

export default function FlightsPage() {
  const [showForm, setShowForm] = useState(false);
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { user } = useUser();
  const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Pilot";

  const flightTypeValue = searchParams.get("flightType");
  const isValidFlightType = (value: string | null): value is "PIC" | "DUAL" | "SOLO" => {
    return value === "PIC" || value === "DUAL" || value === "SOLO";
  };

  const filters = {
    search: searchParams.get("search") || undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
    flightType: isValidFlightType(flightTypeValue) ? flightTypeValue : undefined,
    aircraftId: searchParams.get("aircraftId") || undefined,
  };

  const { data: flights } = trpc.flight.getAll.useQuery(filters);
  const deleteMutation = trpc.flight.delete.useMutation();
  const queryClient = useQueryClient();

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  // State for optimistic updates (store flight IDs)
  const [optimisticFlights, setOptimisticFlights] = useState<string[]>([]);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    flightId: string | null;
    flightRoute: string | null;
  }>({ open: false, flightId: null, flightRoute: null });

  const filteredRows = useMemo(() => {
    if (!flights) return [];
    const filtered = (flights || []).filter((f: any) => !optimisticFlights.includes(f.id));
    return filtered;
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
      showToast("Flight deleted successfully", "success");
    } catch (error) {
      setOptimisticFlights((prev) => prev.filter((id) => id !== flightId));
      showToast("Failed to delete flight. Please try again.", "error");
      console.error("Failed to delete flight:", error);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-6xl mx-auto p-6 md:p-8 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Flights</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => {
              const fileInput = document.createElement('input');
              fileInput.type = 'file';
              fileInput.accept = '.csv';
              fileInput.onchange = async (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                   try {
                     const data = await parseFlightsFromCSV(file);
                     showToast(`Parsed ${data.length} flights from CSV (Import logic would go here)`, "success");
                     // Note: Real import would involve calling a multi-create mutation
                   } catch (err) {
                     showToast("Failed to parse CSV", "error");
                   }
                }
              };
              fileInput.click();
            }}>
              <Upload className="w-4 h-4" /> Import CSV
            </Button>
            
            <Button variant="outline" size="sm" className="gap-2" onClick={() => exportFlightsToCSV(filteredRows)}>
              <FileJson className="w-4 h-4" /> Export CSV
            </Button>

            {isMounted && (
              <PDFDownloadLink
                document={<FlightPDF flights={filteredRows} userName={userName} />}
                fileName={`flights_report_${new Date().toISOString().split('T')[0]}.pdf`}
              >
                {({ loading }) => (
                  <Button variant="outline" size="sm" className="gap-2" disabled={loading}>
                    <FileDown className="w-4 h-4" /> {loading ? "Preparing PDF..." : "Export PDF"}
                  </Button>
                )}
              </PDFDownloadLink>
            )}

            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" /> Log New Flight
            </Button>
          </div>
        </div>
        {showForm && (
          <div className="mb-8 bg-card border-2 border-blue-400 dark:border-blue-500 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Log New Flight</h2>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Close</Button>
            </div>
            <FlightForm />
          </div>
        )}

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
          <EmptyState
            icon="✈️"
            title="No Flights Logged Yet"
            description="Start building your logbook by logging your first flight. Track your hours, currencies, and achievements."
            action={{
              label: "Log Your First Flight",
              onClick: () => setShowForm(true),
            }}
          />
        ) : (
          <div className="bg-card text-foreground rounded-lg border-2 border-orange-500 dark:border-orange-400 shadow overflow-x-auto">
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
                  <th className="px-4 py-3 font-semibold text-center">Status</th>
                  <th className="px-4 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.map((item: any) => {
                  const f = item as any;
                  return (
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
                      <td className="px-4 py-3 text-center">
                        {f.isVerified ? (
                          <div className="flex justify-center" title={`Verified by ${f.instructorName || 'Instructor'}`}>
                            <ShieldCheck className="w-5 h-5 text-green-500" />
                          </div>
                        ) : (
                          <div className="flex justify-center opacity-20" title="Unverified">
                            <CheckCircle className="w-5 h-5" />
                          </div>
                        )}
                      </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/flights/${f.id}/edit`}>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-primary hover:bg-muted/60"
                            title="Edit flight"
                          >
                            <Edit className="w-4 h-4" />
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
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
