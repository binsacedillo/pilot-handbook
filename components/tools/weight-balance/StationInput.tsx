"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Weight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StationInputProps {
  id: string;
  name: string;
  arm: number;
  value: number;
  onChange: (id: string, val: string) => void;
  compact?: boolean;
}

/**
 * Reusable station weight input with consistent styling.
 */
export function StationInput({ 
  id, 
  name, 
  arm, 
  value, 
  onChange, 
  compact = false 
}: StationInputProps) {
  return (
    <div className="flex flex-col gap-1 sm:gap-2">
      <div className="flex justify-between items-center">
        <Label htmlFor={id} className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-zinc-500">
          {name}
        </Label>
        {!compact && (
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
            Arm: {arm}&quot;
          </span>
        )}
      </div>
      <div className="relative">
        <Input
          id={id}
          type="number"
          placeholder="0"
          className={cn(
            "h-11 sm:h-12 rounded-xl border-white/5 font-bold transition-all",
            compact ? "bg-zinc-900 text-base" : "bg-zinc-50 dark:bg-zinc-900 border-none shadow-inner pl-9"
          )}
          value={value || ""}
          onChange={(e) => onChange(id, e.target.value)}
        />
        {!compact && <Weight className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400" />}
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-zinc-600 uppercase">lbs</span>
      </div>
    </div>
  );
}
