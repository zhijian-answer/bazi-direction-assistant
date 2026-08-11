import { buildProfileZodiacChart } from "@/lib/astrology/profileChart";
import { buildMobileBaziReport } from "@/lib/mobile/buildMobileBaziReport";
import { buildMobileFlowReport, type MobileFlowReport } from "@/lib/mobile/buildMobileFlowReport";
import { buildMobileZodiacReport } from "@/lib/mobile/buildMobileZodiacReport";
import type { MobileProfile, QuestionInsightData } from "@/lib/mobile/types";
import { buildZiweiQuestions } from "@/lib/mobile/ziweiAdapter";
import type { ElementKey } from "@/lib/types";
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
  palaceNarratives?: Record<string, string>;
  questions?: Question[];
  reasons?: ZiweiUnavailableReason[];
  error?: string;
};

const baziColors = ["#6BBFA0", "#7BBDE0", "#E8816A", "#E9C97E"];
const pillarNotes = ["早年", "环境", "自己", "后续"];
const zodiacColors = ["#E8816A", "#7BBDE0", "#6BBFA0", "#E9C97E", "#F08E78", "#88CCA8", "#C0ACDE", "#8C82A4", "#7A9CC6", "#9A7B8F"];
const zodiacBodyOrder: ZodiacBodyKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];

function initialOf(name: string) {
  return name.trim().slice(0, 1) || "档";
}

const questionObservationExtras: Record<string, [string, string]> = {
  "ziwei-focus": [
    "哪些临时出现的事情，总在挤掉你真正想完成的安排？",
    "哪件事做完以后，你会立刻觉得心里松一点？",
  ],
  "ziwei-relationship": [
    "你开始反复猜的时候，对方给出的事实到底有多少？",
    "这段关系里，谁一直在解释，谁又一直没有行动？",
  ],
  "ziwei-work": [
    "现在的不舒服，是短期太累，还是长期没有成长和回应？",
    "如果不立刻离开，有没有一件事可以先小范围试一试？",
  ],
  "ziwei-control": [
    "哪些问题能靠你的行动改变，哪些只能等别人回应？",
    "当事情终于有了明确结果，你的紧绷会不会马上松下来？",
  ],
  "ziwei-recovery": [
    "最近哪一种人或场合，让你离开以后还要很久才能恢复？",
    "你是不是又把休息排在了所有人的需要后面？",
  ],
  "zodiac-attraction": [
    "让你心动的人，是否也愿意把喜欢落到现实安排里？",
    "过去几次相似的吸引，最后都卡在了什么地方？",
  ],
  "zodiac-fear": [
    "真正让你不安的，是联系变少，还是态度一直不清楚？",
    "对方有没有持续、具体地回应你的需要？",
  ],
  "zodiac-hot-cold": [
    "你退开之前，通常发生了什么让你觉得没有被接住？",
    "需要空间时，你有没有把原因和回来再聊的时间说清楚？",
  ],
};

function observationsFor(item: QuestionInsightData) {
  const extras = questionObservationExtras[item.id] || [
    "这件事最容易在什么人、什么场景里反复出现？",
    "如果只看现实行动，而不是猜测，你会得到什么不同的答案？",
  ];
  return [item.observation, ...extras];
}

export function toFigmaQuestion(item: QuestionInsightData): Question {
  return {
    id: item.id,
    source: item.source,
    title: item.prompt,
    answer: item.interpretation,
    observations: observationsFor(item),
    action: item.action,
    boundary: "这是一种理解自己的角度，不预测具体事件，也不替你作决定。",
  };
}

