import { Horoscope, Origin } from "circular-natal-horoscope-js";
import type { ZodiacAspect, ZodiacBodyKey, ZodiacChart, ZodiacEngine, ZodiacEngineInput, ZodiacSignKey } from "./types";

export const zodiacBodyKeys: ZodiacBodyKey[] = [
  "sun",
  "moon",
  "mercury",
  "venus",
  "mars",
  "jupiter",
  "saturn",
  "uranus",
  "neptune",
  "pluto",
];
const bodyAspectPoints = new Set<string>(zodiacBodyKeys);
const angleAspectPoints = new Set<string>([...zodiacBodyKeys, "ascendant", "midheaven"]);
const signKeys = new Set<ZodiacSignKey>([
  "aries", "taurus", "gemini", "cancer", "leo", "virgo",
  "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces",
]);

function normalizeSign(value: unknown): ZodiacSignKey {
  const sign = String(value || "").toLowerCase() as ZodiacSignKey;
  if (!signKeys.has(sign)) throw new Error(`不支持的星座结果：${String(value || "未知")}`);
  return sign;
}

export const circularZodiacEngine: ZodiacEngine = {
  calculate(input: ZodiacEngineInput): ZodiacChart {
    const origin = new Origin({
      year: input.year,
      month: input.month - 1,
      date: input.date,
      hour: input.hour,
      minute: input.minute,
      latitude: input.latitude,
      longitude: input.longitude,
    });
    const horoscope = new Horoscope({
      origin,
      houseSystem: "whole-sign",
      zodiac: "tropical",
      aspectPoints: ["bodies", "angles"],
      aspectWithPoints: ["bodies", "angles"],
      aspectTypes: ["major"],
      language: "en",
    });

    const placements = Object.fromEntries(zodiacBodyKeys.map((body) => {
      const raw = horoscope.CelestialBodies[body];
      return [body, {
        body,
        sign: normalizeSign(raw.Sign.key),
        degree: Number(raw.ChartPosition.Ecliptic.DecimalDegrees),
        house: input.includeAngles ? Number(raw.House?.id) || undefined : undefined,
        retrograde: Boolean(raw.isRetrograde),
      }];
    })) as ZodiacChart["placements"];

    const allowedAspectPoints = input.includeAngles ? angleAspectPoints : bodyAspectPoints;
    const aspects: ZodiacAspect[] = horoscope.Aspects.all
      .filter((aspect: { point1Key?: string; point2Key?: string }) => allowedAspectPoints.has(String(aspect.point1Key)) && allowedAspectPoints.has(String(aspect.point2Key)))
      .sort((left: { orb: number }, right: { orb: number }) => Number(left.orb) - Number(right.orb))
      .slice(0, 48)
      .map((aspect: { point1Key: string; point2Key: string; aspectKey: string; orb: number }) => ({
        point1: aspect.point1Key,
        point2: aspect.point2Key,
        type: aspect.aspectKey,
        orb: Number(aspect.orb),
      }));

    return {
      engine: "circular-natal-horoscope-js",
      engineVersion: "1.1.0",
      timezone: String(origin.timezone?.name || ""),
      coordinates: { latitude: input.latitude, longitude: input.longitude },
      placements,
      ascendant: input.includeAngles ? {
        sign: normalizeSign(horoscope.Ascendant.Sign.key),
        degree: Number(horoscope.Ascendant.ChartPosition.Ecliptic.DecimalDegrees),
      } : undefined,
      midheaven: input.includeAngles ? {
        sign: normalizeSign(horoscope.Midheaven.Sign.key),
        degree: Number(horoscope.Midheaven.ChartPosition.Ecliptic.DecimalDegrees),
      } : undefined,
      houses: input.includeAngles
        ? horoscope.Houses.map((house: {
          id: number;
          Sign: { key: string };
          ChartPosition: { StartPosition: { Ecliptic: { DecimalDegrees: number } } };
        }) => ({
          id: Number(house.id),
          sign: normalizeSign(house.Sign.key),
          cusp: Number(house.ChartPosition.StartPosition.Ecliptic.DecimalDegrees),
        }))
        : [],
      aspects,
    };
  },
};
