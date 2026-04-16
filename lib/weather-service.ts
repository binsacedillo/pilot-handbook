import type { 
  AVWXMetarResponse, 
  AVWXErrorResponse, 
  MetarData, 
  StationInfo 
} from "@/types/weather";

// --- Cache Configuration ---

interface CachedMetar {
  data: MetarData;
  timestamp: number;
}

const weatherCache = new Map<string, CachedMetar>();
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// --- API Configuration ---

const AVWX_BASE_URL = "https://avwx.rest/api";
const AVWX_KEY = process.env.AVWX_API_KEY || "";

// --- Internal Helpers ---

/**
 * Smart Timezone Resolver
 * Priority 1: Use provided 'tz' label from database.
 * Priority 2: Use high-accuracy country overrides (Power Users).
 * Priority 3: Use Longitude-based UTC offset calculation (Universal Fallback).
 */
function getSmartTimezone(info: StationInfo | undefined): string {
  if (!info) return "UTC";
  
  // 1. Primary Database Match
  if (info.tz) return info.tz;
  
  	// 2. Regional High-Accuracy Overrides
	// These ensure DST is handled correctly for major aviation hubs
	if (info.country === 'PH') return 'Asia/Manila';
	if (info.country === 'US') {
		// New York/East Coast Logic
		if (info.longitude !== undefined && info.longitude > -80 && info.longitude < -66) return 'America/New_York';
		// West Coast Logic
		if (info.longitude !== undefined && info.longitude < -114) return 'America/Los_Angeles';
		// Default US Fallback
		return 'America/Chicago'; 
	}
	
	// 3. Universal Longitude Fallback (15° = 1 hour)
  if (info.longitude !== undefined) {
    const offset = Math.round(info.longitude / 15);
    // Note: Etc/GMT signs are POSIX inverted (UTC+8 is Etc/GMT-8)
    const sign = offset >= 0 ? '-' : '+';
    const absOffset = Math.abs(offset);
    return `Etc/GMT${sign}${absOffset}`;
  }
  
  return "UTC";
}

/**
 * Return mock METAR data for testing if API fails
 */
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
    altimeter: 30.34,
    altimeterUnit: "inHg",
    time: now,
    timezone: "UTC",
  };
}

/**
 * Fetch and Parse METAR from AVWX
 */
async function fetchMetarFromAVWX(icao: string): Promise<MetarData | null> {
  try {
    const url = new URL(`${AVWX_BASE_URL}/metar/${icao.toUpperCase()}`);
    url.searchParams.append("options", "info");
    if (AVWX_KEY) {
      url.searchParams.append("token", AVWX_KEY);
    } else {
      if (process.env.NODE_ENV !== 'test') {
        console.warn("AVWX_API_KEY not found in environment variables");
      }
      return null;
    }

    const response = await fetch(url.toString(), {
      headers: { "User-Agent": "PilotHandbook/1.0" },
    });

    if (!response.ok) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(`AVWX API error for ${icao}: ${response.status} ${response.statusText}`);
      }
      return null;
    }

    const data = (await response.json()) as AVWXMetarResponse | AVWXErrorResponse;

    if ("error" in data && data.error) {
      if (process.env.NODE_ENV !== 'test') {
        console.error(`AVWX error for ${icao}:`, data.message);
      }
      return null;
    }

    const metar = data as AVWXMetarResponse;
    const stationInfo = typeof metar.station === 'object' ? metar.station : metar.info;
    const tz = getSmartTimezone(stationInfo);
    const stationDisplayName = (typeof metar.station === 'object' ? (metar.station as StationInfo).name : (metar.station as string)) || icao;

    // Ceiling Calculation
    let ceiling: number | null = null;
    for (const cloud of metar.clouds || []) {
      if ((cloud.type === "BKN" || cloud.type === "OVC") && cloud.altitude !== null) {
        if (ceiling === null || cloud.altitude < ceiling) {
          ceiling = cloud.altitude * 100;
        }
      }
    }

    // Visibility Conversion
    let visibilityValue = metar.visibility?.value ?? null;
    let visibilityUnit = metar.units?.visibility || "m";
    if (visibilityUnit === "m" && visibilityValue !== null) {
      visibilityValue = Math.round((visibilityValue / 1609.34) * 10) / 10;
      visibilityUnit = "SM";
    }

    return {
      icao: icao.toUpperCase(),
      raw: metar.raw,
      station: stationDisplayName,
      flightCategory: metar.flight_rules || "UNKNOWN",
      wind: {
        direction: metar.wind_direction?.value ?? null,
        speed: metar.wind_speed?.value ?? null,
        gust: metar.wind_gust?.value ?? null,
        unit: metar.units?.wind_speed || "KT",
      },
      visibility: { value: visibilityValue, unit: visibilityUnit },
      ceiling: { value: ceiling, unit: "FT" },
      temperature: metar.temperature?.value ?? null,
      dewpoint: metar.dewpoint?.value ?? null,
      altimeter: metar.altimeter?.value ?? null,
      altimeterUnit: metar.units?.altimeter || "inHg",
      time: metar.time?.dt || new Date().toISOString(),
      timezone: tz,
    };
  } catch (error) {
    if (process.env.NODE_ENV !== 'test') {
      console.error(`Failed to fetch from AVWX for ${icao}:`, error);
    }
    return null;
  }
}

// --- Public Service Interface ---

export const weatherService = {
  /**
   * Get METAR for any airport (with 10m cache)
   */
  async getMetar(icao: string): Promise<MetarData> {
    const cleanIcao = icao.toUpperCase();

    // 1. Check Cache
    const cached = weatherCache.get(cleanIcao);
    if (cached) {
      const age = Date.now() - cached.timestamp;
      if (age < CACHE_DURATION) {
        if (process.env.NODE_ENV !== 'test') {
          console.log(`Using cached METAR for ${cleanIcao} (age: ${Math.round(age / 1000)}s)`);
        }
        return cached.data;
      }
      weatherCache.delete(cleanIcao);
    }

    if (process.env.NODE_ENV !== 'test') {
      console.log(`Fetching METAR for ${cleanIcao}, API key present: ${!!AVWX_KEY}`);
    }

    // 2. Fetch from API
    let metar = await fetchMetarFromAVWX(cleanIcao);

    // 3. Fallback to Mock
    if (!metar) {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Using mock METAR data for ${cleanIcao}`);
      }
      metar = getMockMetar(cleanIcao);
    } else {
      if (process.env.NODE_ENV !== 'test') {
        console.log(`Successfully fetched real METAR for ${cleanIcao}`);
      }
    }

    // 4. Update Cache
    weatherCache.set(cleanIcao, {
      data: metar,
      timestamp: Date.now(),
    });

    return metar;
  },

  /**
   * Manual cache clear
   */
  clearCache(icao?: string) {
    if (icao) {
      weatherCache.delete(icao.toUpperCase());
    } else {
      weatherCache.clear();
    }
  }
};

// --- Periodic Cache Cleanup ---
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of weatherCache.entries()) {
      if (now - value.timestamp > CACHE_DURATION) {
        weatherCache.delete(key);
      }
    }
  }, 30 * 60 * 1000); // Check every 30m
}
