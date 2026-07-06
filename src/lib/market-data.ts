import { createHash } from "node:crypto";
import type { BirthProfile, ContentRule, ReportType, StoredShareImage } from "./types";

export const reportTypes = new Set<ReportType>(["bazi", "zodiac", "ziwei", "liupan"]);
export const shareImageTypes = new Set<StoredShareImage["type"]>(["personality", "daily", "zodiac", "ziwei", "question"]);
export const contentRuleTypes = new Set<ContentRule["type"]>(["daily", "question", "bazi", "zodiac", "ziwei", "liupan", "disclaimer", "onboarding"]);

export function stableHash(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

export function serializedSize(value: unknown) {
  return Buffer.byteLength(JSON.stringify(value), "utf8");
}

export function profileSignature(profile: Pick<BirthProfile, "name" | "gender" | "calendarType" | "isLeapMonth" | "birthDate" | "birthTime" | "birthPlace" | "latitude" | "longitude" | "timeUnknown">) {
  return stableHash({
    name: profile.name.trim(),
    gender: profile.gender,
    calendarType: profile.calendarType,
    isLeapMonth: Boolean(profile.isLeapMonth),
    birthDate: profile.birthDate,
    birthTime: profile.timeUnknown ? "unknown" : profile.birthTime,
    birthPlace: profile.birthPlace.trim(),
    latitude: profile.latitude,
    longitude: profile.longitude,
    timeUnknown: profile.timeUnknown,
  });
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
