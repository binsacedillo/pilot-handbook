'use client';

import Cloud from "lucide-react/dist/esm/icons/cloud";
import CloudRain from "lucide-react/dist/esm/icons/cloud-rain";
import Search from "lucide-react/dist/esm/icons/search";
import Wind from "lucide-react/dist/esm/icons/wind";
import Eye from "lucide-react/dist/esm/icons/eye";
import CloudSun from "lucide-react/dist/esm/icons/cloud-sun";
import ThermometerSun from "lucide-react/dist/esm/icons/thermometer-sun";
/**
 * @component
 * @name Wind
 * @description Lucide SVG icon component, renders SVG Element with children.
 * @preview img - https://lucide.dev/icons/wind
 * @see https://lucide.dev/guide/packages/lucide-react - Documentation
 * @param props Lucide icons props and any valid SVG attribute
 * @returns JSX Element
 */
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, type KeyboardEvent } from "react";

interface WeatherWidgetProps {
  metar: {
    icao: string;
    raw: string;
    station: string;
    flightCategory: string;
    wind: {
      direction: number | null;
      speed: number | null;
      gust: number | null;
      unit: string;
    };
    visibility: {
      value: number | null;
      unit: string;
    };
    ceiling: {
      value: number | null;
      unit: string;
    };
    temperature: number | null;
    dewpoint: number | null;
    time: string;
  };
  isLoading?: boolean;
  error?: string | null;
  onAirportChange?: (icao: string) => void;
  onResetToFavorite?: () => void;
  isFavorite?: boolean;
}

// Flight category colors (FAA standard)
const getCategoryColor = (category: string): string => {
  switch (category) {
    case "VFR":
      return "text-green-600";
    case "MVFR":
      return "text-blue-600";
    case "IFR":
      return "text-red-600";
    case "LIFR":
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
};

const getCategoryBgColor = (category: string): string => {
  switch (category) {
    case "VFR":
      return "bg-green-100";
    case "MVFR":
      return "bg-blue-100";
    case "IFR":
      return "bg-red-100";
    case "LIFR":
      return "bg-purple-100";
    default:
      return "bg-gray-100";
  }
};

export function WeatherWidget({ metar, isLoading, error, onAirportChange, onResetToFavorite, isFavorite = false }: WeatherWidgetProps) {
  const [inputValue, setInputValue] = useState("");

  const handleSearch = () => {
    if (inputValue.length === 4 && onAirportChange) {
      onAirportChange(inputValue.toUpperCase());
      setInputValue("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const category = metar.flightCategory || "UNKNOWN";
  const windDirection =
    metar.wind.direction !== null && metar.wind.direction !== undefined
      ? `${metar.wind.direction.toString().padStart(3, "0")}°`
      : "VRB";
  const windSpeed = metar.wind.speed !== null && metar.wind.speed !== undefined ? `${metar.wind.speed} ${metar.wind.unit}` : "Calm";
  const windGust = metar.wind.gust ? ` G${metar.wind.gust}` : "";
  const visibility =
    metar.visibility.value !== null && metar.visibility.value !== undefined ? `${metar.visibility.value} ${metar.visibility.unit}` : "—";
  const ceiling = metar.ceiling.value !== null && metar.ceiling.value !== undefined ? `${metar.ceiling.value} ${metar.ceiling.unit}` : "Unlimited";
  const temperature = metar.temperature !== null && metar.temperature !== undefined ? `${metar.temperature}°C` : "—";
  const dewpoint = metar.dewpoint !== null && metar.dewpoint !== undefined ? `${metar.dewpoint}°C` : "—";
  const updatedTime = metar.time ? new Date(metar.time).toLocaleTimeString() : "—";

  // Conditional header logic
  const showHeader = metar.icao === metar.station ? metar.station : `${metar.station} - ${metar.icao}`;

  if (isLoading) {
    // Suggestion: The class `bg-gradient-to-br` can be written as `bg-linear-to-br` (suggestCanonicalClasses)
    // .bg-gradient-to-br {
    //   --tw-gradient-position: to bottom right in oklab;
    //   background-image: linear-gradient(var(--tw-gradient-stops));
    // }
    return (
      <Card className="rounded-xl border bg-linear-to-br from-slate-900/80 via-slate-900/60 to-slate-900/20 text-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            <Wind className="h-4 w-4" />
            Airport Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-28">
            <div className="animate-pulse text-slate-200">Loading weather...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="rounded-xl border bg-linear-to-br from-slate-900/80 via-slate-900/60 to-slate-900/20 text-white shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CloudRain className="h-4 w-4" />
            Airport Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-red-300">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-xl border bg-linear-to-br from-slate-900/90 via-slate-900/70 to-slate-900/30 text-white shadow-lg w-full max-w-md mx-auto lg:mx-0 lg:max-w-full p-2 lg:p-4">
      <CardHeader className="pb-0 px-2 lg:px-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CardTitle className="text-base font-semibold leading-tight">
              {showHeader}
            </CardTitle>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${getCategoryBgColor(category)} ${getCategoryColor(category)}`}
            >
              {category}
            </span>
          </div>

          {onAirportChange && (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="ICAO"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value.toUpperCase())}
                  onKeyDown={handleKeyDown}
                  maxLength={4}
                  className="h-10 w-24 text-xs uppercase bg-white/10 border-white/20 text-white placeholder:text-slate-300"
                />
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={handleSearch}
                  disabled={inputValue.length !== 4}
                  className="h-10 px-3 text-xs"
                >
                  <Search className="h-3 w-3" />
                  <span className="ml-1">Change</span>
                </Button>
              </div>
              {onResetToFavorite && !isFavorite && (
                <Button size="sm" variant="ghost" className="text-xs text-white/80" onClick={onResetToFavorite}>
                  Back to favorite
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-4 px-2 lg:px-4">
        <div className="grid gap-4 md:grid-cols-[1.1fr_1fr]">
          <div className="space-y-3">
            <div className="text-4xl font-semibold leading-tight">{temperature}</div>
            <p className="text-sm text-slate-200">Dewpoint {dewpoint}</p>
            <p className="text-sm text-slate-200">
              Wind {windDirection} @ {windSpeed}
              {windGust} | Vis {visibility}
            </p>
            <p className="text-sm text-slate-200">Ceiling {ceiling}</p>
            <p className="text-xs text-slate-300">Updated {updatedTime}</p>
            {isFavorite && <p className="text-xs text-slate-300">Favorite airport • Change in Settings</p>}
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm text-slate-100">
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-1 text-xs text-slate-300">
                <Eye className="h-4 w-4 inline-block" /> Visibility
              </div>
              <div className="text-base font-semibold">{visibility}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-1 text-xs text-slate-300">
                <CloudSun className="h-4 w-4 inline-block" /> Ceiling
              </div>
              <div className="text-base font-semibold">{ceiling}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-1 text-xs text-slate-300">
                <Wind className="h-4 w-4 inline-block" /> Wind
              </div>
              <div className="text-base font-semibold">{windDirection} @ {windSpeed}{windGust}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 p-3">
              <div className="flex items-center gap-1 text-xs text-slate-300">
                <ThermometerSun className="h-4 w-4 inline-block" /> Temp / Dew
              </div>
              <div className="text-base font-semibold">{temperature} / {dewpoint}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs font-mono overflow-x-auto">
          {metar.raw || "No METAR available"}
        </div>
      </CardContent>
    </Card>
  );
}
