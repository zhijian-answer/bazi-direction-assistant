import { getDailyInsight } from "./dailyInsightCatalog";
import { buildMobileQuestions } from "./buildMobileQuestions";
import type { DailyInsightData, MobileProfile, QuestionInsightData } from "./types";

export type InsightDataAdapter = {
  source: string;
  getDailyInsight: (profile: MobileProfile, date?: Date) => DailyInsightData;
  getQuestions: (context: QuestionInsightData["context"], profile?: MobileProfile) => QuestionInsightData[];
};

export function createInsightDataAdapter(overrides: Partial<InsightDataAdapter> = {}): InsightDataAdapter {
  return {
    source: overrides.source ?? "local-catalog-v1",
    getDailyInsight: overrides.getDailyInsight ?? getDailyInsight,
    getQuestions: overrides.getQuestions ?? ((context, profile) => profile && (context === "home" || context === "bazi") ? buildMobileQuestions(context, profile) : []),
  };
}

export const insightDataAdapter = createInsightDataAdapter();
