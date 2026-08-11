import type { CompatibilityReport } from "@/lib/compatibility";
import type { MobileProfile } from "@/lib/mobile/types";
import type { PersonFact, ReportApi, SectionColorKey, SynastryRecord } from "./types";

const avatarColors = ["#8E78CF", "#5BA3CE", "#D78273", "#4FA283", "#B28B39"];
const sectionColors: SectionColorKey[] = ["lavender", "coral", "sky", "mint", "gold", "ink"];

function stableColor(seed: string) {
  const score = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return avatarColors[score % avatarColors.length];
}

export function personFromProfile(profile: MobileProfile): PersonFact {
  return {
    id: profile.id || `profile-${profile.name}`,
    name: profile.name || "未命名档案",
    birthday: profile.birthDate,
    birthTime: profile.birthTimeKnown ? profile.birthTime : "",
    birthTimeAccuracy: profile.birthTimeKnown ? "exact" : "unknown",
    birthPlace: profile.birthPlace,
    avatarColor: stableColor(profile.id || profile.name),
    avatarChar: profile.name.slice(0, 1) || "玄",
  };
}

function dimensionScore(report: CompatibilityReport, id: string, fallback: number) {
  return report.dimensions.find((item) => item.id === id)?.score ?? fallback;
}

function reportApi(report: CompatibilityReport): ReportApi {
  const fallbackScore = report.overallScore;
  const sections = report.sections.map((section, index) => ({
    key: section.id,
    title: section.title,
    colorKey: sectionColors[index % sectionColors.length],
    body: section.observation || section.conclusion,
    signals: section.evidence.slice(0, 3),
    actions: section.action ? [section.action] : [],
  }));
  return {
    heroTitle: report.title || report.summary,
    heroSubtitle: report.mode === "astrology" ? "从星盘关系里，看见你们靠近彼此的方式" : "从生辰结构里，看见你们相处时的默契与差异",
    summary: report.summary,
    tags: [...report.dimensions].sort((left, right) => right.score - left.score).slice(0, 3).map((item) => item.label),
    overallScore: report.overallScore,
    scores: {
      attraction: dimensionScore(report, "attraction", fallbackScore),
      emotion: dimensionScore(report, "emotion", fallbackScore),
      communication: dimensionScore(report, "communication", fallbackScore),
      values: dimensionScore(report, "stability", fallbackScore),
      pace: dimensionScore(report, "rhythm", fallbackScore),
      intimacy: Math.round((dimensionScore(report, "attraction", fallbackScore) + dimensionScore(report, "emotion", fallbackScore)) / 2),
    },
    sections,
    todayStep: report.sections.find((section) => section.action)?.action || "先选一件最近反复出现的小事，把各自看到的事实和真正需要说清楚。",
    questions: report.narrativeQuestions?.slice(0, 4) || [],
  };
}

export function recordFromReport(report: CompatibilityReport): SynastryRecord {
  return {
    id: report.id,
    person1: personFromProfile(report.primary as MobileProfile),
    person2: personFromProfile(report.partner as MobileProfile),
    relationshipType: report.relationshipType,
    chartType: report.mode === "astrology" ? "synastry" : "birth",
    createdAt: report.createdAt,
    api: reportApi(report),
  };
}
