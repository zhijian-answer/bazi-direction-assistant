export type ZodiacSignKey =
  | "aries"
  | "taurus"
  | "gemini"
  | "cancer"
  | "leo"
  | "virgo"
  | "libra"
  | "scorpio"
  | "sagittarius"
  | "capricorn"
  | "aquarius"
  | "pisces";

export type ZodiacBodyKey =
  | "sun"
  | "moon"
  | "mercury"
  | "venus"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune"
  | "pluto";

export type ZodiacPlacement = {
  body: ZodiacBodyKey;
  sign: ZodiacSignKey;
  degree: number;
  house?: number;
  retrograde?: boolean;
};

export type ZodiacAspect = {
  point1: string;
  point2: string;
  type: string;
  orb: number;
};

export type ZodiacHouse = {
  id: number;
  sign: ZodiacSignKey;
  cusp: number;
};

export type ZodiacEngineInput = {
  year: number;
  month: number;
  date: number;
  hour: number;
  minute: number;
  latitude: number;
  longitude: number;
  includeAngles: boolean;
};

export type ZodiacChart = {
  engine: "circular-natal-horoscope-js";
  engineVersion: "1.1.0";
  timezone: string;
  coordinates: { latitude: number; longitude: number };
  placements: Record<ZodiacBodyKey, ZodiacPlacement>;
  ascendant?: { sign: ZodiacSignKey; degree: number };
  midheaven?: { sign: ZodiacSignKey; degree: number };
  houses: ZodiacHouse[];
  aspects: ZodiacAspect[];
};

export interface ZodiacEngine {
  calculate(input: ZodiacEngineInput): ZodiacChart;
}
