"use client";

import FuelPlanner from "@/components/tools/FuelPlanner";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function FuelPlannerPage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-blue-600">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tools
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Fuel Planner</h1>
          <p className="text-muted-foreground">Estimated Trip & Reserve Requirements</p>
        </div>
      </div>

      <div className="space-y-10">
        <FuelPlanner />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <InfoCard 
            title="Accounting for Wind" 
            content="Estimated groundspeed should be calculated by taking your aircraft's True Airspeed (TAS) and adding or subtracting the headwind/tailwind component. Headwinds reduce groundspeed and increase fuel requirements."
          />
          <InfoCard 
            title="VFR Reserves" 
            content="Federal Aviation Regulations (FAR) part 91.151 specifies a minimum of 30 minutes of reserve fuel for day VFR and 45 minutes for night VFR. Use 60 minutes for additional safety margin."
          />
        </div>
      </div>
    </div>
  );
}

function InfoCard({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-6 rounded-2xl border bg-card text-card-foreground shadow-sm">
      <h3 className="font-bold mb-3 flex items-center gap-2">
        <div className="w-1.5 h-4 bg-green-500 rounded-full" />
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed italic">{content}</p>
    </div>
  );
}
