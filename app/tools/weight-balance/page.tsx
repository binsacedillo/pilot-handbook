"use client";

import WeightBalanceCalculator from "@/components/tools/WeightBalanceCalculator";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function WeightBalancePage() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <Link href="/tools">
            <Button variant="ghost" size="sm" className="mb-2 -ml-2 text-muted-foreground hover:text-blue-600">
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Tools
            </Button>
          </Link>
          <h1 className="text-3xl font-extrabold tracking-tight">Weight & Balance</h1>
          <p className="text-muted-foreground">Calculate loading and Center of Gravity (C172S Baseline)</p>
        </div>
      </div>

      <div className="space-y-10">
        <WeightBalanceCalculator />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <InfoCard 
            title="Importance of CG" 
            content="Center of Gravity (CG) affects the stability and control of the aircraft. A CG too far forward makes nose rotation difficult, while a CG too far aft can lead to uncontrollable stalling and spin characteristics."
          />
          <InfoCard 
            title="Standard Weights" 
            content="Standard weights often used in planning: AvGas (6 lbs/gal), Jet A (6.7 lbs/gal), Oil (7.5 lbs/gal). Always use actual weights for passengers and baggage when possible."
          />
          <InfoCard 
            title="Envelope Categories" 
            content="Most common aircraft have 'Normal' and 'Utility' categories with different weight and CG limits. This tool follows the Utility category limits for safety margin."
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
        <div className="w-1.5 h-4 bg-amber-500 rounded-full" />
        {title}
      </h3>
      <p className="text-sm text-muted-foreground leading-relaxed italic">{content}</p>
    </div>
  );
}
