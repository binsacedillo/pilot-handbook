"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { trpc } from "@/trpc/client";
import { type RouterOutputs } from "@/trpc/shared";

// Base Components
import DashboardSkeleton from "@/components/dashboard/DashboardSkeleton";
import PilotLegalityStatus from "@/components/dashboard/PilotLegalityStatus";
import ExperienceProgression from "@/components/dashboard/ExperienceProgression";
import { WeatherWidget } from "@/components/weather/WeatherWidget";

// Refactored Dashboard Components
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import RecentFlightsCard from "@/components/dashboard/RecentFlightsCard";
import QuickToolsSection from "@/components/dashboard/QuickToolsSection";
import UpcomingFlightCard from "@/components/dashboard/UpcomingFlightCard";
import PilotProfileCard from "@/components/dashboard/PilotProfileCard";

interface DashboardClientProps {
  initialData: {
    stats?: RouterOutputs["flight"]["getStats"] | null;
    summary?: RouterOutputs["stats"]["getSummary"] | null;
    aircraft: RouterOutputs["aircraft"]["getAll"];
    flights: RouterOutputs["flight"]["getRecent"];
    upcoming?: RouterOutputs["flight"]["getUpcoming"] | null;
  };
}

export default function DashboardClient({ initialData }: DashboardClientProps) {
  const { isLoaded, user } = useUser();
  const [isOffline, setIsOffline] = useState(false);
  const [hasMounted, setHasMounted] = useState(false);

  // Connectivity & Lifecycle Logic
  useEffect(() => {
    if (!hasMounted) {
      setHasMounted(true);
    }
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

  // tRPC Queries
  const enabled = !!user && isLoaded;
  
  const { data: stats } = trpc.flight.getStats.useQuery(undefined, {
    initialData: initialData.stats ?? undefined,
    enabled,
    staleTime: 1000 * 60,
    refetchOnMount: false,
  });
  
  const { data: flights } = trpc.flight.getRecent.useQuery({ limit: 6 }, {
    initialData: initialData.flights,
    enabled,
    staleTime: 1000 * 60,
    refetchOnMount: false,
  });

  const [minuteBucket, setMinuteBucket] = useState(0);

  useEffect(() => {
    if (hasMounted) {
      setMinuteBucket(Math.floor(Date.now() / 60000));
    }
  }, [hasMounted]);

  const stableNow = useMemo(() => {
    const d = minuteBucket ? new Date(minuteBucket * 60000) : new Date();
    return d.toISOString().split(':').slice(0, 2).join(':') + ':00.000Z';
  }, [minuteBucket]);

  const { data: upcomingFlight } = trpc.flight.getUpcoming.useQuery(
    { now: stableNow }, 
    {
      initialData: initialData.upcoming ?? undefined,
      enabled,
      staleTime: 1000 * 60,
      refetchOnMount: false,
    }
  );

  const [customIcao, setCustomIcao] = useState<string | null>(null);
  const { data: favoriteMetar, isLoading: favoriteLoading } = trpc.weather.getFavoriteAirportMetar.useQuery(undefined, {
    enabled: !customIcao && isLoaded,
    staleTime: 1000 * 60 * 5, // Weather is stable for at least 5 mins
    refetchOnWindowFocus: false,
  });
  const { data: customMetar, isLoading: customLoading } = trpc.weather.getMetar.useQuery(
    { icao: customIcao! },
    { 
      enabled: !!customIcao && isLoaded,
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    }
  );

  const metar = customIcao ? customMetar : favoriteMetar;
  const metarLoading = (customIcao ? customLoading : favoriteLoading) && !metar;

  if (!isLoaded) return <DashboardSkeleton />;

  const pilotName = user?.fullName || user?.firstName || "Pilot";

  return (
    <div className="flex flex-col gap-10">
          
          {hasMounted && isOffline && (
            <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 text-amber-500 px-4 py-3 text-sm backdrop-blur-md animate-pulse">
              <span className="font-black mr-2">!</span> Offline mode: showing cached data.
            </div>
          )}

          {/* 1. Header Area */}
          <DashboardHeader pilotName={pilotName} />

          <div className="flex flex-col gap-8">
            {/* 2. Global Status */}
            <div className="animate-in fade-in slide-in-from-top-4 duration-700">
              <PilotLegalityStatus
                pilotName={pilotName}
                initialStats={stats ?? undefined}
              />
            </div>

            {/* 3. Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[62fr_38fr] gap-8 items-start">
              
              {/* LEFT COLUMN: Operations & Activity */}
              <div className="space-y-8">
                <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
                   <ExperienceProgression 
                     totalHours={stats?.totalHours ?? 0} 
                     goalHours={stats?.profile?.totalHoursGoal ?? 1500}
                   />
                </section>

                <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-200">
                  <RecentFlightsCard flights={flights ?? []} />
                </section>

                <section className="animate-in fade-in slide-in-from-left-4 duration-700 delay-300">
                  <QuickToolsSection />
                </section>
              </div>

              {/* RIGHT COLUMN: Contextual Awareness */}
              <div className="space-y-8 sticky top-8">
                <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
                  <WeatherWidget
                    metar={metar || null}
                    isLoading={metarLoading}
                    onAirportChange={setCustomIcao}
                    onResetToFavorite={() => setCustomIcao(null)}
                    isFavorite={!customIcao}
                  />
                </section>

                <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-200">
                  <UpcomingFlightCard upcomingFlight={upcomingFlight ?? null} />
                </section>

                <section className="animate-in fade-in slide-in-from-right-4 duration-700 delay-300">
                  <PilotProfileCard user={user} stats={stats} />
                </section>
              </div>
            </div>
          </div>
    </div>
  );
}
