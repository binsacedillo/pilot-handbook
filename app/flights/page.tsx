"use client";

import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import { trpc } from "@/trpc/client";
import type { RouterOutputs } from "@/trpc/shared";
import Link from "next/link";
import { useState, useEffect } from "react";
import FlightForm from "@/components/flights/FlightForm";
import { FlightFilterBar } from "@/components/flights/FlightFilterBar";
import EmptyState from "@/components/common/EmptyState";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import { 
  Edit, Trash2, 
  FileDown, FileJson, Upload, CheckCircle, ShieldCheck, Plus 
} from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { FlightTable } from "@/components/flights/FlightTable";
import { GlassCard } from "@/components/ui/GlassCard";
import { 
  ChevronDown, 
  Settings, 
  LayoutGrid
} from "lucide-react";

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



export default function FlightsPage() {
  const { user } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [showForm, setShowForm] = useState(false);
  const [pulseNew, setPulseNew] = useState(false);
  const { showToast } = useToast();
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
    
    // URL Cleanup (UX Pro Move): Deep-link detection and query consumption
    if (searchParams.get("new") === "true") {
      setShowForm(true);
      setPulseNew(true);
      
      // Clean up the URL
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new");
      const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(nextUrl);

      // Disable pulse after animation cycle
      setTimeout(() => setPulseNew(false), 6000);
    }
  }, [searchParams, router, pathname]);
  
  // State for optimistic updates (store flight IDs)
  const [optimisticFlights, setOptimisticFlights] = useState<string[]>([]);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    flightId: string | null;
    flightRoute: string | null;
  }>({ open: false, flightId: null, flightRoute: null });

  const filteredRows = useMemo(() => {
    if (!flights) return [];
    const filtered = (flights || []).filter((f: RouterOutputs["flight"]["getAll"][number]) => !optimisticFlights.includes(f.id));
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
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-1">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic">
              FLIGHT LOGS<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              {filteredRows.length} Missions Recorded • {userName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Secondary/Admin Actions Dropdown */}
            <div className="relative group/ops">
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-11 px-4 rounded-xl border border-[var(--glass-border)] bg-zinc-900/5 dark:bg-white/5 text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-500 gap-2"
              >
                <Settings className="w-3.5 h-3.5" />
                Operations
                <ChevronDown className="w-3 h-3 transition-transform group-hover/ops:rotate-180" />
              </Button>
              
              <div className="absolute right-0 top-full mt-2 w-48 py-2 bg-[var(--glass-bg)] backdrop-blur-xl border border-[var(--glass-border)] rounded-xl shadow-2xl opacity-0 translate-y-2 pointer-events-none group-hover/ops:opacity-100 group-hover/ops:translate-y-0 group-hover/ops:pointer-events-auto transition-all duration-300 z-50">
                <button 
                  className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center gap-3"
                  onClick={() => {
                    const fileInput = document.createElement('input');
                    fileInput.type = 'file';
                    fileInput.accept = '.csv';
                    fileInput.onchange = async (e) => {
                      const file = (e.target as HTMLInputElement).files?.[0];
                      if (file) {
                         try {
                           const data = await parseFlightsFromCSV(file);
                           showToast(`Parsed ${data.length} flights from CSV (Import logic pending)`, "success");
                         } catch {
                           showToast("Failed to parse CSV", "error");
                         }
                      }
                    };
                    fileInput.click();
                  }}
                >
                  <Upload className="w-3.5 h-3.5" /> Import CSV
                </button>
                
                <div className="h-[1px] bg-[var(--glass-border)] my-1" />
                
                <button 
                  className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center gap-3"
                  onClick={() => exportFlightsToCSV(filteredRows)}
                >
                  <FileJson className="w-3.5 h-3.5" /> Export CSV
                </button>

                {isMounted && (
                  <PDFDownloadLink
                    document={<FlightPDF flights={filteredRows} userName={userName} />}
                    fileName={`flights_report_${new Date().toISOString().split('T')[0]}.pdf`}
                    style={{ textDecoration: "none" }}
                  >
                    {({ loading }) => (
                      <button 
                        className="w-full px-4 py-2.5 text-left text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-blue-500 hover:bg-blue-500/10 transition-colors flex items-center gap-3 disabled:opacity-50"
                        disabled={loading}
                      >
                        <FileDown className="w-3.5 h-3.5" /> {loading ? "Generating..." : "Download PDF"}
                      </button>
                    )}
                  </PDFDownloadLink>
                )}
              </div>
            </div>

            {/* Primary Action */}
            <Button 
              onClick={() => setShowForm(true)} 
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 gap-2"
            >
              <Plus className="w-4 h-4" /> Log New Flight
            </Button>
          </div>
        </div>

        {showForm && (
          <div className={cn(
            "mb-10 animate-in fade-in slide-in-from-top-4 duration-500",
            pulseNew && "animate-master-caution"
          )}>
            <GlassCard className="relative border-blue-500/20">
              <div className="px-6 py-4 border-b border-[var(--glass-border)] flex justify-between items-center bg-blue-500/5">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="text-xs font-black uppercase tracking-widest text-blue-500">Mission Entry Panel</h2>
                </div>
                <Button size="sm" variant="ghost" className="h-8 text-[10px] font-black uppercase tracking-wider text-zinc-500 hover:text-foreground" onClick={() => setShowForm(false)}>Abort Entry</Button>
              </div>
              <div className="p-6">
                <FlightForm />
              </div>
            </GlassCard>
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
          <div className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl p-12 bg-[var(--glass-bg)]/30 backdrop-blur-sm">
            <EmptyState
              icon="✈️"
              title="No Flights Logged Yet"
              description="Start building your logbook by logging your first flight. Track your hours, currencies, and achievements."
              action={{
                label: "Log Your First Flight",
                onClick: () => setShowForm(true),
              }}
            />
          </div>
        ) : (
          <FlightTable 
            flights={filteredRows}
            onDelete={handleDeleteClick}
            isDeleting={deleteMutation.isPending}
          />
        )}
      </main>
      <AppFooter />
    </div>
  );
}
