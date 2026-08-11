import { buildMobileBaziReport } from "./buildMobileBaziReport";
import { buildMobileFlowReport } from "./buildMobileFlowReport";
import { getDailyInsight } from "./dailyInsightCatalog";
import type { MobileProfile, QuestionInsightData } from "./types";

function baziQuestions(profile: MobileProfile, date: Date): QuestionInsightData[] {
  const report = buildMobileBaziReport(profile);
  const flow = buildMobileFlowReport(profile, date);
  const relationship = report.readings.find((item) => item.id === "relationship")!;
  return [
    {
      id: "bazi-environment", context: "bazi", prompt: "在什么样的环境里，我会最自在、最像自己？", shortLabel: "哪里更像自己",
      source: `来自${report.identity.dayPillar}日柱、${report.identity.strongestLabel}结构重心与${report.identity.weakestLabel}补足方向`,
      interpretation: `${report.identity.pattern}。${report.identity.patternEvidence}`,
      observation: report.identity.patternScene,
      action: `进入新环境前，先问清要做什么、谁来负责、多久能看到反馈，再判断这里能不能让你发挥“${report.identity.coverReading.title}”。`, tone: "ink",
    },
    {
      id: "bazi-relationship", context: "bazi", prompt: "在关系里，我最怕哪件事一直悬着？", shortLabel: "最怕什么悬着",
      source: `来自${report.identity.dayPillar}日柱与当前关系解读`,
      interpretation: relationship.highlight,
      observation: relationship.summary,
      action: "先把事实、感受和请求分开说，再观察对方的回应是否持续。", tone: "coral",
    },
    { ...flow.question, id: "bazi-pace", context: "bazi", prompt: "现在更适合主动，还是先把手上的事做完？", shortLabel: "主动还是做完" },
    {
      id: "bazi-drain", context: "bazi", prompt: "当我觉得累，通常是被什么消耗了？", shortLabel: "什么最消耗我",
      source: `来自${report.identity.strongestLabel}主要力量与${report.identity.weakestLabel}相对不足的结构对照`,
      interpretation: `很多时候不是做得太多，而是在不该一直妥协的地方给出了太多。${report.identity.patternScene}`,
      observation: `你习惯先用${report.identity.strongestLabel}对应的方式处理问题；如果环境长期要求你补上${report.identity.weakestLabel}那一面，却始终没有反馈和喘息，疲惫就会慢慢积起来。`,
      action: `今天先停掉一件回报很低、却长期占着你的事，把力气留给真正需要${report.identity.strongestLabel}优势的部分。`, tone: "warm",
    },
  ];
}

function homeQuestions(profile: MobileProfile, date: Date): QuestionInsightData[] {
  const report = buildMobileBaziReport(profile);
  const flow = buildMobileFlowReport(profile, date);
  const daily = getDailyInsight(profile, date);
  const work = report.lightConclusions[0];
  const relationship = report.readings.find((item) => item.id === "relationship")!;
  return [
    {
      id: "home-work", context: "home", prompt: "这份工作该继续熬，还是换个方向？", shortLabel: "工作要不要换",
      source: `来自${report.identity.dayPillar}日柱、${report.identity.strongestLabel}结构重心与${flow.evidence.monthly}流月`,
      interpretation: `${work.title}。${flow.focus.title}。`, observation: `${work.note} 最近先留意：${flow.focus.note}`,
      action: `先别一次推翻全部。用一周试一次与“${flow.focus.suitable.split("、")[0]}”有关的小变化，再看真实反馈。`, tone: "ink",
    },
    {
      id: "home-relationship", context: "home", prompt: "这段关系值得继续，还是只是舍不得？", shortLabel: "关系值不值得",
      source: `来自${report.identity.dayPillar}日柱的关系倾向与互动习惯`, interpretation: relationship.highlight, observation: relationship.summary,
      action: "说出一个具体需要，再看对方愿不愿意用持续的行动回应。", tone: "coral",
    },
    { ...flow.question, id: "home-action", context: "home", prompt: "最近该主动争取，还是先观察？", shortLabel: "主动还是观察", tone: "sage" },
    {
      id: "home-energy", context: "home", prompt: "为什么最近总觉得累，却又停不下来？", shortLabel: "为什么停不下来",
      source: `来自${report.identity.strongestLabel}/${report.identity.weakestLabel}结构与${flow.daily.ganZhi}当日关系`, interpretation: report.identity.patternScene,
      observation: `${flow.daily.note} 当熟悉优势被反复打断、又缺少${report.identity.weakestLabel}相关支持时，疲惫会更明显。`,
      action: `先不回应一件不必今天处理的事，把力气留给“${flow.daily.suitable.split("、")[0]}”。`, tone: "warm",
    },
    {
      id: "home-choice", context: "home", prompt: "两个选择都舍不得时，我该先看什么？", shortLabel: "两个选择怎么选",
      source: `来自${report.identity.dayPillar}日柱的惯用决策方式`, interpretation: report.identity.dayMaster,
      observation: `你的主要力量更偏${report.identity.strongestLabel}，因此比起只比较眼前热度，更适合比较哪一个选择能长期发挥${report.identity.coverReading.title}。`,
      action: "分别写下两个选择三个月后会留下什么、需要承担什么，再做判断。", tone: "violet",
    },
    {
      id: "home-today", context: "home", prompt: "今天最值得先完成的，是哪一件事？", shortLabel: "今天先做什么",
      source: `来自本命${flow.evidence.dayPillar}与今日${flow.daily.ganZhi}的结构关系`, interpretation: daily.title, observation: daily.summary, action: daily.action, tone: "sky",
    },
  ];
}

export function buildMobileQuestions(context: "home" | "bazi", profile: MobileProfile, date = new Date()) {
  return context === "home" ? homeQuestions(profile, date) : baziQuestions(profile, date);
}
