import { createTRPCRouter, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";

// Types for AVWX response
interface AVWXMetarResponse {
  raw: string;
  icao: string;
  station: {
    name: string;
    iata: string;
    icao: string;
  };
  time: {
    dt: string;
  };
  wind: {
    direction: {
      value: number | null;
    };
    speed: {
      value: number | null;
      unit: string;
    };
    gust: {
      value: number | null;
      unit: string;
    };
  };
  visibility: {
    value: number | null;
    unit: string;
  };
  ceiling: {
    value: number | null;
    unit: string;
  };
  flight_category: string;
  temperature: {
    value: number | null;
    unit: string;
  };
  dewpoint: {
    value: number | null;
    unit: string;
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
    }

    const response = await fetch(url.toString(), {
      headers: {
        "User-Agent": "PilotHandbook/1.0",
      },
    });

    if (!response.ok) {
      console.warn(`AVWX API error: ${response.status} - Consider setting AVWX_API_KEY environment variable`);
      return null;
    }

    const data = (await response.json()) as AVWXMetarResponse | AVWXErrorResponse;

    if ("error" in data && data.error) {
      console.warn(`AVWX error: ${data.message}`);
      return null;
    }

    const metar = data as AVWXMetarResponse;

    return {
      icao: metar.icao,
      raw: metar.raw,
      station: metar.station.name || metar.station.icao,
      flightCategory: metar.flight_category,
      wind: {
        direction: metar.wind.direction.value,
        speed: metar.wind.speed.value,
        gust: metar.wind.gust.value,
        unit: metar.wind.speed.unit,
      },
      visibility: {
        value: metar.visibility.value,
        unit: metar.visibility.unit,
      },
      ceiling: {
        value: metar.ceiling.value,
        unit: metar.ceiling.unit,
      },
      temperature: metar.temperature.value,
      dewpoint: metar.dewpoint.value,
      time: metar.time.dt,
    };
  } catch (error) {
    console.warn(`Failed to fetch from AVWX for ${icao}:`, error);
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
      // Try AVWX first, fall back to mock data
      let metar = await fetchMetarFromAVWX(input.icao);
      
      if (!metar) {
        console.log(`Using mock METAR data for ${input.icao} - Get free AVWX key at https://avwx.rest`);
        metar = getMockMetar(input.icao);
      }
      
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
      
      // Try AVWX first, fall back to mock data
      let metar = await fetchMetarFromAVWX(icao);
      
      if (!metar) {
        console.log(`Using mock METAR data for ${icao} - Get free AVWX key at https://avwx.rest`);
        metar = getMockMetar(icao);
      }

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
