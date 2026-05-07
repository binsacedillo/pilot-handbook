"use client";

import React from "react";
import { Plane } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Aircraft {
  id: string;
  registration: string;
  make: string;
  model: string;
}

interface AircraftSelectionProps {
  aircraft: Aircraft[] | undefined;
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function AircraftSelection({ aircraft, loading, selectedId, onSelect }: AircraftSelectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 text-left">
      {aircraft?.map((ac) => (
        <Card 
          key={ac.id} 
          className={cn(
            "cursor-pointer transition-all duration-300 border-2",
            selectedId === ac.id 
              ? "border-blue-500 bg-blue-500/5 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
              : "border-zinc-800 hover:border-zinc-700 bg-zinc-950/40"
          )}
          onClick={() => onSelect(ac.id)}
        >
          <CardHeader className="p-4 sm:p-6">
            <div className="flex justify-between items-start">
              <div className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border bg-blue-500/20 text-blue-400 border-blue-500/30">
                {ac.registration}
              </div>
              <Plane className={cn("w-5 h-5", selectedId === ac.id ? "text-blue-500" : "text-zinc-600")} />
            </div>
            <CardTitle className="mt-4 text-lg">{ac.make} {ac.model}</CardTitle>
          </CardHeader>
        </Card>
      ))}
      {loading && (
        <p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] animate-pulse p-4">
          Scanning Fleet...
        </p>
      )}
    </div>
  );
}
