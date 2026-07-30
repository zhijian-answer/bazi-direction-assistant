import { describe, expect, it } from "vitest";
import { buildMobileChatAnswer } from "../mobile/chatEngine";
import type { MobileProfile } from "../mobile/types";

const profile: MobileProfile = {
  id: "chat-fixture",
  name: "聊天样本",
  gender: "female",
  calendarType: "solar",
  birthDate: "1990-06-18",
  birthTime: "09:30",
  birthTimeKnown: true,
  isLeapMonth: false,
  birthPlace: "广东省广州市",
  latitude: 23.1291,
  longitude: 113.2644,
  timezone: "Asia/Shanghai",
  birthPlaceResolution: "catalog",
};

describe("mobile chat engine", () => {
  it("routes a relationship question and returns traceable multi-system evidence", async () => {
    const answer = await buildMobileChatAnswer(profile, "我在关系里最容易卡在哪里？", new Date("2026-07-15T04:00:00.000Z"));

    expect(answer.category).toBe("relationship");
    expect(answer.title.length).toBeGreaterThan(6);
    expect(answer.action.length).toBeGreaterThan(10);
    expect(answer.evidence.map((item) => item.system)).toEqual(expect.arrayContaining(["生辰", "流盘", "星座", "紫微"]));
    expect(answer.evidence.every((item) => item.engine.length > 3)).toBe(true);
    expect(answer.evidenceTrace.claims.some((item) => item.system === "bazi")).toBe(true);
    expect(answer.evidenceTrace.claims.some((item) => item.system === "ziwei")).toBe(true);
    expect(answer.evidenceTrace.excluded.some((item) => item.system === "星座")).toBe(true);
    expect(answer.poster.title).toBe(answer.title);
  });

  it("excludes time-dependent systems when the birth time is unknown", async () => {
    const answer = await buildMobileChatAnswer(
      { ...profile, birthTime: "", birthTimeKnown: false },
      "我最近应该先稳住还是主动推进？",
      new Date("2026-07-15T04:00:00.000Z"),
    );

    expect(answer.category).toBe("timing");
    expect(answer.evidence.some((item) => item.system === "紫微")).toBe(false);
    expect(answer.evidence.find((item) => item.system === "生辰")?.label).toContain("三柱");
    expect(answer.evidenceTrace.claims.some((item) => item.system === "ziwei")).toBe(false);
    expect(answer.evidenceTrace.claims.find((item) => item.system === "bazi")?.dataCompleteness).toBeLessThan(0.7);
    expect(answer.limitations.join(" ")).toContain("不会使用时柱");
  });

  it("keeps financial questions inside an observation and risk boundary", async () => {
    const answer = await buildMobileChatAnswer(profile, "我最近适合增加投资吗？", new Date("2026-07-15T04:00:00.000Z"));

    expect(answer.category).toBe("wealth");
    expect(answer.action).toContain("真实数据和专业意见");
    expect(answer.poster.category).toBe("question");
  });
});
