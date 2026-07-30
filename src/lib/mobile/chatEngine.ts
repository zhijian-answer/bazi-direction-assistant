import { buildMobileBaziReport } from "./buildMobileBaziReport";
import { buildMobileFlowReport } from "./buildMobileFlowReport";
import { buildMobileZodiacReport } from "./buildMobileZodiacReport";
import { mobileProfileToZiweiInput } from "./ziweiAdapter";
import type { MobileProfile, SharePosterData } from "./types";
import { calculateZiweiInsight } from "../ziwei/service";
import { adaptMobileChatEvidence, type MobileChatEvidenceTrace } from "../insight/mobileChatEvidenceAdapter";

export type MobileChatCategory = "self" | "relationship" | "career" | "timing" | "emotion" | "wealth";

export type MobileChatEvidence = {
  system: "生辰" | "流盘" | "星座" | "紫微";
  label: string;
  value: string;
  detail: string;
  engine: string;
};

export type MobileChatAnswer = {
  id: string;
  question: string;
  category: MobileChatCategory;
  title: string;
  summary: string;
  observations: string[];
  action: string;
  evidence: MobileChatEvidence[];
  evidenceTrace: MobileChatEvidenceTrace;
  limitations: string[];
  suggestions: string[];
  poster: SharePosterData;
};

export const mobileChatStarters = [
  "我最近应该先稳住，还是主动推进？",
  "我在关系里最容易卡在哪里？",
  "什么样的工作环境更适合我？",
  "我为什么容易内耗？",
  "今天最值得先做什么？",
  "我身上最稳定的优势是什么？",
] as const;

const categoryKeywords: Array<{ category: MobileChatCategory; keywords: string[] }> = [
  { category: "relationship", keywords: ["关系", "感情", "恋爱", "喜欢", "对方", "伴侣", "合适", "忽冷忽热", "主动追"] },
  { category: "career", keywords: ["工作", "事业", "职业", "职场", "跳槽", "创业", "学习", "学业", "方向"] },
  { category: "wealth", keywords: ["钱", "财", "收入", "投资", "理财", "消费", "资源"] },
  { category: "emotion", keywords: ["内耗", "焦虑", "情绪", "压力", "疲惫", "累", "恢复", "状态"] },
  { category: "timing", keywords: ["最近", "今年", "本月", "今天", "时机", "主动", "稳住", "什么时候", "阶段"] },
];

const suggestionMap: Record<MobileChatCategory, string[]> = {
  self: ["我身上最稳定的优势是什么？", "我为什么容易内耗？", "什么环境更容易让我发挥？"],
  relationship: ["我在关系里真正需要什么？", "我该主动一次还是继续观察？", "怎样的回应值得我继续投入？"],
  career: ["什么样的工作环境更适合我？", "我现在适合换方向吗？", "怎样减少工作中的消耗？"],
  timing: ["今天最值得先做什么？", "我最近应该先稳住还是主动推进？", "本月最需要避免什么？"],
  emotion: ["我为什么容易内耗？", "什么方式最能帮我恢复状态？", "我该怎样减少同时处理太多事？"],
  wealth: ["我处理资源时最容易忽略什么？", "最近应该控制投入还是继续积累？", "怎样让安排更可持续？"],
};

function classifyQuestion(question: string): MobileChatCategory {
  const normalized = question.replaceAll(/\s+/g, "");
  return categoryKeywords.find((item) => item.keywords.some((keyword) => normalized.includes(keyword)))?.category || "self";
}

function unique(values: Array<string | undefined>) {
  return [...new Set(values.filter((value): value is string => Boolean(value?.trim())).map((value) => value.trim()))];
}

function safeFind<T extends { id?: string; title?: string }>(items: T[], idOrTitle: string) {
  return items.find((item) => item.id === idOrTitle || item.title?.includes(idOrTitle));
}

function answerId(question: string, at: Date) {
  let hash = 2166136261;
  for (const character of `${question}-${at.toISOString().slice(0, 10)}`) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return `chat-${(hash >>> 0).toString(36)}`;
}

