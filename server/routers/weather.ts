import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Server-side cache for weather data
// Reduces API calls by caching responses for 10 minutes
interface CachedMetar {
  data: MetarData;
  timestamp: number;
}

const weatherCache = new Map<string, CachedMetar>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes in milliseconds

function getCachedMetar(icao: string): MetarData | null {
  const cached = weatherCache.get(icao.toUpperCase());
  if (!cached) return null;
  
  const age = Date.now() - cached.timestamp;
  if (age > CACHE_DURATION) {
    weatherCache.delete(icao.toUpperCase());
    return null;
  }
  
  console.log(`Using cached METAR for ${icao} (age: ${Math.round(age / 1000)}s)`);
  return cached.data;
}

function setCachedMetar(icao: string, data: MetarData): void {
  weatherCache.set(icao.toUpperCase(), {
    data,
    timestamp: Date.now(),
  });
}

// Clean up old cache entries periodically (every 30 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of weatherCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      weatherCache.delete(key);
    }
  }
}, 30 * 60 * 1000);

// Types for AVWX response
interface AVWXMetarResponse {
  raw: string;
  station: string;
  time: {
    dt: string;
    repr: string;
  };
  wind_direction: {
    value: number | null;
    repr: string;
  } | null;
  wind_speed: {
    value: number | null;
    repr: string;
  };
  wind_gust: {
    value: number | null;
    repr: string;
  } | null;
  visibility: {
    value: number | null;
    repr: string;
  };
  clouds: Array<{
    type: string;
    altitude: number | null;
    repr: string;
  }>;
  flight_rules: string;
  temperature: {
    value: number | null;
    repr: string;
  };
  dewpoint: {
    value: number | null;
    repr: string;
  };
  units: {
    wind_speed: string;
    visibility: string;
    altitude: string;
    temperature: string;
  };
}

interface AVWXErrorResponse {
  error: boolean;
  message: string;
}

interface MetarData {
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
}

// AVWX API - Free tier requires registration at https://avwx.rest
// Sign up for free API key at https://avwx.rest/ or use environment variable
const AVWX_BASE_URL = "https://avwx.rest/api";
const AVWX_KEY = process.env.AVWX_API_KEY || ""; // Get free key from https://avwx.rest

// Fallback: Use NOAA Aviation Weather (no auth required, but slower)
const NOAA_BASE_URL = "https://www.aviationweather.gov/adds/dataserver_current/httpparam";

async function fetchMetarFromAVWX(icao: string): Promise<MetarData | null> {
  try {
    const url = new URL(`${AVWX_BASE_URL}/metar/${icao.toUpperCase()}`);
    if (AVWX_KEY) {
      url.searchParams.append("token", AVWX_KEY);
    } else {
      console.warn("AVWX_API_KEY not found in environment variables");
      return null;
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "PilotHandbook/1.0",
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AVWX API error for ${icao}: ${response.status} ${response.statusText}`, errorText);
      return null;
    }

    const data = (await response.json()) as AVWXMetarResponse | AVWXErrorResponse;

    if ("error" in data && data.error) {
      console.error(`AVWX error for ${icao}:`, data.message);
      return null;
    }

    // Log the actual response structure for debugging
    console.log(`AVWX API response structure for ${icao}:`, JSON.stringify(data, null, 2));

    const metar = data as AVWXMetarResponse;

    // Calculate ceiling from clouds (lowest BKN or OVC layer)
    let ceiling: number | null = null;
    for (const cloud of metar.clouds || []) {
      if ((cloud.type === 'BKN' || cloud.type === 'OVC') && cloud.altitude !== null) {
        if (ceiling === null || cloud.altitude < ceiling) {
          ceiling = cloud.altitude * 100; // Convert to feet (altitude is in hundreds of feet)
        }
      }
    }

    // Convert visibility from meters to statute miles if needed
    let visibilityValue = metar.visibility?.value ?? null;
    let visibilityUnit = metar.units?.visibility || 'm';
    if (visibilityUnit === 'm' && visibilityValue !== null) {
      visibilityValue = Math.round((visibilityValue / 1609.34) * 10) / 10; // Convert to SM
      visibilityUnit = 'SM';
    }

    // Safely parse the response with null checks
    return {
      icao: metar.station || icao,
      raw: metar.raw,
      station: metar.station || icao,
      flightCategory: metar.flight_rules || "UNKNOWN",
      wind: {
        direction: metar.wind_direction?.value ?? null,
        speed: metar.wind_speed?.value ?? null,
        gust: metar.wind_gust?.value ?? null,
        unit: metar.units?.wind_speed || "KT",
      },
      visibility: {
        value: visibilityValue,
        unit: visibilityUnit,
      },
      ceiling: {
        value: ceiling,
        unit: "FT",
      },
      temperature: metar.temperature?.value ?? null,
      dewpoint: metar.dewpoint?.value ?? null,
      time: metar.time?.dt || new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Failed to fetch from AVWX for ${icao}:`, error);
    return null;
  }
}

