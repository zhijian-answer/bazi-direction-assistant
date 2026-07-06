import { describe, expect, it } from "vitest";
import { IztroEngine } from "../engines/iztroEngine";
import { ziweiFixtures } from "../fixtures";
import { normalizeZiwei } from "../normalizeZiwei";

describe("normalizeZiwei", () => {
  it("turns engine fields into user-facing observations with evidence", async () => {
    const engine = new IztroEngine();
    const chart = await engine.calculate(ziweiFixtures[0].input);
    const insight = normalizeZiwei(chart, engine.getEngineInfo());

    expect(insight.identity.title).toBe("你习惯先看全局，再决定怎么推进");
    expect(insight.identity.summary).toContain("不是固定命运");
    expect(insight.today.keyword).toBe("环境变化");
    expect(insight.stage.rangeLabel).toMatch(/^\d+–\d+ 岁$/);
    expect(insight.relationship.summary).toContain("观察角度");
    expect(insight.evidence).toMatchObject({ engine: "iztro", engineVersion: "2.5.8", license: "MIT" });
    expect(insight.evidence.rawFieldsUsed).toContain("horoscope.daily.index");
    expect(insight.evidence.rulesApplied.length).toBeGreaterThanOrEqual(4);
  });
});
