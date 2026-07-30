import { describe, expect, it } from "vitest";
import { buildMobileZodiacReport } from "../mobile/buildMobileZodiacReport";
import type { MobileProfile } from "../mobile/types";
import { resolveBirthPlace } from "../zodiac/birthPlaceCatalog";
import { buildCurrentTransitChart, buildProfileZodiacChart } from "../astrology/profileChart";

const guangzhouProfile: MobileProfile = {
  id: "fixture-guangzhou-1990",
  name: "星盘样本",
  gender: "female",
  calendarType: "solar",
  birthDate: "1990-06-18",
  birthTime: "09:30",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "广东省广州市",
};

describe("zodiac report adapter", () => {
  it("calculates the known Guangzhou fixture instead of returning fixed demo signs", () => {
    const report = buildMobileZodiacReport(guangzhouProfile);

    expect(report.signs).toMatchObject({
      sun: "gemini",
      moon: "aries",
      rising: "leo",
      mercury: "gemini",
      venus: "taurus",
      mars: "aries",
    });
    expect(report.completeness.isPartial).toBe(false);
    expect(report.completeness.locationLabel).toBe("广东省广州市");
    expect(report.identity.title).toContain("上升狮子");
  });

  it("changes the report when the birth profile changes", () => {
    const first = buildMobileZodiacReport(guangzhouProfile);
    const second = buildMobileZodiacReport({
      ...guangzhouProfile,
      id: "fixture-beijing-1992",
      birthDate: "1992-11-02",
      birthTime: "18:20",
      birthPlace: "北京市",
    });

    expect(second.signs).not.toEqual(first.signs);
    expect(second.identity.title).not.toBe(first.identity.title);
  });

  it("does not invent an ascendant when the birth time is unknown", () => {
    const report = buildMobileZodiacReport({
      ...guangzhouProfile,
      birthTimeKnown: false,
      birthTime: "",
    });

    expect(report.signs.rising).toBeUndefined();
    expect(report.completeness.isPartial).toBe(true);
    expect(report.completeness.warning).toContain("出生时辰不确定");
    expect(report.identity.tags).toContain("上升待补充");
    expect(report.identity.title).not.toContain("需要需要");
  });

  it("does not invent an ascendant when the city cannot be resolved", () => {
    const report = buildMobileZodiacReport({
      ...guangzhouProfile,
      birthPlace: "未收录的小镇",
    });

    expect(report.signs.rising).toBeUndefined();
    expect(report.completeness.isPartial).toBe(true);
    expect(report.completeness.warning).toContain("出生城市尚未匹配到坐标");
  });

  it("uses saved coordinates for an unlisted birth place", () => {
    const report = buildMobileZodiacReport({
      ...guangzhouProfile,
      birthPlace: "广东省佛山市",
      latitude: 23.0215,
      longitude: 113.1214,
      timezone: "Asia/Shanghai",
    });

    expect(report.signs.rising).toBeDefined();
    expect(report.completeness.hasLocation).toBe(true);
    expect(report.completeness.locationLabel).toBe("广东省佛山市");
  });
});

describe("birth place catalog", () => {
  it("resolves common city aliases to deterministic coordinates", () => {
    expect(resolveBirthPlace("广州")?.id).toBe("guangzhou");
    expect(resolveBirthPlace("我出生在广东省广州市")?.id).toBe("guangzhou");
    expect(resolveBirthPlace("未收录的小镇")).toBeNull();
  });
});

describe("complete astrology chart", () => {
  it("keeps ten major bodies, twelve houses and filtered major aspects", () => {
    const result = buildProfileZodiacChart(guangzhouProfile);

    expect(Object.keys(result.chart.placements)).toHaveLength(10);
    expect(result.chart.houses).toHaveLength(12);
    expect(result.chart.ascendant).toBeDefined();
    expect(result.chart.midheaven).toBeDefined();
    expect(result.chart.aspects.length).toBeGreaterThan(0);
    expect(result.chart.aspects.some((item) => item.point1 === "sirius" || item.point2 === "sirius")).toBe(false);
  });

  it("does not create houses or angles when birth time is unknown", () => {
    const result = buildProfileZodiacChart({ ...guangzhouProfile, birthTimeKnown: false, birthTime: "" });

    expect(result.isPartial).toBe(true);
    expect(result.chart.houses).toEqual([]);
    expect(result.chart.ascendant).toBeUndefined();
    expect(Object.values(result.chart.placements).every((placement) => placement.house === undefined)).toBe(true);
    expect(result.chart.aspects.some((aspect) => [aspect.point1, aspect.point2].includes("ascendant") || [aspect.point1, aspect.point2].includes("midheaven"))).toBe(false);
    expect(result.warnings.join(" ")).toContain("出生时辰不确定");
  });

  it("keeps current sky data free of personal houses and angles", () => {
    const chart = buildCurrentTransitChart(guangzhouProfile, new Date("2026-07-21T12:00:00+08:00"));

    expect(chart.houses).toEqual([]);
    expect(chart.ascendant).toBeUndefined();
    expect(chart.midheaven).toBeUndefined();
    expect(Object.values(chart.placements).every((placement) => placement.house === undefined)).toBe(true);
    expect(chart.aspects.some((aspect) => [aspect.point1, aspect.point2].includes("ascendant") || [aspect.point1, aspect.point2].includes("midheaven"))).toBe(false);
  });
});
