"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Thermometer, Gauge, Ruler, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

const tools = [
  {
    title: "Performance Calculator",
    description: "Calculate Density Altitude and pressure altitudes for your flight planning.",
    icon: Thermometer,
    href: "/tools/performance",
    color: "text-blue-500",
    bgColor: "bg-blue-50 dark:bg-blue-900/20",
    status: "Active",
  },
  {
    title: "Weight & Balance",
    description: "Calculate Center of Gravity (CG) and weight limits for your aircraft.",
    icon: Gauge,
    href: "#",
    color: "text-amber-500",
    bgColor: "bg-amber-50 dark:bg-amber-900/20",
    status: "Coming Soon",
  },
  {
    title: "Fuel Planner",
    description: "Estimate fuel burn and reserves based on distance and wind conditions.",
    icon: Zap,
    href: "#",
    color: "text-green-500",
    bgColor: "bg-green-50 dark:bg-green-900/20",
    status: "Coming Soon",
  },
];

export default function ToolsDashboard() {
  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      <div className="mb-10 text-center md:text-left">
        <h1 className="text-4xl font-extrabold tracking-tight mb-3">Operational Tools</h1>
        <p className="text-xl text-muted-foreground flex items-center justify-center md:justify-start gap-2">
          Essential calculators for safe and efficient flight planning.
          <ShieldCheck className="w-5 h-5 text-green-500" />
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool) => (
          <Link 
            key={tool.title} 
            href={tool.href}
            className={`group transform transition-all hover:-translate-y-1 ${tool.status === "Coming Soon" ? "pointer-events-none opacity-80" : ""}`}
          >
            <Card className="h-full border-2 hover:border-blue-500 transition-colors relative overflow-hidden">
              {tool.status === "Coming Soon" && (
                <div className="absolute top-3 right-3 bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold px-2 py-0.5 rounded tracking-widest text-muted-foreground">
                  Planned
                </div>
              )}
              <CardHeader>
                <div className={`p-4 rounded-2xl w-fit mb-4 ${tool.bgColor} group-hover:scale-110 transition-transform`}>
                  <tool.icon className={`w-8 h-8 ${tool.color}`} />
                </div>
                <CardTitle className="text-xl group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {tool.title}
                </CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {tool.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="ghost" 
                  className="w-full justify-between hover:bg-transparent p-0 group-hover:translate-x-1 transition-transform"
                  disabled={tool.status === "Coming Soon"}
                >
                  <span className="font-semibold">{tool.status === "Coming Soon" ? "Coming Soon" : "Open Tool"}</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="mt-16 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-center max-w-2xl mx-auto">
        <h3 className="text-lg font-bold mb-2">Safety Notice</h3>
        <p className="text-sm text-muted-foreground italic">
          Tools provided here are for educational and supplemental use only. 
          As a Pilot in Command (PIC), you are responsible for using the certified aircraft performance data found in your Airplane Flight Manual (AFM).
        </p>
      </div>
    </div>
  );
}
