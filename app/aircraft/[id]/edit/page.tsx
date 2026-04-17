"use client";

import dynamicImport from "next/dynamic";
const AppHeader = dynamicImport(() => import("@/components/common/AppHeader"), { ssr: false });
import AppFooter from "@/components/common/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/toast";
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from "@/lib/error-utils";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter } from "@/components/ui/GlassCard";
import { ImageUpload } from "@/components/common/ImageUpload";
import { AircraftCardPreview } from "@/components/aircraft/AircraftCardPreview";
import { Plane, Hash, Image as ImageIcon, Activity, Info, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

import { AircraftEditorSkeleton } from "@/components/aircraft/AircraftEditorSkeleton";

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
			operation: "UPDATE_AIRCRAFT",
			aircraftId: id,
			changes: {
				make: form.make,
				model: form.model,
				registration: form.registration.toUpperCase(),
				imageUrl: form.imageUrl || undefined,
				status: form.status,
			},
			clientVersion: (aircraft as any).version ?? 1,
		});
	}

	if (isLoading) {
		return (
			<div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
				<AppHeader />
				<main className="flex-1 max-w-6xl mx-auto p-6 md:p-8 w-full relative z-10">
					<AircraftEditorSkeleton mode="configure" />
				</main>
				<AppFooter />
			</div>
		);
	}
	if (!aircraft) {
		return <div className="min-h-screen flex items-center justify-center text-red-500">Aircraft not found.</div>;
	}

	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
			{/* Decorative Cockpit Glows */}
			<div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />
			<div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/5 blur-[150px] -z-10 pointer-events-none" />
			
			<AppHeader />
			
			<main className="flex-1 max-w-6xl mx-auto p-6 md:p-8 w-full relative z-10">
				<div className="space-y-1 mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
					<h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground uppercase italic leading-none">
						CONFIGURE<span className="text-blue-500">.</span>
					</h1>
					<p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
						Unit ID: {id.slice(0, 8)}... • System Calibration Mode
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
					{/* Form Section */}
					<div className="lg:col-span-7 space-y-6">
						<form onSubmit={onSubmit}>
							<GlassCard className="border-border/50">
								<GlassCardHeader className="flex items-center gap-3">
									<div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
										<Plane className="w-4 h-4 text-blue-500" />
									</div>
									<div>
										<h2 className="text-sm font-black uppercase tracking-widest">Aircraft Specifications</h2>
										<p className="text-[10px] text-zinc-500 font-bold uppercase italic">Maintain operational accuracy</p>
									</div>
								</GlassCardHeader>
								
								<GlassCardContent className="space-y-6 pt-6">
									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="make" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
												<Info className="w-3 h-3" /> Manufacturer / Make
											</Label>
											<Input 
												id="make" 
												required 
												placeholder="e.g. Cessna"
												className="h-11 bg-zinc-900/5 dark:bg-white/5 border-(--glass-border) focus:border-blue-500/50 transition-all font-bold"
												value={form.make} 
												onChange={(e) => setForm({ ...form, make: e.target.value })} 
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="model" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
												<Info className="w-3 h-3" /> Model Designation
											</Label>
											<Input 
												id="model" 
												required 
												placeholder="e.g. 172S Skyhawk"
												className="h-11 bg-zinc-900/5 dark:bg-white/5 border-(--glass-border) focus:border-blue-500/50 transition-all font-bold"
												value={form.model} 
												onChange={(e) => setForm({ ...form, model: e.target.value })} 
											/>
										</div>
									</div>

									<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="registration" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
												<Hash className="w-3 h-3" /> Tail Number / REG
											</Label>
											<Input 
												id="registration" 
												required 
												placeholder="e.g. PH-ABC"
												className="h-11 bg-zinc-900/5 dark:bg-white/5 border-(--glass-border) focus:border-blue-500/50 transition-all font-bold uppercase"
												value={form.registration} 
												onChange={(e) => setForm({ ...form, registration: e.target.value })} 
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="status" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
												<Activity className="w-3 h-3" /> Operational Status
											</Label>
											<Select
												value={form.status}
												onValueChange={(value) => setForm({ ...form, status: value })}
											>
												<SelectTrigger id="status" className="h-11 bg-zinc-900/5 dark:bg-white/5 border-(--glass-border) focus:border-blue-500/50 transition-all font-bold">
													<SelectValue placeholder="Select status" />
												</SelectTrigger>
												<SelectContent className="bg-background/95 backdrop-blur-xl border-(--glass-border)">
													<SelectItem value="operational" className="focus:bg-blue-500/10 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
														<span className="w-2 h-2 rounded-full bg-emerald-500 inline-block mr-2 animate-pulse" /> Operational
													</SelectItem>
													<SelectItem value="maintenance" className="focus:bg-blue-500/10 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
														<span className="w-2 h-2 rounded-full bg-amber-500 inline-block mr-2 animate-pulse" /> Maintenance
													</SelectItem>
													<SelectItem value="retired" className="focus:bg-blue-500/10 font-bold uppercase text-[10px] tracking-widest flex items-center gap-2">
														<span className="w-2 h-2 rounded-full bg-rose-500 inline-block mr-2 animate-pulse" /> Retired
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="space-y-4">
										<Label htmlFor="imageUrl" className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
											<ImageIcon className="w-3 h-3" /> Aircraft Visual Hardware
										</Label>
										<ImageUpload 
											value={form.imageUrl}
											onChange={(url) => setForm({ ...form, imageUrl: url })}
											onRemove={() => setForm({ ...form, imageUrl: "" })}
										/>
									</div>
								</GlassCardContent>

								<GlassCardFooter className="flex justify-end gap-3 pt-6">
									<Button 
										type="button" 
										variant="ghost" 
										className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-all"
										onClick={() => router.push("/aircraft")}
									>
										<X className="w-4 h-4 mr-2" /> Abort Changes
									</Button>
									<Button 
										type="submit" 
										disabled={updateAircraft.isPending}
										className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
									>
										{updateAircraft.isPending ? (
											<span className="flex items-center gap-2">
												<span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
											</span>
										) : (
											<span className="flex items-center gap-2">
												<Save className="w-4 h-4" /> Commit Changes
											</span>
										)}
									</Button>
								</GlassCardFooter>
							</GlassCard>
						</form>
					</div>

					{/* Preview Section */}
					<div className="lg:col-span-5 sticky top-24">
						<AircraftCardPreview
							registration={form.registration}
							make={form.make}
							model={form.model}
							status={form.status}
							imageUrl={form.imageUrl}
							flightHours={aircraft.flightHours}
						/>
						
						<div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm">
							<div className="flex items-start gap-3">
								<Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
								<div className="space-y-1">
									<p className="text-[10px] font-black uppercase tracking-widest text-foreground">ISO-Compliance Check</p>
									<p className="text-[9px] font-bold text-zinc-500 leading-relaxed uppercase italic">
										Entries are validated against active flight logs. Registration changes will automatically synchronize with historical telemetry data.
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</main>
			<AppFooter />
		</div>
	);
}
