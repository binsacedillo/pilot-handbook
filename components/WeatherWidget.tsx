import { Cloud, CloudRain, Sun, Wind, Eye, Thermometer } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

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

export function WeatherWidget({ metar, isLoading, error }: WeatherWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            Airport Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-24">
            <div className="animate-pulse text-muted-foreground">Loading...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <CloudRain className="h-4 w-4" />
            Airport Weather
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-red-600">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <Cloud className="h-4 w-4" />
            {metar.icao} - {metar.station}
          </CardTitle>
          <div
            className={`px-2 py-1 rounded text-xs font-bold ${getCategoryBgColor(
              metar.flightCategory
            )} ${getCategoryColor(metar.flightCategory)}`}
          >
            {metar.flightCategory}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Temperature & Dewpoint */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-orange-500" />
            <div className="text-sm">
              <div className="text-xs text-muted-foreground">Temp</div>
              <div className="font-semibold">{metar.temperature ?? "N/A"}°C</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Thermometer className="h-4 w-4 text-blue-500" />
            <div className="text-sm">
              <div className="text-xs text-muted-foreground">Dew</div>
              <div className="font-semibold">{metar.dewpoint ?? "N/A"}°C</div>
            </div>
          </div>
        </div>

        {/* Wind */}
        <div className="flex items-center gap-2 border-t pt-3">
          <Wind className="h-4 w-4 text-cyan-600" />
          <div className="text-sm flex-1">
            <div className="text-xs text-muted-foreground">Wind</div>
            <div className="font-semibold">
              {metar.wind.direction ? `${metar.wind.direction.toString().padStart(3, "0")}°` : "VAR"} @{" "}
              {metar.wind.speed ?? "?"} {metar.wind.unit}
              {metar.wind.gust && ` G${metar.wind.gust}`}
            </div>
          </div>
        </div>

        {/* Visibility & Ceiling */}
        <div className="grid grid-cols-2 gap-3 border-t pt-3">
          <div className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-gray-600" />
            <div className="text-sm">
              <div className="text-xs text-muted-foreground">Vis</div>
              <div className="font-semibold">
                {metar.visibility.value ?? "?"} {metar.visibility.unit}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CloudRain className="h-4 w-4 text-slate-600" />
            <div className="text-sm">
              <div className="text-xs text-muted-foreground">Ceil</div>
              <div className="font-semibold">
                {metar.ceiling.value ? `${metar.ceiling.value} ${metar.ceiling.unit}` : "OVR"}
              </div>
            </div>
          </div>
        </div>

        {/* Raw METAR */}
        <div className="border-t pt-3 text-xs bg-muted p-2 rounded font-mono text-muted-foreground break-words">
          {metar.raw}
        </div>

        {/* Last Updated */}
        <div className="text-xs text-muted-foreground text-right">
          Updated: {new Date(metar.time).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  );
}
