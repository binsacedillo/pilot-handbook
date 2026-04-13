"use client";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import AppHeader from "@/components/common/AppHeader";
import AppFooter from "@/components/common/AppFooter";
import PilotLegalityStatus from "@/components/dashboard/PilotLegalityStatus";
import DashboardClient from "./dashboard-client";
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type RouterOutputs } from "@/trpc/shared";

interface DashboardPageClientProps {
  initialData: {
    stats?: RouterOutputs["flight"]["getStats"] | null;
    summary?: RouterOutputs["stats"]["getSummary"] | null;
    aircraft: RouterOutputs["aircraft"]["getAll"];
    flights: RouterOutputs["flight"]["getRecent"];
    upcoming?: RouterOutputs["flight"]["getUpcoming"] | null;
  };
}

export default function DashboardPageClient({
  initialData
}: DashboardPageClientProps) {
  const { isLoaded, user } = useUser();
  const [isOffline, setIsOffline] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    if (typeof navigator !== "undefined") {
      setIsOffline(!navigator.onLine);
    }

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!isLoaded) return <DashboardSkeleton />;

  const pilotName = user?.fullName || user?.firstName || "Pilot";

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Decorative Cockpit Glows */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-blue-500/5 dark:bg-blue-600/5 blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 dark:bg-indigo-600/5 blur-[150px] -z-10 pointer-events-none" />

      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 relative z-10">
        <div className="flex flex-col gap-10">
          
          {hasMounted && isOffline && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-500 px-4 py-3 text-sm backdrop-blur-md animate-pulse">
              <span className="font-black mr-2">!</span> Offline mode: showing cached data.
            </div>
          )}

          {/* Welcome Area */}
          <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-1">
            <div className="space-y-2 animate-in fade-in slide-in-from-left-4 duration-700">
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter text-foreground">
                DASHBOARD<span className="text-blue-500">.</span>
              </h1>
              <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-zinc-500 dark:text-zinc-400 light:text-slate-500">
                System Status: <span className="text-emerald-500">ONLINE</span> • 
                Active Pilot: <span className="text-foreground">{pilotName}</span>
              </p>
            </div>

            <div className="flex gap-3 animate-in fade-in slide-in-from-right-4 duration-700">
              <Button asChild variant="outline" className="h-12 px-6 rounded-xl border-(--glass-border) text-[11px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all bg-background/50 backdrop-blur-md">
                <Link href="/flights">Logbook</Link>
              </Button>
              <Button asChild className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                <Link href="/flights?new=true">Log Flight</Link>
              </Button>
            </div>
          </header>

          <div className="flex flex-col gap-8">
            {/* Header: Go/No-Go Status (Full Width) */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <PilotLegalityStatus
                pilotName={pilotName}
                initialStats={initialData.stats ?? undefined}
              />
            </div>

            {/* Main Grid: Mission Data & Support (Trench Layout) */}
            <DashboardClient 
              initialStats={initialData.stats ?? undefined} 
              initialFlights={initialData.flights} 
              initialAircraft={initialData.aircraft}
              initialUpcoming={initialData.upcoming ?? undefined}
            />
          </div>
        </div>
      </main>
      
      <AppFooter />
    </div>
  );
}