const baziEnvironment: Record<ElementKey, { stable: [string, string, string]; drain: [string, string, string] }> = {
  wood: {
    stable: ["看得见成长和进展的事情", "方向清楚、可以长期投入的项目", "愿意一起进步、不互相拖住的关系"],
    drain: ["努力很久却始终看不到变化", "反复改方向、没有明确目标的安排", "只要求付出却不愿一起成长的关系"],
  },
  fire: {
    stable: ["表达能被认真接住的交流", "能很快获得真实反馈的事情", "愿意回应热情、不长期冷处理的关系"],
    drain: ["投入很久却始终没有回音", "只能表演状态、不能说真实感受的场合", "用沉默和猜测代替沟通的关系"],
  },
  earth: {
    stable: ["责任清楚、答应的事能落地", "节奏稳定、可以一步步完成的安排", "彼此可靠、不需要反复确认的关系"],
    drain: ["计划一直变、最后没人负责", "同时照顾太多人的临时需求", "付出被当成理所当然的关系"],
  },
  metal: {
    stable: ["规则和完成标准都说得清楚", "边界明确、允许专心做事的环境", "愿意把重要的话直接说明白的关系"],
    drain: ["要求反复变化却没人解释", "边界模糊、责任总在互相推让", "问题一直悬着却拒绝正面回应的关系"],
  },
  water: {
    stable: ["独立思考、不被频繁打断的空间", "目标清晰、节奏自主的项目", "信任感强、不需要时刻解释的关系"],
    drain: ["需要频繁表态或表演的场合", "规则模糊、边界不清的团队氛围", "被动等待、长期处于不确定中"],
  },
};

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
  const element = report.evidence.dayMaster.element;
  const story = getBaziEditorialStory(element);
  const strongest = report.elements.slice().sort((a, b) => b.value - a.value)[0];
  const environment = baziEnvironment[element];

  return {
    profileName: profile.name || "当前档案",
    profileInitial: initialOf(profile.name),
    headerMeta: `${report.identity.dayPillar}日 · ${report.identity.dayLabel}日主 · ${report.identity.strongestLabel}相对突出`,
    identityTitle: story.title,
    identitySummary: story.summary,
    story,
    tags: story.tags,
    pillars: pillarParts(report),
    elements: report.elements,
    strongestLabel: strongest?.label || report.identity.strongestLabel,
    stableZone: environment.stable,
    drainZone: environment.drain,
    action: { title: story.actionTitle, note: story.actionNote },
    questions: report.readings.slice(0, 3).map((reading, index) => ({
      id: `bazi-reading-${reading.id}`,
      source: `来自你的生辰信息 · ${reading.term}`,
      title: reading.title,
      answer: reading.highlight,
      observations: [reading.summary],
      action: report.lightConclusions[index]?.note || report.todayAction.note,
      boundary: "这是一种理解自己的角度，不是固定命运。现实经历和你的选择，始终比标签更重要。",
    })),
    basis: [
      { label: "命盘依据", value: report.identity.basis.replace(/^依据：/, "") },
      { label: "为什么会这样", value: report.identity.patternEvidence },
      { label: "生活场景", value: report.identity.patternScene },
      { label: "阅读边界", value: report.identity.patternBoundary },
    ],
    flow: buildMobileFlowReport(profile),
  };
}

function formatDegree(degree: number) {
  return `${(((degree % 30) + 30) % 30).toFixed(1)}°`;
}

function withoutPresentationBoundary(value: string) {
  return value
    .replace(/\s*这是一段阶段性观察，不代表每一年都会以同样方式发生。?/g, "")
    .replace(/\s*这里提供的是观察角度，仍要结合真实互动判断。?/g, "")
    .trim();
}

function presentZiweiInsight(insight: NormalizedZiweiInsight): NormalizedZiweiInsight {
  return {
    ...insight,
    identity: { ...insight.identity, summary: withoutPresentationBoundary(insight.identity.summary) },
    relationship: { ...insight.relationship, summary: withoutPresentationBoundary(insight.relationship.summary) },
    stage: { ...insight.stage, summary: withoutPresentationBoundary(insight.stage.summary) },
    today: { ...insight.today, summary: withoutPresentationBoundary(insight.today.summary) },
  };
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
  if (result.status === "ready") {
    const insight = presentZiweiInsight(result.insight);
    return {
      status: "ready",
      profileName: profile.name || "当前档案",
      profileInitial: initialOf(profile.name),
      insight,
      story: getZiweiEditorialStory(insight),
      questions: buildZiweiQuestions(insight).map(toFigmaQuestion),
    };
  }
  if (result.status === "insufficient_input") return { status: "insufficient_input", profileName: profile.name || "当前档案", profileInitial: initialOf(profile.name), reasons: result.reasons };
  return { status: "calculation_error", profileName: profile.name || "当前档案", profileInitial: initialOf(profile.name), error: result.message };
}
