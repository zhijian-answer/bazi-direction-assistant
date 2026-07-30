import { describe, expect, it } from "vitest";
import { buildCompatibilityReport, getRelationshipBand } from "../compatibility";
import type { CompatibilityDraft } from "../compatibility";
import type { MobileProfile } from "../mobile/types";

const primary: MobileProfile = {
  id: "primary",
  name: "小玄",
  gender: "female",
  calendarType: "solar",
  birthDate: "1990-06-18",
  birthTime: "09:30",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "广东省广州市",
};
const partner: MobileProfile = {
  id: "partner",
  name: "小枢",
  gender: "male",
  calendarType: "solar",
  birthDate: "1992-11-02",
  birthTime: "18:20",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "北京市",
};

function draft(mode: CompatibilityDraft["mode"]): CompatibilityDraft {
  return { id: `draft-${mode}`, mode, primaryProfileId: "primary", partnerProfileId: "partner", relationshipType: "partner", createdAt: "2026-07-21T00:00:00.000Z" };
}

describe("compatibility report", () => {
  it.each(["astrology", "bazi"] as const)("builds a transparent %s report with five dimensions", (mode) => {
    const report = buildCompatibilityReport(draft(mode), primary, partner);

    expect(report.mode).toBe(mode);
    expect(report.dimensions).toHaveLength(5);
    expect(report.overallScore).toBeGreaterThanOrEqual(0);
    expect(report.overallScore).toBeLessThanOrEqual(100);
    expect(report.sections.length).toBeGreaterThanOrEqual(3);
    expect(report.summary).toContain("关系区间只用于分层阅读");
    expect(report.engine.ruleVersion).toBe("xuanshu-compatibility-1.0.0");
  });

  it("declares missing birth-time boundaries instead of inventing a time", () => {
    const report = buildCompatibilityReport(draft("bazi"), primary, { ...partner, birthTimeKnown: false, birthTime: "" });

    expect(report.warnings.join(" ")).toContain("时辰不确定");
  });

  it("turns internal comparison values into user-facing relationship bands", () => {
    expect(getRelationshipBand(82).label).toBe("连接较顺");
    expect(getRelationshipBand(63).label).toBe("有连接，也有差异");
    expect(getRelationshipBand(49).label).toBe("需要主动翻译彼此");
    expect(getRelationshipBand(30).label).toBe("需要更多现实确认");
  });
});
