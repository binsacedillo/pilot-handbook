
"use client";

import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from "@/lib/error-utils";

export default function EditAircraftPage() {
	const router = useRouter();
	const params = useParams();
	const id = typeof params.id === "string" ? params.id : (Array.isArray(params.id) ? params.id[0] : "") || "";
	const utils = trpc.useUtils();
	const { showToast } = useToast();
	const { data: aircraft, isLoading } = trpc.aircraft.getById.useQuery({ id: id! }, { enabled: !!id });
	const updateAircraft = trpc.aircraft.update.useMutation({
		onSuccess: async () => {
			await utils.aircraft.getAll.invalidate();
			showToast("Aircraft updated successfully!", "success");
			router.push("/aircraft");
		},
		onError: (err, variables) => {
			const errorMessage = isNetworkError(err)
				? getNetworkErrorMessage("update aircraft")
				: getServerErrorMessage("update aircraft", err);
			showToast(errorMessage, "error", {
				action: {
					label: "Retry",
					onClick: () => updateAircraft.mutate(variables),
				},
			});
		},
	});

	const [form, setForm] = useState({
		make: "",
		model: "",
		registration: "",
		imageUrl: "",
		status: "operational",
	});

	useEffect(() => {
		if (aircraft) {
			// eslint-disable-next-line react-hooks/set-state-in-effect
			setForm({
				make: aircraft.make || "",
				model: aircraft.model || "",
				registration: aircraft.registration || "",
				imageUrl: aircraft.imageUrl || "",
				status: aircraft.status || "operational",
			});
		}
	}, [aircraft]);

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		if (!id) return;
		updateAircraft.mutate({
			id,
			make: form.make,
			model: form.model,
			registration: form.registration.toUpperCase(),
			imageUrl: form.imageUrl || undefined,
			status: form.status,
		});
	}

	if (isLoading) {
		return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
	}
	if (!aircraft) {
		return <div className="min-h-screen flex items-center justify-center text-red-500">Aircraft not found.</div>;
	}

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col">
			<AppHeader />
			<main className="flex-1 max-w-2xl mx-auto p-6 md:p-8 w-full">
				<h1 className="text-2xl md:text-3xl font-bold mb-6">Edit Aircraft</h1>
				<form onSubmit={onSubmit} className="bg-card text-card-foreground rounded-lg border border-border shadow p-6 space-y-6">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="make">Make</Label>
							<Input id="make" required value={form.make} onChange={(e) => setForm({ ...form, make: e.target.value })} />
						</div>
						<div>
							<Label htmlFor="model">Model</Label>
							<Input id="model" required value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
						</div>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div>
							<Label htmlFor="registration">Registration</Label>
							<Input id="registration" required value={form.registration} onChange={(e) => setForm({ ...form, registration: e.target.value })} />
						</div>
						<div>
							<Label htmlFor="status">Status</Label>
							<Select
								value={form.status}
								onValueChange={(value) => setForm({ ...form, status: value })}
							>
								<SelectTrigger id="status" className="w-full">
									<SelectValue placeholder="Select status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="operational">Operational</SelectItem>
									<SelectItem value="maintenance">Maintenance</SelectItem>
									<SelectItem value="retired">Retired</SelectItem>
								</SelectContent>
							</Select>
						</div>
					</div>
					<div>
						<Label htmlFor="imageUrl">Image URL</Label>
						<Input id="imageUrl" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
					</div>
					<div className="flex justify-end gap-2">
						<Button type="button" variant="ghost" onClick={() => router.push("/aircraft")}>Cancel</Button>
						<Button type="submit" disabled={updateAircraft.isPending}>{updateAircraft.isPending ? "Saving..." : "Save Changes"}</Button>
					</div>
				</form>
			</main>
			<AppFooter />
		</div>
	);
}
