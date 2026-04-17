"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trpc } from "@/trpc/client";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useFlightMutations } from "@/hooks/useFlightMutations";
import { Zap, CheckCircle2 } from "lucide-react";

export default function QuickFlightForm() {
  const { data: aircraft } = trpc.aircraft.getAll.useQuery();
  const { createFlight, isPending, isSuccess } = useFlightMutations({ aircraft });

  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    departureCode: "",
    arrivalCode: "",
    duration: "",
    aircraftId: "",
  });
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.aircraftId || !form.date || !form.departureCode || !form.arrivalCode || !form.duration) {
      setError("All fields are required for Quick Log.");
      return;
    }

    createFlight.mutate({
      operation: "CREATE_FLIGHT",
      data: {
        date: new Date(form.date),
        departureCode: form.departureCode.toUpperCase(),
        arrivalCode: form.arrivalCode.toUpperCase(),
        duration: Number(form.duration),
        picTime: Number(form.duration), // Default PIC to total duration for speed
        dualTime: 0,
        nightLandings: 0,
        aircraftId: form.aircraftId,
        dayLandings: 1, // Common default
      },
    });
  }

  if (isSuccess) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mb-2">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-black uppercase tracking-tighter text-foreground">Flight Logged Successfully</h3>
        <p className="text-xs text-zinc-500 max-w-[240px]">Full details can be managed from the logbook table at any time.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setForm({ ...form, departureCode: "", arrivalCode: "", duration: "" })}
          className="mt-4 border-zinc-800 text-[10px] font-black uppercase tracking-widest"
        >
          Log Another
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {error && (
        <div className="bg-rose-500/10 text-rose-500 rounded-lg px-4 py-3 text-[10px] font-bold uppercase tracking-widest border border-rose-500/20">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Date</Label>
          <Input
            type="date"
            required
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="bg-zinc-900/50 border-zinc-800 text-sm h-10 font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Aircraft</Label>
          <Select
            value={form.aircraftId}
            onValueChange={(value) => setForm({ ...form, aircraftId: value })}
          >
            <SelectTrigger className="bg-zinc-900/50 border-zinc-800 text-sm h-10">
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800">
              {(aircraft ?? []).map((a) => (
                <SelectItem key={a.id} value={a.id} className="text-xs">
                  {a.registration}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">DEP</Label>
          <Input
            placeholder="KJFK"
            maxLength={4}
            required
            value={form.departureCode}
            onChange={(e) => setForm({ ...form, departureCode: e.target.value })}
            className="bg-zinc-900/50 border-zinc-800 text-center font-mono uppercase h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">ARR</Label>
          <Input
            placeholder="KBOS"
            maxLength={4}
            required
            value={form.arrivalCode}
            onChange={(e) => setForm({ ...form, arrivalCode: e.target.value })}
            className="bg-zinc-900/50 border-zinc-800 text-center font-mono uppercase h-10"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Hrs</Label>
          <Input
            type="number"
            step="0.1"
            placeholder="1.5"
            required
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            className="bg-zinc-900/50 border-zinc-800 text-center font-mono h-10 text-blue-400 font-bold"
          />
        </div>
      </div>

      <Button 
        type="submit" 
        disabled={isPending}
        className="w-full h-11 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 gap-2"
      >
        <Zap className={cn("w-3.5 h-3.5 fill-current", isPending && "animate-pulse")} />
        {isPending ? "Transmitting..." : "Quick Save"}
      </Button>
      
      <p className="text-[9px] text-zinc-600 text-center font-medium uppercase tracking-tighter">
        PIC Time & 1 Day Landing will be recorded automatically.
      </p>
    </form>
  );
}
