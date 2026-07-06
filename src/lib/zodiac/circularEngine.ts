import { Horoscope, Origin } from "circular-natal-horoscope-js";
import type { ZodiacAspect, ZodiacBodyKey, ZodiacChart, ZodiacEngine, ZodiacEngineInput, ZodiacSignKey } from "./types";

const bodyKeys: ZodiacBodyKey[] = ["sun", "moon", "mercury", "venus", "mars"];
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
      aspectPoints: ["sun", "moon", "mercury", "venus", "mars", "ascendant"],
      aspectWithPoints: ["sun", "moon", "mercury", "venus", "mars", "ascendant"],
      aspectTypes: ["major"],
      language: "en",
    });

    const placements = Object.fromEntries(bodyKeys.map((body) => {
      const raw = horoscope.CelestialBodies[body];
      return [body, {
        body,
        sign: normalizeSign(raw.Sign.key),
        degree: Number(raw.ChartPosition.Ecliptic.DecimalDegrees),
        house: Number(raw.House?.id) || undefined,
        retrograde: Boolean(raw.isRetrograde),
      }];
    })) as ZodiacChart["placements"];

    const aspects: ZodiacAspect[] = horoscope.Aspects.all
      .filter((aspect: { point1Key?: string; point2Key?: string }) => bodyKeys.includes(aspect.point1Key as ZodiacBodyKey) || bodyKeys.includes(aspect.point2Key as ZodiacBodyKey))
      .slice(0, 12)
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
      aspects,
    };
  },
};
