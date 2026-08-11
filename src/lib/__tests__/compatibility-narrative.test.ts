import { describe, expect, it } from "vitest";
import { buildCompatibilityNarrativeRequest } from "../compatibility/narrative";
import type { CompatibilityReport, RelationshipType } from "../compatibility/types";
import { buildReportScenarioSystemPrompt } from "../narrative/reportPrompt";
import { inspectRelationshipNarrative } from "../narrative/reportQuality";
import type { ReportNarrativeBundle } from "../narrative/reportContracts";

function reportFor(relationshipType: RelationshipType): CompatibilityReport {
  return {
    id: `report-${relationshipType}`,
    draftId: `draft-${relationshipType}`,
    mode: "bazi",
    relationshipType,
    primary: { id: "a", name: "小玄", birthDate: "1990-01-01", birthTime: "09:00", birthTimeKnown: true, birthPlace: "上海市" },
    partner: { id: "b", name: "小枢", birthDate: "1992-02-02", birthTime: "11:00", birthTimeKnown: true, birthPlace: "北京市" },
    title: "关系报告",
    summary: "两个人有相似之处，也有需要说明的差异。",
    overallScore: 72,
    dimensions: [
      { id: "attraction", label: "吸引力", score: 80, summary: "相处自然。", evidence: ["日柱关系可比较"] },
      { id: "emotion", label: "情绪回应", score: 70, summary: "回应节奏不同。", evidence: ["五行侧重不同"] },
      { id: "communication", label: "沟通方式", score: 75, summary: "表达方式不同。", evidence: ["十神表达不同"] },
      { id: "stability", label: "稳定程度", score: 68, summary: "需要现实确认。", evidence: ["合冲关系可比较"] },
      { id: "rhythm", label: "行动节奏", score: 65, summary: "推进速度不同。", evidence: ["五行节奏不同"] },
    ],
    sections: [{ id: "overview", title: "相处方式", conclusion: "有默契。", observation: "表达不同。", action: "说清期待。", evidence: ["双方结构"] }],
    warnings: [],
    engine: { name: "local", version: "1", ruleVersion: "rule-1" },
    createdAt: "2026-08-10T00:00:00.000Z",
  };
}

const romanticBundle: ReportNarrativeBundle = {
  title: "你们很容易心动",
  summary: "这段恋爱有明显吸引力。",
  action: "约一次会，把爱意说清楚。",
  shareLine: "爱情正在靠近",
  questions: ["你们会复合吗？"],
  sections: [{ id: "dimension-attraction", title: "亲密吸引", body: "很像伴侣。" }],
};

describe("relationship-aware compatibility narratives", () => {
  it.each(["lover", "partner", "ambiguous", "friend", "family", "colleague", "other"] as const)(
    "passes the controlled %s scenario into the report request",
    (relationshipType) => {
      const request = buildCompatibilityNarrativeRequest(reportFor(relationshipType));
      expect(request.relationshipType).toBe(relationshipType);
      expect(buildReportScenarioSystemPrompt(request)).toContain("玄枢 App");
    },
  );

  it("uses friendship language in fallback content", () => {
    const request = buildCompatibilityNarrativeRequest(reportFor("friend"));
    expect(request.fallback.sections[0].title).toBe("自然默契");
    expect(request.fallback.questions.join(" ")).toContain("友情");
    expect(request.fallback.questions.join(" ")).not.toMatch(/恋爱|暧昧|伴侣|婚姻/);
  });

  it.each(["friend", "family", "colleague"] as const)("rejects romantic copy for %s reports", (relationshipType) => {
    expect(inspectRelationshipNarrative(romanticBundle, relationshipType)).toContain(
      "当前关系不是爱情关系，文案却使用了恋爱或亲密关系话术",
    );
  });

  it("gives family and colleague distinct writing identities", () => {
    const family = buildReportScenarioSystemPrompt(buildCompatibilityNarrativeRequest(reportFor("family")));
    const colleague = buildReportScenarioSystemPrompt(buildCompatibilityNarrativeRequest(reportFor("colleague")));
    expect(family).toContain("家庭关系内容编辑");
    expect(family).toContain("代际习惯");
    expect(colleague).toContain("职场协作关系内容编辑");
    expect(colleague).toContain("职责分工");
  });
});
