"use client";

import React from "react";
import { PlayCircle, Flag } from "lucide-react";

interface FuelItemProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  total: number;
  color: string;
}

function FuelItem({ icon, label, value, total, color }: FuelItemProps) {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-2">
       <div className="flex justify-between items-center text-sm font-bold">
          <div className="flex items-center gap-2">
            <div className={`p-1 rounded-md bg-muted text-foreground`}>{icon}</div>
            <span>{label}</span>
          </div>
          <span>{value} GAL</span>
       </div>
       <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} transition-all duration-500 ease-out`} 
            style={{ width: `${percentage}%` }}
          />
       </div>
    </div>
  );
}

export function FuelBreakdown({ 
  tripFuel, 
  reserveFuel, 
  taxiFuel, 
  contingencyFuel, 
  totalRequired 
}: { 
  tripFuel: number; 
  reserveFuel: number; 
  taxiFuel: number; 
  contingencyFuel: number; 
  totalRequired: number;
}) {
  return (
    <div className="space-y-6">
      <FuelItem 
        icon={<PlayCircle className="w-4 h-4" />} 
        label="Trip Fuel" 
        value={tripFuel} 
        total={totalRequired} 
        color="bg-blue-500"
      />
      <FuelItem 
        icon={<Flag className="w-4 h-4" />} 
        label="Reserve Fuel" 
        value={reserveFuel} 
        total={totalRequired} 
        color="bg-amber-500"
      />
      <div className="grid grid-cols-2 gap-4">
         <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Taxi/Start</p>
            <p className="text-sm font-bold">{taxiFuel} Gal</p>
         </div>
         <div className="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-dashed">
            <p className="text-[10px] text-muted-foreground uppercase font-bold mb-1">Contingency (10%)</p>
            <p className="text-sm font-bold">{contingencyFuel} Gal</p>
         </div>
      </div>
    </div>
  );
}
