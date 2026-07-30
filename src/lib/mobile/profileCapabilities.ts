import type { MobileProfile } from "./types";

export type MobileProfileKind = "empty" | "demo" | "draft" | "local";
export type ReportCapabilityType = "bazi" | "zodiac" | "chart" | "ziwei" | "flow" | "compatibility";
export type ReportAvailability = "unavailable" | "partial" | "full";

export type ReportCapability = {
  availability: ReportAvailability;
  label: "可使用" | "部分可用" | "需补资料" | "示例";
  missing: Array<"birthDate" | "birthTime" | "birthPlace" | "gender">;
  reason: string;
};

export function isValidProfileBirthDate(profile: Pick<MobileProfile, "birthDate" | "calendarType">) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(profile.birthDate);
  if (!match) return false;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (year < 1900 || year > 2100 || month < 1 || month > 12 || day < 1) return false;

  if (profile.calendarType === "lunar") return day <= 30;

  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function getMobileProfileKind(profile: MobileProfile, hasProfile: boolean): MobileProfileKind {
  if (!hasProfile) return "empty";
  if (profile.isDemo) return "demo";
  return isValidProfileBirthDate(profile) ? "local" : "draft";
}

export function getReportCapability(profile: MobileProfile, type: ReportCapabilityType): ReportCapability {
  if (!isValidProfileBirthDate(profile)) {
    return {
      availability: "unavailable",
      label: "需补资料",
      missing: ["birthDate"],
      reason: "补充有效出生日期后才能建立个人结构。",
    };
  }

  const missing: ReportCapability["missing"] = [];
  const hasExactTime = profile.birthTimeKnown && Boolean(profile.birthTime);
  const hasLocation = Boolean(profile.birthPlace.trim()) && Number.isFinite(profile.latitude) && Number.isFinite(profile.longitude);
  const hasGender = profile.gender !== "other";

  if ((type === "zodiac" || type === "chart" || type === "ziwei" || type === "flow") && !hasExactTime) missing.push("birthTime");
  if ((type === "zodiac" || type === "chart") && !hasLocation) missing.push("birthPlace");
  if ((type === "ziwei" || type === "flow") && !hasGender) missing.push("gender");
  if (type === "bazi" && !hasExactTime) missing.push("birthTime");

  const strictUnavailable = type === "ziwei" && missing.length > 0;
  const availability: ReportAvailability = strictUnavailable ? "unavailable" : missing.length ? "partial" : "full";

  return {
    availability,
    label: profile.isDemo ? "示例" : availability === "full" ? "可使用" : availability === "partial" ? "部分可用" : "需补资料",
    missing,
    reason: strictUnavailable
      ? "紫微十二宫需要明确出生时辰和排盘所需性别。"
      : missing.length
        ? "当前只展示现有资料可以支持的部分，不会补入默认时辰或地点。"
        : "当前资料可以支持这份报告。",
  };
}

