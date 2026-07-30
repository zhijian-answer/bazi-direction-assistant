import { Lunar } from "lunar-javascript";
import type { MobileProfile } from "../mobile/types";
import { chinaTimezoneAnchor, circularZodiacEngine, resolveBirthPlace } from "../zodiac";
import type { BirthPlaceCoordinates } from "../zodiac/birthPlaceCatalog";
import type { ZodiacChart } from "../zodiac/types";

export type ProfileChartResult = {
  chart: ZodiacChart;
  hasExactTime: boolean;
  hasLocation: boolean;
  isPartial: boolean;
  locationLabel: string;
  warnings: string[];
  source: {
    engine: ZodiacChart["engine"];
    engineVersion: ZodiacChart["engineVersion"];
    houseSystem: "whole-sign";
    zodiac: "tropical";
  };
};

function splitDate(value: string) {
  const [year, month, date] = value.split("-").map(Number);
  if (!year || !month || !date) throw new Error("出生日期不完整");
  return { year, month, date };
}

function splitTime(value: string) {
  const [hour, minute] = value.split(":").map(Number);
  return {
    hour: Number.isFinite(hour) ? hour : 12,
    minute: Number.isFinite(minute) ? minute : 0,
  };
}

export function getProfileSolarParts(profile: MobileProfile) {
  const { year, month, date } = splitDate(profile.birthDate);
  const { hour, minute } = splitTime(profile.birthTimeKnown ? profile.birthTime : "12:00");
  if (profile.calendarType === "solar") return { year, month, date, hour, minute };
  const solar = Lunar.fromYmdHms(year, profile.isLeapMonth ? -month : month, date, hour, minute, 0).getSolar();
  return {
    year: Number(solar.getYear()),
    month: Number(solar.getMonth()),
    date: Number(solar.getDay()),
    hour,
    minute,
  };
}

export function resolveProfileBirthLocation(profile: MobileProfile): BirthPlaceCoordinates | null {
  const catalog = resolveBirthPlace(profile.birthPlace);
  if (catalog) return catalog;
  if (!Number.isFinite(profile.latitude) || !Number.isFinite(profile.longitude)) return null;
  return {
    id: "profile-coordinates",
    label: profile.birthPlace || "已保存坐标",
    latitude: Number(profile.latitude),
    longitude: Number(profile.longitude),
    timezone: profile.timezone || "",
    aliases: [],
  };
}

export function buildProfileZodiacChart(profile: MobileProfile): ProfileChartResult {
  const parts = getProfileSolarParts(profile);
  const location = resolveProfileBirthLocation(profile);
  const coordinates = location ?? chinaTimezoneAnchor;
  const hasExactTime = profile.birthTimeKnown && Boolean(profile.birthTime);
  const includeAngles = hasExactTime && Boolean(location);
  const chart = circularZodiacEngine.calculate({
    ...parts,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    includeAngles,
  });
  const warnings: string[] = [];
  if (!hasExactTime) {
    warnings.push("出生时辰不确定：星体按当天中午建立近似位置，十二宫、上升与天顶不生成。月亮和快速星体可能存在偏差。");
  }
  if (!location) {
    warnings.push("出生城市尚未匹配到坐标：行星位置按中国标准时区参考点计算，十二宫、上升与天顶不生成。");
  }
  return {
    chart,
    hasExactTime,
    hasLocation: Boolean(location),
    isPartial: !includeAngles,
    locationLabel: location?.label || profile.birthPlace || "地点待补充",
    warnings,
    source: {
      engine: chart.engine,
      engineVersion: chart.engineVersion,
      houseSystem: "whole-sign",
      zodiac: "tropical",
    },
  };
}

export function buildCurrentTransitChart(profile: MobileProfile, at = new Date()): ZodiacChart {
  const location = resolveProfileBirthLocation(profile) ?? chinaTimezoneAnchor;
  return circularZodiacEngine.calculate({
    year: at.getFullYear(),
    month: at.getMonth() + 1,
    date: at.getDate(),
    hour: at.getHours(),
    minute: at.getMinutes(),
    latitude: location.latitude,
    longitude: location.longitude,
    includeAngles: false,
  });
}
