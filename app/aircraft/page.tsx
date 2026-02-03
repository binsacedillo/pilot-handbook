
"use client";



import { useState } from "react";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Trash2, RefreshCw, Plane, Edit2, Archive } from "lucide-react";
import { DeleteDialog } from "@/components/DeleteDialog";
import Link from "next/link";
import dynamicImport from "next/dynamic";
const AppHeader = dynamicImport(() => import("@/components/AppHeader"), { ssr: false });
import AppFooter from "@/components/AppFooter";
import Image from "next/image";
import { useToast } from "@/components/ui/toast";
import EmptyState from "@/components/EmptyState";


export default function AircraftPage() {
  const [showArchived, setShowArchived] = useState(false);
  const { data: aircraft, isLoading } = trpc.aircraft.getAll.useQuery({ includeArchived: showArchived });
  const utils = trpc.useUtils();
  const router = useRouter();
  const { showToast } = useToast();
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

  const handleConfirmArchive = async () => {
    if (!archiveDialogState.aircraftId) return;
    const aircraftId = archiveDialogState.aircraftId;
    try {
      await deleteMutation.mutateAsync({ id: aircraftId });
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

  const handleRestore = async (aircraftId: string) => {
    await restoreMutation.mutateAsync({ id: aircraftId });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />

      <main className="flex-1 max-w-6xl mx-auto p-6 md:p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Aircraft</h1>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showArchived}
                onChange={() => setShowArchived((prev) => !prev)}
                className="accent-primary"
              />
              <span className="text-sm">Archived Only</span>
            </label>
            <Button asChild>
              <Link href="/aircraft/new">Add Aircraft</Link>
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

        {isLoading ? (
          <div className="bg-card text-foreground rounded-lg border-2 border-orange-500 dark:border-orange-400 shadow p-8 text-center">
            <p className="text-muted-foreground mb-4">Loading…</p>
          </div>
        ) : displayedAircraft.length === 0 ? (
          <EmptyState
            icon={<Plane className="w-16 h-16 text-muted-foreground" />}
            title={showArchived ? "No Archived Aircraft" : "No Aircraft Yet"}
            description={
              showArchived
                ? "You don't have any archived aircraft. Archive an aircraft to manage it here."
                : "Start building your fleet by adding your first aircraft. You'll be able to track flights and manage your aviation logbook."
            }
            action={
              showArchived
                ? { label: "Show Active Aircraft", onClick: () => setShowArchived(false) }
                : { label: "Add Your First Aircraft", href: "/aircraft/new" }
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedAircraft.map((a) => (
              <div key={a.id} className={`bg-card text-foreground rounded-lg border-2 border-orange-500 dark:border-orange-400 shadow p-6 hover:shadow-lg transition-shadow ${a.isArchived ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{a.registration}</h3>
                  <span className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground">
                    {a.status}
                  </span>
                </div>
                <p className="text-muted-foreground mb-4">
                  {a.make} {a.model}
                </p>
                {a.imageUrl ? (
                  <Image
                    src={a.imageUrl}
                    alt={a.registration}
                    width={400}
                    height={160}
                    className="mt-4 rounded-md max-h-40 object-cover w-full mb-4"
                  />
                ) : null}
                <div className="flex gap-2 pt-4 border-t border-border">
                  <Link href={`/aircraft/${a.id}/edit`} className="flex-1">
                    <Button
                      variant="ghost"
                      className="w-full text-primary hover:bg-muted"
                      title="Edit aircraft"
                      disabled={a.isArchived}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  {a.isArchived ? (
                    <>
                      <Button
                        variant="ghost"
                        className="flex-1 text-green-600 hover:bg-green-100"
                        onClick={() => handleRestore(a.id)}
                        disabled={restoreMutation.isPending}
                        title="Restore aircraft"
                      >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        variant="ghost"
                        className="flex-1 text-destructive hover:bg-destructive/10"
                        onClick={() => handlePermanentDeleteClick(a.id, a.registration)}
                        disabled={deletePermanentMutation.isPending}
                        title="Delete aircraft permanently"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Permanently
                      </Button>
                    </>
                  ) : (
                    <Button
                      variant="ghost"
                      className="flex-1 text-slate-700 dark:text-slate-200 hover:bg-muted"
                      onClick={() => handleArchiveClick(a.id, a.registration)}
                      disabled={deleteMutation.isPending}
                      title="Archive aircraft"
                    >
                      <Archive className="w-4 h-4 mr-2" />
                      Archive
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <AppFooter />
    </div>
  );
}
