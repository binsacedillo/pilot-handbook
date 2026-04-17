"use client";

import { useState } from "react";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Plane, Edit2, Archive, Clock, Plus } from "lucide-react";
import { DeleteDialog } from "@/components/common/DeleteDialog";
import { cn } from "@/lib/utils";
import Link from "next/link";
import dynamicImport from "next/dynamic";
const AppHeader = dynamicImport(() => import("@/components/common/AppHeader"), { ssr: false });
import AppFooter from "@/components/common/AppFooter";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import EmptyState from "@/components/common/EmptyState";
import { GlassCard } from "@/components/ui/GlassCard";
import { AircraftSkeleton } from "@/components/aircraft/AircraftSkeleton";

export default function AircraftPage() {
  const { user } = useUser();
  const [showArchived, setShowArchived] = useState(false);
  const { data: aircraft, isLoading } = trpc.aircraft.getAll.useQuery({ includeArchived: showArchived });
  const utils = trpc.useUtils();
  const router = useRouter();
  const { showToast } = useToast();
  
  const userName = user?.fullName || user?.primaryEmailAddress?.emailAddress || "Pilot";

  const deleteMutation = trpc.aircraft.delete.useMutation({
    onSuccess: async () => {
      await utils.aircraft.invalidate();
      router.refresh();
      showToast("Aircraft archived.", "success");
    },
    onError: (error) => {
      showToast(`Failed to archive aircraft: ${error.message}`, "error");
    },
  });

  const deletePermanentMutation = trpc.aircraft.deletePermanent.useMutation({
    onSuccess: async () => {
      await utils.aircraft.invalidate();
      router.refresh();
      showToast("Aircraft permanently deleted.", "success");
    },
    onError: (error) => {
      if (error.data?.code === "CONFLICT") {
        showToast(
          "Cannot permanently delete an aircraft with active flight logs. Please archive it instead.",
          "error"
        );
      } else {
        showToast("Failed to delete aircraft.", "error");
      }
    },
  });

  const restoreMutation = trpc.aircraft.restore.useMutation({
    onSuccess: async () => {
      await utils.aircraft.invalidate();
      router.refresh();
      showToast("Aircraft restored.", "success");
    },
    onError: (error) => {
      showToast(`Failed to restore aircraft: ${error.message}`, "error");
    },
  });

  // Dialog state
  const [archiveDialogState, setArchiveDialogState] = useState<{
    open: boolean;
    aircraftId: string | null;
    aircraftRegistration: string | null;
  }>({ open: false, aircraftId: null, aircraftRegistration: null });

  const [permanentDeleteDialogState, setPermanentDeleteDialogState] = useState<{
    open: boolean;
    aircraftId: string | null;
    aircraftRegistration: string | null;
  }>({ open: false, aircraftId: null, aircraftRegistration: null });

  const [restoreDialogState, setRestoreDialogState] = useState<{
    open: boolean;
    aircraftId: string | null;
    aircraftRegistration: string | null;
  }>({ open: false, aircraftId: null, aircraftRegistration: null });

  // Show only archived when checkbox is enabled; otherwise show active only
  const displayedAircraft = showArchived
    ? (aircraft ?? []).filter((a) => a.isArchived)
    : (aircraft ?? []);

  const handleArchiveClick = (aircraftId: string, registration: string) => {
    setArchiveDialogState({
      open: true,
      aircraftId,
      aircraftRegistration: registration,
    });
  };

  const handlePermanentDeleteClick = (aircraftId: string, registration: string) => {
    setPermanentDeleteDialogState({
      open: true,
      aircraftId,
      aircraftRegistration: registration,
    });
  };

  const handleRestoreClick = (aircraftId: string, registration: string) => {
    setRestoreDialogState({
      open: true,
      aircraftId,
      aircraftRegistration: registration,
    });
  };

  const handleConfirmArchive = async () => {
    if (!archiveDialogState.aircraftId) return;
    const aircraftId = archiveDialogState.aircraftId;
    try {
      await deleteMutation.mutateAsync({
        operation: "DELETE_AIRCRAFT",
        aircraftId: aircraftId,
      });
    } catch {
      // Error handled in onError
    }
  };

  const handleConfirmPermanentDelete = async () => {
    if (!permanentDeleteDialogState.aircraftId) return;
    const aircraftId = permanentDeleteDialogState.aircraftId;
    try {
      await deletePermanentMutation.mutateAsync({ id: aircraftId });
    } catch {
      // Error handled in onError
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreDialogState.aircraftId) return;
    const aircraftId = restoreDialogState.aircraftId;
    try {
      await restoreMutation.mutateAsync({ id: aircraftId });
    } catch {
      // Error handled in onError
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/5 blur-[150px] -z-10 pointer-events-none" />

      <AppHeader />

      <main className="flex-1 max-w-6xl mx-auto p-6 md:p-8 w-full relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="space-y-1 animate-in fade-in slide-in-from-left-4 duration-700">
            <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
              AIRCRAFT<span className="text-blue-500">.</span>
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
              {displayedAircraft.length} {showArchived ? 'Archived' : 'Active'} Units • {userName}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4 animate-in fade-in slide-in-from-right-4 duration-700">
            <label className="flex items-center gap-2 cursor-pointer select-none group">
              <div className={cn(
                "w-4 h-4 rounded border border-(--glass-border) flex items-center justify-center transition-all",
                showArchived ? "bg-blue-600 border-blue-600" : "bg-zinc-900/10 dark:bg-white/5"
              )}>
                <input
                  type="checkbox"
                  checked={showArchived}
                  onChange={() => setShowArchived((prev) => !prev)}
                  className="sr-only"
                />
                {showArchived && <Plus className="w-3 h-3 text-white rotate-45" />}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-foreground transition-colors">System Archives</span>
            </label>

            <Button asChild className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95 gap-2">
              <Link href="/aircraft/new">
                <Plus className="w-4 h-4" /> Add Aircraft
              </Link>
            </Button>
          </div>
        </div>

        <DeleteDialog
          open={archiveDialogState.open}
          onOpenChange={(open: boolean) =>
            setArchiveDialogState((prev) => ({ ...prev, open }))
          }
          title="Archive Aircraft"
          description="Archive this aircraft? You can restore it later from Archived Only."
          itemName={archiveDialogState.aircraftRegistration || ""}
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmArchive}
          confirmLabel="Archive"
          confirmVariant="secondary"
          titleClassName="text-foreground"
        />

        <DeleteDialog
          open={permanentDeleteDialogState.open}
          onOpenChange={(open: boolean) =>
            setPermanentDeleteDialogState((prev) => ({ ...prev, open }))
          }
          title="Delete Aircraft Permanently"
          description="This will permanently delete the aircraft and cannot be undone."
          itemName={permanentDeleteDialogState.aircraftRegistration || ""}
          isLoading={deletePermanentMutation.isPending}
          onConfirm={handleConfirmPermanentDelete}
          confirmLabel="Delete Permanently"
          requireConfirmText="DELETE"
        />

        <DeleteDialog
          open={restoreDialogState.open}
          onOpenChange={(open: boolean) =>
            setRestoreDialogState((prev) => ({ ...prev, open }))
          }
          title="Restore Aircraft"
          description="Are you sure you want to restore this aircraft to the active fleet?"
          itemName={restoreDialogState.aircraftRegistration || ""}
          isLoading={restoreMutation.isPending}
          onConfirm={handleConfirmRestore}
          confirmLabel="Restore to Fleet"
          confirmVariant="default"
          titleClassName="text-emerald-500"
        />

        {isLoading ? (
          <AircraftSkeleton />
        ) : displayedAircraft.length === 0 ? (
          <div className="rounded-2xl bg-(--glass-bg)/10 backdrop-blur-sm border border-(--glass-border) animate-in fade-in duration-500">
            <EmptyState
              icon={<Plane className="w-16 h-16 text-zinc-500/50" />}
              title={showArchived ? "Archive Stream Empty" : "Fleet Status: Null"}
              description={
                showArchived
                  ? "No historical records found in the archive repository."
                  : "Your fleet database is currently uninitialized. Register your first aircraft to begin operational tracking."
              }
              action={
                showArchived
                  ? { label: "Return to Active Fleet", onClick: () => setShowArchived(false) }
                  : { label: "Register Aircraft", href: "/aircraft/new" }
              }
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {displayedAircraft.map((a) => (
              <GlassCard key={a.id} className={cn(
                "overflow-hidden transition-all hover:border-blue-500/50 group",
                a.isArchived && "opacity-60 grayscale hover:grayscale-0 transition-all duration-500"
              )}>
                <div className="relative h-48 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900/50">
                  {/* Card HUD Scanline */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden z-20 opacity-20">
                    <div className="w-full h-[1px] bg-blue-500/30 blur-[1px] animate-hud-scanline" />
                  </div>

                  {a.imageUrl ? (
                    <Image
                      src={a.imageUrl}
                      alt={a.registration}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform group-hover:scale-105 duration-700"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-zinc-900/10 to-transparent">
                      <Plane className="w-12 h-12 text-zinc-300 dark:text-zinc-800/50" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3 z-30">
                    <span className={cn(
                      "text-[9px] px-2.5 py-1 rounded-sm uppercase font-black tracking-widest shadow-lg border border-white/10 backdrop-blur-md",
                      a.status === 'operational' ? 'annunciator-verified' :
                        a.status === 'maintenance' ? 'annunciator-flag' : 'bg-rose-500/90 text-white'
                    )}>
                      {a.status === 'operational' ? '[ OPERATIONAL ]' : `[ ${a.status.toUpperCase()} ]`}
                    </span>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-2xl font-black tracking-tighter text-foreground uppercase">{a.registration}</h3>
                    <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-zinc-900/5 dark:bg-white/5 border border-(--glass-border)">
                      <Clock className="w-3 h-3 text-blue-500" />
                      <span className="text-[11px] font-black tracking-widest text-foreground">{a.flightHours.toFixed(1)}H</span>
                    </div>
                  </div>

                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500 mb-6 italic">
                    {a.make} {a.model}
                  </p>

                  <div className="flex gap-2 pt-4 border-t border-(--glass-border)">
                    <Button asChild variant="outline" className="flex-1 h-10 rounded-xl border-(--glass-border) text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all bg-background/50 backdrop-blur-md" disabled={a.isArchived}>
                      <Link href={`/aircraft/${a.id}/edit`}>
                        <Edit2 className="w-3.5 h-3.5 mr-2" />
                        Configure
                      </Link>
                    </Button>
                    
                    {a.isArchived ? (
                      <div className="flex gap-2 flex-1">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 h-10 rounded-xl border-(--glass-border) text-emerald-500 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30"
                          onClick={() => handleRestoreClick(a.id, a.registration)}
                          disabled={restoreMutation.isPending}
                        >
                          <RefreshCw className={cn("w-3.5 h-3.5", restoreMutation.isPending && "animate-spin")} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1 h-10 rounded-xl"
                          onClick={() => handlePermanentDeleteClick(a.id, a.registration)}
                          disabled={deletePermanentMutation.isPending}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-rose-500 hover:bg-rose-500/5 transition-all"
                        onClick={() => handleArchiveClick(a.id, a.registration)}
                        disabled={deleteMutation.isPending}
                      >
                        <Archive className="w-3.5 h-3.5 mr-2" />
                        Archive
                      </Button>
                    )}
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
