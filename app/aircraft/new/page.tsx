
"use client";
export const dynamic = "force-dynamic";

import dynamicImport from "next/dynamic";
const AppHeader = dynamicImport(() => import("@/components/common/AppHeader"), { ssr: false });
import AppFooter from "@/components/common/AppFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/components/ui/toast";
import { isNetworkError, getNetworkErrorMessage, getServerErrorMessage } from "@/lib/error-utils";
import { ImageUpload } from "@/components/common/ImageUpload";
import { GlassCard, GlassCardContent, GlassCardHeader, GlassCardFooter } from "@/components/ui/GlassCard";
import { AircraftCardPreview } from "@/components/aircraft/AircraftCardPreview";
import { Plane, Hash, Image as ImageIcon, Activity, Info, Save, X, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function NewAircraftPage() {
  const router = useRouter();
  const utils = trpc.useUtils();
  const { showToast } = useToast();
  const createAircraft = trpc.aircraft.create.useMutation({
    onSuccess: async () => {
      await utils.aircraft.getAll.invalidate();
      showToast("Aircraft created successfully!", "success");
      router.push("/aircraft");
    },
    onError: (err, variables) => {
      const errorMessage = isNetworkError(err)
        ? getNetworkErrorMessage("create aircraft")
        : getServerErrorMessage("create aircraft", err);
      showToast(errorMessage, "error", {
        action: {
          label: "Retry",
          onClick: () => createAircraft.mutate(variables),
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

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    createAircraft.mutate({
      operation: "CREATE_AIRCRAFT",
      data: {
        make: form.make,
        model: form.model,
        registration: form.registration.toUpperCase(),
        imageUrl: form.imageUrl || undefined,
        status: form.status,
      },
    });
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
            REGISTER<span className="text-blue-500">.</span>
          </h1>
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
            System Initialization // New Unit Registration
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Form Section */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={onSubmit}>
              <GlassCard className="border-border/50">
                <GlassCardHeader className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <Plus className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-widest">Initialization Parameters</h2>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase italic">Enter core aircraft telemetry</p>
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
                        <Activity className="w-3 h-3" /> Initial Status
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
                      <ImageIcon className="w-3 h-3" /> Aircraft Visual Hardware (optional)
                    </Label>
                    <ImageUpload 
                      value={form.imageUrl}
                      onChange={(url) => setForm({ ...form, imageUrl: url })}
                      onRemove={() => setForm({ ...form, imageUrl: "" })}
                    />
                  </div>
                </GlassCardContent>

                <GlassCardFooter className="flex items-center gap-3 pt-6">
                  <Button 
                    type="submit" 
                    disabled={createAircraft.isPending}
                    className="h-11 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95"
                  >
                    {createAircraft.isPending ? (
                      <span className="flex items-center gap-2">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Save className="w-4 h-4" /> Initialize Unit
                      </span>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-foreground transition-all"
                    onClick={() => router.back()}
                  >
                    <X className="w-4 h-4 mr-2" /> Cancel Initialization
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
              flightHours={0}
            />
            
            <div className="mt-8 p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 backdrop-blur-sm">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-foreground">Operational Protocol</p>
                  <p className="text-[9px] font-bold text-zinc-500 leading-relaxed uppercase italic">
                    New units are assigned a unique system hash for lifetime telemetry tracking. Ensure tail number matches aviation records for compliance.
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
