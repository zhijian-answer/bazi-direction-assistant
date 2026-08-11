import { describe, expect, it } from "vitest";
import { baziNarrativeByElement, dailyCopyByKey, mobileCopy } from "../../content/mobile-copy";

const forbiddenPrimaryCopy = [
  "结构化观察",
  "当前阶段",
  "行动建议",
  "工作主线",
  "领域分布",
  "稳定推进",
  "专注主线",
  "人生课题",
  "命运密码",
  "深度赋能",
  "全维度",
];

function allText(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(allText);
  if (value && typeof value === "object") return Object.values(value).flatMap(allText);
  return [];
}

describe("mobile copy slots", () => {
  it("keeps primary UI copy free of project-report language", () => {
    const visibleCopy = allText({ mobileCopy, dailyCopyByKey, baziNarrativeByElement });
    for (const phrase of forbiddenPrimaryCopy) {
      expect(visibleCopy.some((line) => line.includes(phrase)), `found forbidden phrase: ${phrase}`).toBe(false);
    }
  });

  it("keeps daily copy concrete and complete", () => {
    for (const copy of Object.values(dailyCopyByKey)) {
      expect(copy.title.length).toBeGreaterThan(8);
      expect(copy.workNote.length).toBeGreaterThan(8);
      expect(copy.relationshipNote.length).toBeGreaterThan(8);
      expect(copy.oneAction.length).toBeGreaterThan(8);
      expect(copy.shareLine.length).toBeGreaterThan(8);
    }
  });

  it("keeps bazi hero copy within mobile-friendly lengths", () => {
    for (const copy of Object.values(baziNarrativeByElement)) {
      expect(copy.hook.length).toBeLessThanOrEqual(34);
      expect(copy.action.length).toBeLessThanOrEqual(48);
      expect(copy.tags).toHaveLength(3);
    }
  });
});