// Simple fallback mock data for testing (replace with real API when key is available)
function getMockMetar(icao: string): MetarData {
  const now = new Date().toISOString();
  return {
    icao: icao.toUpperCase(),
    raw: `${icao.toUpperCase()} 031851Z 31008KT 10SM FEW250 M04/M17 A3034 RMK AO2 SLP279 T10441172`,
    station: `${icao.toUpperCase()} (Mock Data)`,
    flightCategory: "VFR",
    wind: {
      direction: 310,
      speed: 8,
      gust: null,
      unit: "KT",
    },
    visibility: {
      value: 10,
      unit: "SM",
    },
    ceiling: {
      value: null,
      unit: "FT",
    },
    temperature: -4,
    dewpoint: -17,
    time: now,
  };
}

export const weatherRouter = createTRPCRouter({
  /**
   * Get METAR for any airport (public, cached)
   */
  getMetar: publicProcedure
    .input(z.object({ icao: z.string().min(4).max(4).toUpperCase() }))
    .query(async ({ input }) => {
      console.log(`Fetching METAR for ${input.icao}, API key present: ${!!AVWX_KEY}`);
      
      // Check cache first
      const cached = getCachedMetar(input.icao);
      if (cached) {
        return cached;
      }
      
      // Try AVWX first, fall back to mock data
      let metar = await fetchMetarFromAVWX(input.icao);
      
      if (!metar) {
        console.log(`Using mock METAR data for ${input.icao}`);
        metar = getMockMetar(input.icao);
      } else {
        console.log(`Successfully fetched real METAR for ${input.icao}`);
      }
      
      // Cache the result
      setCachedMetar(input.icao, metar);
      
      return metar;
    }),

  /**
   * Get favorite airport METAR (user's preferred airport)
   */
  getFavoriteAirportMetar: protectedProcedure.query(async ({ ctx }) => {
    try {
      const prefs = await ctx.db.userPreferences.findUnique({
        where: { userId: ctx.user.id },
      });

      const icao = prefs?.favoriteAirport || "KJFK";
      console.log(`Fetching favorite airport METAR for ${icao}, API key present: ${!!AVWX_KEY}`);
      
      // Check cache first
      const cached = getCachedMetar(icao);
      if (cached) {
        return cached;
      }
      
      // Try AVWX first, fall back to mock data
      let metar = await fetchMetarFromAVWX(icao);
      
      if (!metar) {
        console.log(`Using mock METAR data for ${icao}`);
        metar = getMockMetar(icao);
      } else {
        console.log(`Successfully fetched real METAR for ${icao}`);
      }

      // Cache the result
      setCachedMetar(icao, metar);

      return metar;
    } catch (error) {
      if (error instanceof TRPCError) throw error;
      console.error("Weather fetch error:", error);
      // Return mock data on error instead of failing
      const icao = "KJFK";
      return getMockMetar(icao);
    }
  }),

  /**
   * Set user's favorite airport
   */
  setFavoriteAirport: protectedProcedure
    .input(z.object({ icao: z.string().min(4).max(4).toUpperCase() }))
    .mutation(async ({ ctx, input }) => {
      // Try to verify airport with AVWX, but allow setting anyway
      const metar = await fetchMetarFromAVWX(input.icao);
      if (!metar) {
        console.warn(`Could not verify airport ${input.icao} with AVWX, but allowing set anyway`);
      }

      const updated = await ctx.db.userPreferences.upsert({
        where: { userId: ctx.user.id },
        update: { favoriteAirport: input.icao },
        create: {
          userId: ctx.user.id,
          favoriteAirport: input.icao,
        },
      });

      return updated;
    }),
});
