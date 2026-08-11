import type { NarrativeFact } from "./contracts";

export const REPORT_NARRATIVE_VERSION = "xuanshu-report-copy-v11";

export type ReportNarrativeContext = "daily" | "flow" | "bazi" | "zodiac" | "ziwei" | "compatibility";
export type ReportRelationshipType = "lover" | "partner" | "ambiguous" | "friend" | "family" | "colleague" | "other";

export type ReportNarrativeSection = {
  id: string;
  title: string;
  body: string;
  action?: string;
};

export type ReportNarrativeBundle = {
  title: string;
  summary: string;
  action: string;
  shareLine: string;
  questions: string[];
  sections: ReportNarrativeSection[];
};

export type ReportNarrativeRequest = {
  context: ReportNarrativeContext;
  reportKey: string;
  relationshipType?: ReportRelationshipType;
  facts: NarrativeFact[];
  fallback: ReportNarrativeBundle;
  promptVersion?: string;
};

export type ReportNarrativeResponse = {
  bundle: ReportNarrativeBundle;
  source: "api" | "fallback";
  provider?: string;
  model?: string;
  promptVersion: string;
  issues: string[];
};
