"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FuelInputProps {
  id: string;
  label: string;
  value: number;
  unit: string;
  icon?: React.ReactNode;
  onChange: (id: string, value: string) => void;
  compact?: boolean;
}

export function FuelInput({ 
  id, 
  label, 
  value, 
  unit, 
  icon, 
  onChange, 
  compact = false 
}: FuelInputProps) {
  return (
    <div className={cn("space-y-1.5 sm:space-y-2 text-left", !compact && "grid gap-3")}>
      <Label 
        htmlFor={id} 
        className={cn(
          "font-black uppercase tracking-widest flex items-center gap-2",
          compact ? "text-[10px] sm:text-xs text-zinc-500" : "text-sm text-zinc-600 dark:text-zinc-400"
        )}
      >
        {icon}
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type="number"
          className={cn(
            "h-11 sm:h-12 rounded-xl transition-all font-bold",
            compact ? "bg-zinc-900 border-white/5 text-base" : "bg-zinc-50 dark:bg-zinc-900 border-none shadow-inner pl-9"
          )}
          value={value || ""}
          onChange={(e) => onChange(id, e.target.value)}
        />
        {!compact && icon && (
          <div className="absolute left-3 top-3.5 w-4 h-4 text-zinc-400">
            {icon}
          </div>
        )}
        <span className={cn(
          "absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black uppercase",
          compact ? "text-zinc-600" : "text-zinc-400"
        )}>
          {unit}
        </span>
      </div>
    </div>
  );
}
