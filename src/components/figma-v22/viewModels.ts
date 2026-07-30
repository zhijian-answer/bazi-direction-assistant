import { buildProfileZodiacChart } from "@/lib/astrology/profileChart";
import { buildMobileBaziReport } from "@/lib/mobile/buildMobileBaziReport";
import { buildMobileFlowReport, type MobileFlowReport } from "@/lib/mobile/buildMobileFlowReport";
import { buildMobileZodiacReport } from "@/lib/mobile/buildMobileZodiacReport";
import type { MobileProfile, QuestionInsightData } from "@/lib/mobile/types";
import { buildZiweiQuestions } from "@/lib/mobile/ziweiAdapter";
import { bodyLabels, signName } from "@/lib/zodiac/contentCatalog";
import type { ZodiacBodyKey } from "@/lib/zodiac/types";
import type { NormalizedZiweiInsight, ZiweiCalculationResult, ZiweiUnavailableReason } from "@/lib/ziwei/contracts";
import type { Question } from "./QuestionInsightSheet";
import {
  getBaziEditorialStory,
  getZodiacEditorialStory,
  getZiweiEditorialStory,
  type EditorialStory,
} from "./editorialCatalog";

type MobileBaziReport = ReturnType<typeof buildMobileBaziReport>;
type MobileZodiacReport = ReturnType<typeof buildMobileZodiacReport>;

export type FigmaPillar = {
  label: string;
  stem: string;
  branch: string;
  stemColor: string;
  note: string;
};

export type FigmaBaziViewModel = {
  profileName: string;
  profileInitial: string;
  headerMeta: string;
  identityTitle: string;
  identitySummary: string;
  story: EditorialStory;
  tags: string[];
  pillars: FigmaPillar[];
  elements: MobileBaziReport["elements"];
  strongestLabel: string;
  stableZone: string[];
  drainZone: string[];
  action: MobileBaziReport["todayAction"];
  questions: Question[];
  basis: Array<{ label: string; value: string }>;
  flow: MobileFlowReport;
};

export type FigmaNatalPlanet = {
  key: ZodiacBodyKey;
  label: string;
  color: string;
  sign: string;
  house?: number;
  name: string;
  degree: string;
  angle: number;
  description: string;
};

export type FigmaNatalViewModel = {
  profileName: string;
  profileInitial: string;
  identityTitle: string;
  identitySummary: string;
  story: EditorialStory;
  core: MobileZodiacReport["core"];
  highlight: MobileZodiacReport["highlight"];
  peaks: MobileZodiacReport["peaks"];
  traits: MobileZodiacReport["traits"];
  questions: Question[];
  planets: FigmaNatalPlanet[];
  houses: Array<{ id: number; sign: string; degree: string }>;
  aspects: Array<{ point1: ZodiacBodyKey; point2: ZodiacBodyKey; title: string; type: string; orb: string }>;
  isPartial: boolean;
  warning: string;
};

export type FigmaZiweiViewModel = {
  status: "ready" | "insufficient_input" | "calculation_error" | "loading";
  profileName: string;
  profileInitial: string;
  insight?: NormalizedZiweiInsight;
  story?: EditorialStory;
  questions?: Question[];
  reasons?: ZiweiUnavailableReason[];
  error?: string;
};

const baziColors = ["#6BBFA0", "#7BBDE0", "#E8816A", "#E9C97E"];
const pillarNotes = ["根", "势", "我", "向"];
const zodiacColors = ["#E8816A", "#7BBDE0", "#6BBFA0", "#E9C97E", "#F08E78", "#88CCA8", "#C0ACDE", "#8C82A4", "#7A9CC6", "#9A7B8F"];
const zodiacBodyOrder: ZodiacBodyKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

function initialOf(name: string) {
  return name.trim().slice(0, 1) || "档";
}

export function toFigmaQuestion(item: QuestionInsightData): Question {
  return {
    id: item.id,
    source: `${item.source} · 仅供自我观察`,
    title: item.prompt,
    answer: item.interpretation,
    observations: [item.observation],
    action: item.action,
    boundary: "以上内容用于结构化自我观察，不代表事件预测，也不替代现实判断。",
  };
}

function pillarParts(report: MobileBaziReport): FigmaPillar[] {
  const rows = report.pillars.rows;
  const stems = rows.find((row) => row[0] === "天干")?.slice(1) ?? [];
  const branches = rows.find((row) => row[0] === "地支")?.slice(1) ?? [];
  return ["年柱", "月柱", "日柱", "时柱"].map((label, index) => ({
    label,
    stem: stems[index] || "待",
    branch: branches[index] || "补",
    stemColor: baziColors[index],
    note: pillarNotes[index],
  }));
}

