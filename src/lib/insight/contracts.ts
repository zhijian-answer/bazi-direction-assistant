export type InsightSystem = "bazi" | "ziwei" | "qimen";

export type InsightTopic =
  | "self"
  | "relationship"
  | "career"
  | "timing"
  | "wealth"
  | "wellbeing"
  | "decision";

export type ClaimDirection = "supports" | "cautions" | "neutral";
export type EvidenceLevel = "high" | "medium" | "limited";
export type FindingStatus = "agreement" | "partial" | "conflict" | "insufficient";

export type EvidenceEngine = {
  name: string;
  version: string;
  ruleVersion: string;
};

export type EvidenceClaim = {
  id: string;
  claimKey: string;
  system: InsightSystem;
  topic: InsightTopic;
  direction: ClaimDirection;
  statement: string;
  basis: string;
  engine: EvidenceEngine;
  applicability: number;
  dataCompleteness: number;
  sourceQuality: number;
  specificity: number;
  limitations: string[];
};

export type EvidenceFactors = {
  dataCompleteness: EvidenceLevel;
  questionFit: EvidenceLevel;
  crossSystemAgreement: EvidenceLevel;
  evidenceSpecificity: EvidenceLevel;
};

export type ConsensusFinding = {
  id: string;
  claimKey: string;
  topic: InsightTopic;
  status: FindingStatus;
  level: EvidenceLevel;
  summary: string;
  supportingClaimIds: string[];
  cautionClaimIds: string[];
  neutralClaimIds: string[];
  factors: EvidenceFactors;
  limitations: string[];
};

export type InsightExecutionStage = {
  id: string;
  label: string;
  systems: InsightSystem[];
  required: boolean;
};

export type InsightEstimate = {
  stageCount: number;
  durationLabel: string;
  creditLabel: string;
  basedOnSamples: number;
  hardStageLimit: number;
};

export type InsightReportVersion = {
  id: string;
  sequence: number;
  createdAt: string;
  reason: "initial" | "profile-updated" | "scope-expanded" | "engine-updated";
  inputHash: string;
  engines: EvidenceEngine[];
  findingIds: string[];
};

export type QimenEngineInput = {
  occurredAt: string;
  timezone: string;
  latitude: number;
  longitude: number;
  questionCategory: InsightTopic;
  method: "hour";
};

export type QimenPalace = {
  palace: number;
  earthStem: string;
  heavenStem: string;
  star: string;
  door: string;
  deity: string;
  hiddenStem?: string;
  isVoid: boolean;
  hasHorse: boolean;
};

export type QimenEngineOutput = {
  engine: EvidenceEngine;
  chart: {
    dunType: "yin" | "yang";
    juNumber: number;
    chiefStar: string;
    chiefDoor: string;
    palaces: QimenPalace[];
  };
  warnings: string[];
};

export interface QimenEngineAdapter {
  calculate(input: QimenEngineInput): Promise<QimenEngineOutput>;
}
