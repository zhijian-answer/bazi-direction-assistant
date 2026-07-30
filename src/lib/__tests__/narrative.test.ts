import { describe, expect, it } from "vitest";
import type { NarrativeRequest } from "../narrative/contracts";
import { buildLocalNarrative } from "../narrative/local";
import { inspectNarrativeCard, normalizeNarrativeCard } from "../narrative/quality";

function request(overrides: Partial<NarrativeRequest> = {}): NarrativeRequest {
  return {
    context: "bazi",
    slot: "hero",
    signals: ["dominant:metal", "weak:water"],
    facts: [{ label: "主要力量", value: "金" }],
    fallback: {
      hook: "先确认标准，再决定怎么推进",
      scene: "目标和反馈越清楚，你越容易稳定发挥。",
      evidenceSummary: "依据：庚金日主 · 金为主要力量",
      action: "今天先写清楚完成标准。",
      nextQuestion: "什么样的环境更适合我？",
    },
    ...overrides,
  };
}

describe("narrative catalog", () => {
  it("turns bazi evidence into a concrete life scene", () => {
    const card = buildLocalNarrative(request());
    expect(card.hook).toContain("标准");
    expect(card.scene).toContain("要求一直变");
    expect(card.evidenceSummary).toContain("庚金日主");
    expect(inspectNarrativeCard(card)).toEqual([]);
  });

  it("uses a zodiac-specific hook without changing supplied evidence", () => {
    const card = buildLocalNarrative(request({
      context: "zodiac",
      signals: ["sun:gemini", "moon:aries"],
      fallback: {
        hook: "太阳双子、月亮白羊的你",
        scene: "你需要交流和快速反馈，也需要直接表达情绪。",
        evidenceSummary: "依据：太阳双子 · 月亮白羊",
        action: "今天把一个真实想法说清楚。",
        nextQuestion: "为什么我有时会忽冷忽热？",
      },
    }));
    expect(card.hook).toContain("新东西");
    expect(card.scene).toContain("快速反馈");
    expect(card.evidenceSummary).toBe("依据：太阳双子 · 月亮白羊");
    expect(inspectNarrativeCard(card)).toEqual([]);
  });

  it("translates a ziwei star into behavior without replacing the evidence", () => {
    const card = buildLocalNarrative(request({
      context: "ziwei",
      signals: ["ming:午", "star:紫微"],
      fallback: {
        hook: "命宫见紫微的你",
        scene: "你习惯先确认局面，再决定投入方式。",
        evidenceSummary: "依据：命宫午 · 紫微",
        action: "今天先确认最重要的责任。",
        nextQuestion: "最近最值得我投入什么？",
      },
    }));
    expect(card.hook).toContain("全局");
    expect(card.scene).toContain("责任和方向");
    expect(card.evidenceSummary).toBe("依据：命宫午 · 紫微");
    expect(inspectNarrativeCard(card)).toEqual([]);
  });

  it("rejects template language and repairs question punctuation", () => {
    const card = normalizeNarrativeCard({
      hook: "当前阶段的结构化观察",
      scene: "这是一个用于测试质量检查的生活场景说明。",
      evidenceSummary: "依据：测试",
      action: "今天先做一件小事。",
      nextQuestion: "为什么会这样",
    });
    expect(card.nextQuestion.endsWith("？")).toBe(true);
    expect(inspectNarrativeCard(card)).toContain("包含模板化或不允许的表达：结构化观察");
  });
});