export function buildFigmaBaziViewModel(profile: MobileProfile): FigmaBaziViewModel {
  const report = buildMobileBaziReport(profile);
  const story = getBaziEditorialStory(report.evidence.dayMaster.element);
  const strongest = report.elements.slice().sort((a, b) => b.value - a.value)[0];
  const weakest = report.elements.slice().sort((a, b) => a.value - b.value)[0];
  const stableZone = [
    report.lightConclusions[0]?.title,
    report.lightConclusions[0]?.note,
    report.identity.pattern,
  ].filter(Boolean) as string[];
  const drainZone = [
    report.identity.patternScene.split("；").at(-1),
    `${weakest.label}相关条件长期不足时，需要更多主动调整`,
    "规则、反馈或关系边界持续不清楚的环境",
  ].filter(Boolean) as string[];

  return {
    profileName: profile.name || "当前档案",
    profileInitial: initialOf(profile.name),
    headerMeta: `${report.identity.dayPillar}日 · ${report.identity.dayLabel}日主 · ${report.identity.strongestLabel}为结构重心`,
    identityTitle: story.title,
    identitySummary: story.summary,
    story,
    tags: story.tags,
    pillars: pillarParts(report),
    elements: report.elements,
    strongestLabel: strongest?.label || report.identity.strongestLabel,
    stableZone: stableZone.slice(0, 3),
    drainZone: drainZone.slice(0, 3),
    action: { title: story.actionTitle, note: story.actionNote },
    questions: report.readings.slice(0, 3).map((reading, index) => ({
      id: `bazi-reading-${reading.id}`,
      source: `${reading.term} · 来自生辰结构`,
      title: reading.title,
      answer: reading.highlight,
      observations: [reading.summary],
      action: report.lightConclusions[index]?.note || report.todayAction.note,
      boundary: "这是一种结构倾向，不是固定命运。现实经验、关系质量和具体选择仍然会改变结果。",
    })),
    basis: [
      { label: "结构依据", value: report.identity.basis.replace(/^依据：/, "") },
      { label: "格局观察", value: report.identity.patternEvidence },
      { label: "生活场景", value: report.identity.patternScene },
      { label: "阅读边界", value: report.identity.patternBoundary },
    ],
    flow: buildMobileFlowReport(profile),
  };
}

function formatDegree(degree: number) {
  return `${(((degree % 30) + 30) % 30).toFixed(1)}°`;
}

export function buildFigmaNatalViewModel(profile: MobileProfile): FigmaNatalViewModel {
  const report = buildMobileZodiacReport(profile);
  const result = buildProfileZodiacChart(profile);
  const story = getZodiacEditorialStory(report.signs.sun);
  const planets = zodiacBodyOrder.map((body, index) => {
    const placement = result.chart.placements[body];
    return {
      key: body,
      label: bodyLabels[body].slice(0, 1),
      color: zodiacColors[index],
      sign: signName(placement.sign),
      house: placement.house,
      name: bodyLabels[body],
      degree: formatDegree(placement.degree),
      angle: placement.degree,
      description: report.readings.find((reading) => reading.id === body)?.highlight || `${bodyLabels[body]}描述你在这一层面的高频反应。`,
    };
  });

  return {
    profileName: profile.name || "当前档案",
    profileInitial: initialOf(profile.name),
    identityTitle: story.title,
    identitySummary: story.summary,
    story,
    core: report.core,
    highlight: report.highlight,
    peaks: report.peaks,
    traits: report.traits,
    questions: report.questions.map(toFigmaQuestion),
    planets,
    houses: result.chart.houses.map((house) => ({ id: house.id, sign: signName(house.sign), degree: formatDegree(house.cusp) })),
    aspects: result.chart.aspects
      .filter((aspect) => zodiacBodyOrder.includes(aspect.point1 as ZodiacBodyKey) && zodiacBodyOrder.includes(aspect.point2 as ZodiacBodyKey))
      .slice(0, 12)
      .map((aspect) => ({
      point1: aspect.point1 as ZodiacBodyKey,
      point2: aspect.point2 as ZodiacBodyKey,
      title: `${bodyLabels[aspect.point1 as ZodiacBodyKey] || aspect.point1} · ${bodyLabels[aspect.point2 as ZodiacBodyKey] || aspect.point2}`,
      type: aspect.type,
      orb: formatDegree(aspect.orb),
      })),
    isPartial: result.isPartial,
    warning: result.warnings.join(" "),
  };
}

export function buildFigmaZiweiViewModel(profile: MobileProfile, result?: ZiweiCalculationResult): FigmaZiweiViewModel {
  if (!result) return { status: "loading", profileName: profile.name || "当前档案", profileInitial: initialOf(profile.name) };
  if (result.status === "ready") return {
    status: "ready",
    profileName: profile.name || "当前档案",
    profileInitial: initialOf(profile.name),
    insight: result.insight,
    story: getZiweiEditorialStory(result.insight),
    questions: buildZiweiQuestions(result.insight).map(toFigmaQuestion),
  };
  if (result.status === "insufficient_input") return { status: "insufficient_input", profileName: profile.name || "当前档案", profileInitial: initialOf(profile.name), reasons: result.reasons };
  return { status: "calculation_error", profileName: profile.name || "当前档案", profileInitial: initialOf(profile.name), error: result.message };
}
