import type { MobileProfile } from "../mobile/types";
import { buildAstrologyCompatibility } from "./astrologyCompatibility";
import { buildBaziCompatibility } from "./baziCompatibility";
import { relationshipLabels } from "./labels";
import type { CompatibilityDraft, CompatibilityReport } from "./types";

function compactProfile(profile: MobileProfile): CompatibilityReport["primary"] {
  return {
    id: profile.id,
    name: profile.name,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime,
    birthTimeKnown: profile.birthTimeKnown,
    birthPlace: profile.birthPlace,
    isDemo: profile.isDemo,
  };
}

export function buildCompatibilityReport(draft: CompatibilityDraft, primary: MobileProfile, partner: MobileProfile): CompatibilityReport {
  const result = draft.mode === "astrology"
    ? buildAstrologyCompatibility(primary, partner)
    : buildBaziCompatibility(primary, partner);
  return {
    id: `compatibility-${draft.mode}-${Date.now()}`,
    draftId: draft.id,
    mode: draft.mode,
    relationshipType: draft.relationshipType,
    primary: compactProfile(primary),
    partner: compactProfile(partner),
    title: `${primary.name}与${partner.name}的${draft.mode === "astrology" ? "星盘" : "生辰"}合盘`,
    summary: `这份报告从${draft.mode === "astrology" ? "双方行星相位" : "双方四柱可比结构"}观察${relationshipLabels[draft.relationshipType]}关系里的连接、差异与沟通方式。关系区间只用于分层阅读，不代表关系结局。`,
    overallScore: result.overallScore,
    dimensions: result.dimensions,
    sections: result.sections,
    warnings: result.warnings,
    engine: {
      name: result.engine,
      version: draft.mode === "astrology" ? "1.1.0" : "1.7.7",
      ruleVersion: "xuanshu-compatibility-1.0.0",
    },
    createdAt: new Date().toISOString(),
  };
}
