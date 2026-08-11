import type { MobileProfile } from "../mobile/types";

export type CompatibilityMode = "astrology" | "bazi";
export type RelationshipType = "lover" | "partner" | "ambiguous" | "friend" | "family" | "colleague" | "other";

export type CompatibilityDraft = {
  id: string;
  mode: CompatibilityMode;
  primaryProfileId: string;
  partnerProfileId: string;
  primarySnapshot?: MobileProfile;
  partnerSnapshot?: MobileProfile;
  relationshipType: RelationshipType;
  partnerMbti?: string;
  createdAt: string;
};

export type CompatibilityDimension = {
  id: "attraction" | "emotion" | "communication" | "stability" | "rhythm";
  label: string;
  score: number;
  summary: string;
  evidence: string[];
};

export type CompatibilitySection = {
  id: string;
  title: string;
  conclusion: string;
  observation: string;
  action: string;
  evidence: string[];
};

export type CompatibilityReport = {
  id: string;
  draftId: string;
  mode: CompatibilityMode;
  relationshipType: RelationshipType;
  primary: Pick<MobileProfile, "id" | "name" | "birthDate" | "birthTime" | "birthTimeKnown" | "birthPlace" | "isDemo">;
  partner: Pick<MobileProfile, "id" | "name" | "birthDate" | "birthTime" | "birthTimeKnown" | "birthPlace" | "isDemo">;
  title: string;
  summary: string;
  overallScore: number;
  dimensions: CompatibilityDimension[];
  sections: CompatibilitySection[];
  warnings: string[];
  shareLine?: string;
  narrativeQuestions?: string[];
  delivery?: {
    source: "api" | "fallback";
    provider?: string;
    model?: string;
    promptVersion: string;
    generatedAt: string;
  };
  engine: {
    name: string;
    version: string;
    ruleVersion: string;
  };
  createdAt: string;
};
