import { describe, expect, it } from "vitest";
import { buildMobileBaziReport } from "../mobile/buildMobileBaziReport";
import { buildMobileFlowReport } from "../mobile/buildMobileFlowReport";
import { getDailyInsight } from "../mobile/dailyInsightCatalog";
import { buildMobileQuestions } from "../mobile/buildMobileQuestions";
import type { MobileProfile } from "../mobile/types";

const baseProfile: MobileProfile = {
  id: "fixture-bazi-1990",
  name: "生辰样本",
  gender: "female",
  calendarType: "solar",
  birthDate: "1990-06-18",
  birthTime: "09:30",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "广东省广州市",
};

describe("mobile bazi report", () => {
  it("exposes cover and action content from the calculated chart", () => {
    const report = buildMobileBaziReport(baseProfile);
    const dayStem = report.pillars.rows[0][3];
    const dayBranch = report.pillars.rows[1][3];

    expect(report.identity.dayPillar).toBe(`${dayStem}${dayBranch}`);
    expect(report.identity.title).toContain(report.identity.dayLabel);
    expect(report.identity.coverReading.title.length).toBeGreaterThan(2);
    expect(report.todayAction.title).toBe(report.shareInsights[2].title);
    expect(report.identity.supportElements).toHaveLength(2);
  });

  it("changes the cover when the birth profile changes", () => {
    const first = buildMobileBaziReport(baseProfile);
    const second = buildMobileBaziReport({
      ...baseProfile,
      birthDate: "1992-11-02",
      birthTime: "18:20",
      birthPlace: "北京市",
    });

    expect(second.identity.dayPillar).not.toBe(first.identity.dayPillar);
    expect(second.identity.title).not.toBe(first.identity.title);
  });

  it("does not invent an hour pillar or luck cycle when birth time is unknown", () => {
    const report = buildMobileBaziReport({ ...baseProfile, birthTime: "", birthTimeKnown: false });
    const visibleCount = Object.values(report.evidence.visibleElementBalance).reduce((sum, value) => sum + value, 0);

    expect(report.calculation.scope).toBe("three-pillar");
    expect(report.pillars.rows[0][4]).toBe("待补");
    expect(report.pillars.rows[1][4]).toBe("待补");
    expect(report.luckTrend).toEqual([]);
    expect(report.flowColumns[1].value).toBe("待补时辰");
    expect(report.calculation.warnings.join(" ")).toContain("不生成时柱与大运结论");
    expect(visibleCount).toBe(6);
  });
});

describe("mobile flow report", () => {
  it("builds the current stage from the profile and requested date", () => {
    const report = buildMobileFlowReport(baseProfile, new Date(2026, 6, 15, 12, 0, 0));

    expect(report.dateLabel).toContain("7月15日");
    expect(report.periodLabel).toBe("2026 年 7 月");
    expect(report.columns.map((item) => item.label)).toEqual(["本命", "大运", "流年", "流月"]);
    expect(report.columns[0].value).toBe(buildMobileBaziReport(baseProfile).identity.dayPillar);
    expect(report.question.source).toContain(report.evidence.monthly);
    expect(report.poster.tags).toContain(report.evidence.monthly);
  });

  it("updates the monthly stage instead of returning a fixed four-month sample", () => {
    const july = buildMobileFlowReport(baseProfile, new Date(2026, 6, 15, 12, 0, 0));
    const august = buildMobileFlowReport(baseProfile, new Date(2026, 7, 15, 12, 0, 0));

    expect(august.evidence.monthly).not.toBe(july.evidence.monthly);
    expect(august.months.map((item) => item.stem)).not.toEqual(july.months.map((item) => item.stem));
    expect(august.periodLabel).not.toBe(july.periodLabel);
  });

  it("updates its evidence when a different profile is selected", () => {
    const at = new Date(2026, 6, 15, 12, 0, 0);
    const first = buildMobileFlowReport(baseProfile, at);
    const second = buildMobileFlowReport({ ...baseProfile, birthDate: "1992-11-02", birthTime: "18:20" }, at);

    expect(second.evidence.dayPillar).not.toBe(first.evidence.dayPillar);
    expect(second.question.source).not.toBe(first.question.source);
  });
});

describe("daily structural observation", () => {
  it("is stable on the same day and changes its daily evidence the next day", () => {
    const first = getDailyInsight(baseProfile, new Date(2026, 6, 15, 9, 0, 0));
    const repeated = getDailyInsight(baseProfile, new Date(2026, 6, 15, 20, 0, 0));
    const nextDay = getDailyInsight(baseProfile, new Date(2026, 6, 16, 9, 0, 0));

    expect(repeated).toEqual(first);
    expect(nextDay.id).not.toBe(first.id);
    expect(nextDay.tags[0]).not.toBe(first.tags[0]);
    expect(first.workNote.length).toBeGreaterThan(8);
    expect(first.relationshipNote.length).toBeGreaterThan(8);
    expect(first.oneAction.length).toBeGreaterThan(8);
    expect(first.evidenceLabel).toContain("日");
    expect(first.shareLine.length).toBeGreaterThan(8);
  });

  it("includes the selected profile's calculated day pillar", () => {
    const first = getDailyInsight(baseProfile, new Date(2026, 6, 15, 9, 0, 0));
    const second = getDailyInsight({ ...baseProfile, birthDate: "1992-11-02", birthTime: "18:20" }, new Date(2026, 6, 15, 9, 0, 0));

    expect(second.tags[2]).not.toBe(first.tags[2]);
  });
});

describe("profile-aware question chain", () => {
  it("uses calculated bazi evidence instead of one fixed answer", () => {
    const at = new Date(2026, 6, 15, 9, 0, 0);
    const first = buildMobileQuestions("bazi", baseProfile, at);
    const secondProfile = { ...baseProfile, birthDate: "1992-11-02", birthTime: "18:20" };
    const second = buildMobileQuestions("bazi", secondProfile, at);
    const firstPillar = buildMobileBaziReport(baseProfile).identity.dayPillar;
    const secondPillar = buildMobileBaziReport(secondProfile).identity.dayPillar;

    expect(first[0].source).toContain(firstPillar);
    expect(second[0].source).toContain(secondPillar);
    expect(second[0].source).not.toBe(first[0].source);
    expect(second[1].interpretation).not.toBe(first[1].interpretation);
  });

  it("grounds the home questions in the selected profile and current day", () => {
    const at = new Date(2026, 6, 15, 9, 0, 0);
    const questions = buildMobileQuestions("home", baseProfile, at);
    const flow = buildMobileFlowReport(baseProfile, at);

    expect(questions).toHaveLength(6);
    expect(questions[0].source).toContain(flow.evidence.dayPillar);
    expect(questions[5].source).toContain(flow.daily.ganZhi);
    expect(questions.every((item) => item.action.length > 8)).toBe(true);
  });
});