export async function buildMobileChatAnswer(profile: MobileProfile, question: string, at = new Date()): Promise<MobileChatAnswer> {
  const cleanQuestion = question.trim().slice(0, 240);
  if (cleanQuestion.length < 2) throw new Error("请把想了解的事情再说具体一点。");

  const category = classifyQuestion(cleanQuestion);
  const bazi = buildMobileBaziReport(profile);
  const flow = buildMobileFlowReport(profile, at);
  let zodiac: ReturnType<typeof buildMobileZodiacReport> | undefined;
  try {
    zodiac = buildMobileZodiacReport(profile);
  } catch {
    zodiac = undefined;
  }

  const ziweiResult = profile.birthTimeKnown && profile.gender !== "other"
    ? await calculateZiweiInsight(mobileProfileToZiweiInput(profile, at))
    : undefined;
  const ziwei = ziweiResult?.status === "ready" ? ziweiResult.insight : undefined;
  const limitations = unique([
    ...bazi.calculation.warnings,
    zodiac?.completeness.warning,
    !profile.birthTimeKnown ? "出生时辰未知，回答不会使用时柱、上升星座、完整月亮配置或紫微十二宫。" : undefined,
    profile.gender === "other" ? "排盘所需性别未明确，回答不会使用大运顺逆和紫微运限。" : undefined,
    !ziwei && profile.birthTimeKnown && profile.gender !== "other" ? "紫微结构本次未能加入回答，已使用其他可用依据。" : undefined,
  ]);

  const baziRelationship = safeFind(bazi.readings, "relationship");
  const baziCareer = safeFind(bazi.readings, "career");
  const zodiacRelationship = zodiac ? safeFind(zodiac.traits, "关系") : undefined;
  const zodiacEmotion = zodiac ? safeFind(zodiac.traits, "情绪") : undefined;
  const zodiacAction = zodiac?.questions.find((item) => item.id === "zodiac-initiative");
  const resourceCard = bazi.lightConclusions[2];

  const evidence: MobileChatEvidence[] = [
    {
      system: "生辰",
      label: bazi.calculation.scope === "four-pillar" ? "四柱可见结构" : "年、月、日三柱结构",
      value: `${bazi.identity.dayPillar}日柱 · ${bazi.identity.strongestLabel}较突出`,
      detail: bazi.identity.basis,
      engine: `${bazi.calculation.engine} · ${bazi.calculation.balanceMethod}`,
    },
    {
      system: "流盘",
      label: flow.periodLabel,
      value: flow.focus.title,
      detail: `${flow.evidence.annual}流年 · ${flow.evidence.monthly}流月 · ${flow.evidence.daily}流日`,
      engine: flow.engineVersion,
    },
  ];

  if (zodiac) {
    evidence.push({
      system: "星座",
      label: "本命星体配置",
      value: zodiac.identity.tags.join(" · "),
      detail: zodiac.completeness.isPartial ? "仅使用在出生资料范围内可以稳定确认的星体位置。" : zodiac.highlight.note,
      engine: zodiac.completeness.engine,
    });
  }
  if (ziwei) {
    evidence.push({
      system: "紫微",
      label: `${ziwei.evidence.mingGong || "命宫待确认"} · ${ziwei.evidence.shenGong || "身宫待确认"}`,
      value: ziwei.identity.tags.join(" · "),
      detail: `${ziwei.evidence.majorStars.join("、") || "空宫结合对宫观察"}；当前阶段为${ziwei.stage.rangeLabel}。`,
      engine: `${ziwei.evidence.engine}@${ziwei.evidence.engineVersion}`,
    });
  }

  let title = bazi.identity.title;
  let summary = bazi.identity.subtitle;
  let observations: string[] = [bazi.identity.patternScene];
  let action = bazi.todayAction.title;

  if (category === "relationship") {
    title = baziRelationship?.highlight || "先看真实回应，再决定投入多少";
    summary = baziRelationship?.summary || "关系里的安全感需要通过持续回应建立，而不是只靠标签和猜测。";
    observations = unique([zodiacRelationship?.note, ziwei?.relationship.summary, zodiacAction?.observation]);
    action = zodiacAction?.action || "把感受、事实和请求分开说清楚，再观察回应是否持续。";
  } else if (category === "career") {
    title = baziCareer?.highlight || flow.focus.title;
    summary = baziCareer?.summary || bazi.lightConclusions[0].note;
    observations = unique([flow.focus.note, ziwei?.stage.summary, bazi.identity.patternScene]);
    action = flow.focus.suitable.split("、")[0] ? `先完成一件与“${flow.focus.suitable.split("、")[0]}”有关、能够获得反馈的小任务。` : flow.daily.suitable;
  } else if (category === "timing") {
    title = flow.focus.title;
    summary = flow.summary;
    observations = unique([flow.daily.note, ziwei?.today.summary, bazi.readings.find((item) => item.id === "annual")?.summary]);
    action = flow.question.action;
  } else if (category === "emotion") {
    title = zodiacEmotion?.value || "先减少同时处理的事情，再判断自己真正需要什么";
    summary = zodiacEmotion?.note || bazi.identity.patternScene;
    observations = unique([ziwei ? `稳定区：${ziwei.environment.stableZone.slice(0, 2).join("；")}` : undefined, ziwei ? `消耗区：${ziwei.environment.drainZone.slice(0, 2).join("；")}` : undefined, flow.daily.note]);
    action = ziwei?.today.action || "先减少一项并行任务，留出一段不需要回应任何人的完整时间。";
  } else if (category === "wealth") {
    title = resourceCard?.title || "先把资源安排变得可持续";
    summary = resourceCard?.note || "涉及时间、金钱和精力时，先确认边界与承受范围。";
    observations = unique([flow.focus.note, bazi.identity.patternScene]);
    action = "先写清楚可承受的时间、金额和停止条件；涉及投资时仍需以真实数据和专业意见为准。";
  } else {
    observations = unique([zodiac?.identity.subtitle, ziwei?.identity.summary, bazi.identity.patternScene]);
  }

  if (!observations.length) observations = ["当前先使用能够稳定确认的命盘字段，不补写资料不足的部分。"];

  const id = answerId(cleanQuestion, at);
  const poster: SharePosterData = {
    id,
    category: "question",
    eyebrow: "玄枢 · 结构化问题解读",
    title,
    body: `${summary} ${action}`,
    tags: [evidence[0].system, evidence[1].system, category === "relationship" ? "关系观察" : category === "career" ? "工作节奏" : "行动建议"],
    footer: "来自当前档案的可追溯依据，仅供自我观察",
    tone: category === "relationship" ? "coral" : category === "emotion" ? "sage" : "ink",
  };
  const evidenceTrace = adaptMobileChatEvidence(evidence, category, limitations);

  return {
    id,
    question: cleanQuestion,
    category,
    title,
    summary,
    observations,
    action,
    evidence,
    evidenceTrace,
    limitations,
    suggestions: suggestionMap[category],
    poster,
  };
}
