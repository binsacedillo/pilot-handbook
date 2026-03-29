"use client";

import DensityAltitudeCalculator from "@/components/tools/DensityAltitudeCalculator";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PerformancePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-blue-600">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tools
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Performance Calculator</h1>
          <p className="text-muted-foreground">Density Altitude & Atmospheric Data</p>
        </div>
      </div>

      <div className="space-y-8">
        <DensityAltitudeCalculator />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <CardWithHeader 
            title="What is Density Altitude?" 
            content="Density altitude is pressure altitude corrected for non-standard temperature. As temperature rises, air density decreases, meaning the aircraft performs as if it were at a higher altitude."
          />
          <CardWithHeader 
            title="Impact on Performance" 
            content="High density altitude reduces engine power, lift, and propeller efficiency. Expectations should be adjusted for longer takeoff rolls and decreased climb rates."
          />
        </div>
      </div>
    </div>
  );
}

function CardWithHeader({ title, content }: { title: string; content: string }) {
  return (
    <div className="p-5 rounded-2xl border bg-card text-card-foreground shadow-sm">
      <h3 className="font-bold mb-2 flex items-center gap-2">
        <div className="w-1.5 h-4 bg-blue-500 rounded-full" />
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{content}</p>
    </div>
  );
}
