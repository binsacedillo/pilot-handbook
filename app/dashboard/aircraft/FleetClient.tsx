"use client";
import { useQueryClient } from "@tanstack/react-query";
import { trpc } from "../../../trpc/client";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2 } from "lucide-react";
import {
    Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogClose, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from "@/lib/error-utils";

export default function FleetClient() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const { data: aircraft, isLoading } = trpc.aircraft.getAll.useQuery({ includeArchived: true });
    const restoreMutation = trpc.aircraft.restore.useMutation();
    const deleteMutation = trpc.aircraft.delete.useMutation();

    if (isLoading) return <div>Loading...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Fleet Management</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {aircraft?.map((ac) => (
                    <div key={ac.id} className="rounded-lg border bg-white dark:bg-zinc-900 p-4 shadow flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                            <div className="font-semibold text-lg">
                                {ac.make} {ac.model} ({ac.registration})
                            </div>
                            <Badge variant={ac.isArchived ? "secondary" : "success"}>
                                {ac.isArchived ? "Archived" : "Active"}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-2">
                            <label className="flex items-center gap-2">
                                <span>Archived</span>
                                <Switch
                                    checked={ac.isArchived}
                                    onCheckedChange={async (checked) => {
                                        try {
                                            if (checked) {
                                                await deleteMutation.mutateAsync({ id: ac.id }); // Archive
                                            } else {
                                                await restoreMutation.mutateAsync({ id: ac.id }); // Unarchive
                                            }
                                            queryClient.invalidateQueries({ queryKey: ["aircraft.getAll"] });
                                            showToast(`Aircraft ${checked ? 'archived' : 'restored'} successfully`, "success");
                                        } catch (err) {
                                            const action = checked ? "archive" : "restore";
                                            const errorMessage = isNetworkError(err)
                                                ? getNetworkErrorMessage(`${action} aircraft`)
                                                : getServerErrorMessage(`${action} aircraft`, err);
                                            showToast(errorMessage, "error", {
                                                action: {
                                                    label: "Retry",
                                                    onClick: async () => {
                                                        try {
                                                            if (checked) {
                                                                await deleteMutation.mutateAsync({ id: ac.id });
                                                            } else {
                                                                await restoreMutation.mutateAsync({ id: ac.id });
                                                            }
                                                            queryClient.invalidateQueries({ queryKey: ["aircraft.getAll"] });
                                                        } catch (retryErr) {
                                                            showToast(getServerErrorMessage(`${action} aircraft`, retryErr), "error");
                                                        }
                                                    },
                                                },
                                            });
                                        }
                                    }}
                                />
                            </label>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button 
                                        variant="destructive" 
                                        size="sm"
                                        aria-label={`Delete aircraft ${ac.make} ${ac.model} ${ac.registration}`}
                                    >
                                        <Trash2 className="w-5 h-5" aria-hidden="true" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Delete Aircraft?</DialogTitle>
                                        <DialogDescription>
                                            This action cannot be undone. Are you sure you want to permanently delete <b>{ac.make} {ac.model} ({ac.registration})</b>?
                                        </DialogDescription>
                                    </DialogHeader>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="secondary">Cancel</Button>
                                        </DialogClose>
                                        <Button
                                            variant="destructive"
                                            onClick={async () => {
                                                try {
                                                    await deleteMutation.mutateAsync({ id: ac.id });
                                                    queryClient.invalidateQueries({ queryKey: ["aircraft.getAll"] });
                                                    showToast("Aircraft deleted successfully.", "success");
                                                } catch (err) {
                                                    const errorMessage = isNetworkError(err)
                                                        ? getNetworkErrorMessage("delete aircraft")
                                                        : getServerErrorMessage("delete aircraft", err);
                                                    showToast(errorMessage, "error", {
                                                        action: {
                                                            label: "Retry",
                                                            onClick: async () => {
                                                                try {
                                                                    await deleteMutation.mutateAsync({ id: ac.id });
                                                                    queryClient.invalidateQueries({ queryKey: ["aircraft.getAll"] });
                                                                    showToast("Aircraft deleted successfully.", "success");
                                                                } catch (retryErr) {
                                                                    showToast(getServerErrorMessage("delete aircraft", retryErr), "error");
                                                                }
                                                            },
                                                        },
                                                    });
                                                }
                                            }}
                                        >
                                            Delete
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
