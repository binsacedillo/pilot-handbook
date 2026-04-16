export interface StationInfo {
  name?: string;
  city?: string;
  state?: string;
  country?: string;
  tz?: string;
  latitude?: number;
  longitude?: number;
}

export interface AVWXMetarResponse {
  raw: string;
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
  altimeter: {
    value: number | null;
    repr: string;
  };
  units: {
    wind_speed: string;
    visibility: string;
    altitude: string;
    temperature: string;
    altimeter: string;
  };
  station: string | StationInfo;
  info?: StationInfo;
}

export interface AVWXErrorResponse {
  error: boolean;
  message: string;
}

export interface MetarData {
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
  altimeter: number | null;
  altimeterUnit: string;
  time: string;
  timezone: string;
}
