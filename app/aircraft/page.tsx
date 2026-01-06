
"use client";



import { useState } from "react";
import { Aircraft } from "@prisma/client";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { DeleteDialog } from "@/components/DeleteDialog";
import Link from "next/link";
import { Edit2 } from "lucide-react";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import Image from "next/image";

export default function AircraftPage() {
  // Only show non-archived aircraft by default
  const { data: aircraft } = trpc.aircraft.getAll.useQuery({ includeArchived: false });
  const utils = trpc.useUtils();
  const router = useRouter();
  const deleteMutation = trpc.aircraft.delete.useMutation({
    onSuccess: async () => {
      await utils.aircraft.getAll.invalidate();
      router.refresh();
    },
  });

  // State for optimistic updates
  const [optimisticAircraft, setOptimisticAircraft] = useState<string[]>([]);
  const [deleteDialogState, setDeleteDialogState] = useState<{
    open: boolean;
    aircraftId: string | null;
    aircraftRegistration: string | null;
  }>({ open: false, aircraftId: null, aircraftRegistration: null });

  const displayedAircraft: Aircraft[] = ((aircraft ?? []) as Aircraft[]).filter(
    (a) => !optimisticAircraft.includes(a.id)
  );

  const handleDeleteClick = (aircraftId: string, registration: string) => {
    setDeleteDialogState({
      open: true,
      aircraftId,
      aircraftRegistration: registration,
    });
  };

  const handleConfirmDelete = async () => {
    if (!deleteDialogState.aircraftId) return;

    const aircraftId = deleteDialogState.aircraftId;

    // Optimistic update: immediately remove from UI
    setOptimisticAircraft((prev) => [...prev, aircraftId]);

    try {
      // Send delete request to server
      await deleteMutation.mutateAsync({ id: aircraftId });
      // Success - handled in onSuccess
    } catch (error) {
      // Rollback on error
      setOptimisticAircraft((prev) => prev.filter((id) => id !== aircraftId));
      console.error("Failed to delete aircraft:", error);
      throw error;
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <AppHeader />
      <main className="flex-1 max-w-6xl mx-auto p-6 md:p-8 w-full">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Aircraft</h1>
          <Button asChild>
            <Link href="/aircraft/new">Add Aircraft</Link>
          </Button>
        </div>

        <DeleteDialog
          open={deleteDialogState.open}
          onOpenChange={(open: boolean) =>
            setDeleteDialogState((prev) => ({ ...prev, open }))
          }
          title="Delete Aircraft"
          description="Are you sure you want to delete this aircraft? This action cannot be undone."
          itemName={deleteDialogState.aircraftRegistration || ""}
          isLoading={deleteMutation.isPending}
          onConfirm={handleConfirmDelete}
        />

        {displayedAircraft.length === 0 ? (
          <div className="bg-card text-foreground rounded-lg border border-border shadow p-8 text-center">
            <p className="text-muted-foreground mb-4">No aircraft yet.</p>
            <Button asChild>
              <Link href="/aircraft/new">Add your first aircraft</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedAircraft.map((a) => (
              <div key={a.id} className="bg-card text-foreground rounded-lg border border-border shadow p-6 hover:shadow-lg transition-shadow">
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
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    className="flex-1 text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteClick(a.id, a.registration)}
                    disabled={deleteMutation.isPending}
                    title="Delete aircraft"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
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
