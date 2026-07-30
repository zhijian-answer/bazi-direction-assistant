import { describe, expect, it } from "vitest";
import { buildInsightPlan } from "../planner";
import { synthesizeEvidence } from "../synthesizeEvidence";
import { runQimenShadow } from "../qimenShadow";
import type { EvidenceClaim, QimenEngineAdapter } from "../contracts";

const engine = { name: "fixture", version: "1.0.0", ruleVersion: "2026-07" };

function claim(partial: Partial<EvidenceClaim> & Pick<EvidenceClaim, "id" | "system" | "direction" | "statement">): EvidenceClaim {
  return {
    claimKey: "advance-carefully",
    topic: "decision",
    basis: "测试依据",
    engine,
    applicability: 0.9,
    dataCompleteness: 0.9,
    sourceQuality: 0.8,
    specificity: 0.8,
    limitations: [],
    ...partial,
  };
}

describe("insight planner", () => {
  it("only enables qimen for a deep timing or decision question with event context", () => {
    const plan = buildInsightPlan({
      topic: "decision",
      depth: "deep",
      birthTimeKnown: true,
      genderKnown: true,
      eventTimeKnown: true,
      eventLocationKnown: true,
    });

    expect(plan.systems).toEqual(["bazi", "ziwei", "qimen"]);
    expect(plan.stages.length).toBeLessThanOrEqual(8);
    expect(plan.estimate.basedOnSamples).toBe(0);
    expect(plan.estimate.durationLabel).not.toMatch(/\d+\s*秒/);
  });

  it("does not silently invent qimen inputs", () => {
    const plan = buildInsightPlan({
      topic: "timing",
      depth: "deep",
      birthTimeKnown: true,
      genderKnown: true,
      eventTimeKnown: false,
      eventLocationKnown: false,
    });

    expect(plan.systems).not.toContain("qimen");
    expect(plan.limitations.join(" ")).toContain("不启用奇门");
  });
});

describe("evidence synthesis", () => {
  it("marks cross-system agreement without presenting a probability", () => {
    const findings = synthesizeEvidence([
      claim({ id: "b1", system: "bazi", direction: "supports", statement: "先小步验证，再扩大投入。" }),
      claim({ id: "z1", system: "ziwei", direction: "supports", statement: "先小步验证，再扩大投入。" }),
    ]);

    expect(findings[0].status).toBe("agreement");
    expect(findings[0].level).toBe("high");
    expect(JSON.stringify(findings[0])).not.toContain("%");
  });

  it("keeps contradictory evidence visible and recommends a reversible action", () => {
    const findings = synthesizeEvidence([
      claim({ id: "b1", system: "bazi", direction: "supports", statement: "当前主线可以继续推进。" }),
      claim({ id: "q1", system: "qimen", direction: "cautions", statement: "短期外部条件还不稳定。" }),
    ]);

    expect(findings[0].status).toBe("conflict");
    expect(findings[0].supportingClaimIds).toEqual(["b1"]);
    expect(findings[0].cautionClaimIds).toEqual(["q1"]);
    expect(findings[0].summary).toContain("低成本验证");
  });
});

describe("qimen shadow mode", () => {
  it("skips without inventing inputs when qimen is outside the plan", async () => {
    const plan = buildInsightPlan({
      topic: "timing",
      depth: "deep",
      birthTimeKnown: true,
      genderKnown: true,
      eventTimeKnown: false,
      eventLocationKnown: false,
    });

    const record = await runQimenShadow({ plan });
    expect(record.status).toBe("skipped");
    expect(record.visibleToUser).toBe(false);
    expect(record.reason).toContain("奇门");
  });

  it("calculates internally but never exposes the result to the user", async () => {
    const plan = buildInsightPlan({
      topic: "decision",
      depth: "deep",
      birthTimeKnown: true,
      genderKnown: true,
      eventTimeKnown: true,
      eventLocationKnown: true,
    });
    const adapter: QimenEngineAdapter = {
      async calculate() {
        return {
          engine,
          chart: {
            dunType: "yang",
            juNumber: 1,
            chiefStar: "天蓬",
            chiefDoor: "休门",
            palaces: [],
          },
          warnings: [],
        };
      },
    };

    const record = await runQimenShadow({
      plan,
      adapter,
      qimenInput: {
        occurredAt: "2026-07-29T10:00:00+08:00",
        timezone: "Asia/Shanghai",
        latitude: 31.2304,
        longitude: 121.4737,
        questionCategory: "decision",
        method: "hour",
      },
    });

    expect(record.status).toBe("calculated");
    expect(record.visibleToUser).toBe(false);
    expect(record.inputHash).toBeTruthy();
    expect(record.outputHash).toBeTruthy();
  });
});
