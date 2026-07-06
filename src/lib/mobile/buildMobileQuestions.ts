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
      id: "bazi-environment", context: "bazi", prompt: "什么样的环境更容易让我发挥？", shortLabel: "环境怎么选",
      source: `来自${report.identity.dayPillar}日柱、${report.identity.strongestLabel}结构重心与${report.identity.weakestLabel}补足方向`,
      interpretation: `${report.identity.pattern}。${report.identity.patternEvidence}`,
      observation: report.identity.patternScene,
      action: `进入新环境前，先问清目标、责任和反馈周期，并确认它能否持续发挥“${report.identity.coverReading.title}”。`, tone: "ink",
    },
    {
      id: "bazi-relationship", context: "bazi", prompt: "我在关系里最在意什么？", shortLabel: "关系里在意什么",
      source: `来自${report.identity.dayPillar}日柱与当前关系解读`,
      interpretation: relationship.highlight,
      observation: relationship.summary,
      action: "先把事实、感受和请求分开说，再观察对方的回应是否持续。", tone: "coral",
    },
    { ...flow.question, id: "bazi-pace", context: "bazi", prompt: "现在更适合主动，还是稳住？", shortLabel: "主动还是稳住" },
    {
      id: "bazi-drain", context: "bazi", prompt: "什么事情最容易消耗我？", shortLabel: "什么最消耗我",
      source: `来自${report.identity.strongestLabel}主要力量与${report.identity.weakestLabel}相对不足的结构对照`,
      interpretation: `真正的消耗通常出现在“${report.identity.patternScene}”描述的条件里。`,
      observation: `你更容易依靠${report.identity.strongestLabel}对应的方式处理问题；当环境持续要求${report.identity.weakestLabel}相关能力，却没有恢复和反馈时，消耗会累积。`,
      action: `今天划出一件能调用${report.identity.strongestLabel}优势的事，同时暂停一项长期消耗${report.identity.weakestLabel}能力的低回报任务。`, tone: "warm",
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
      id: "home-work", context: "home", prompt: "我现在更适合换方向，还是先把手上的事做好？", shortLabel: "要不要换方向",
      source: `来自${report.identity.dayPillar}日柱、${report.identity.strongestLabel}结构重心与${flow.evidence.monthly}流月`,
      interpretation: `${work.title}。${flow.focus.title}。`, observation: `${work.note} 当前阶段的重点是：${flow.focus.note}`,
      action: `保留主线，用一周完成一次“${flow.focus.suitable.split("、")[0]}”相关的低成本测试。`, tone: "ink",
    },
    {
      id: "home-relationship", context: "home", prompt: "这段关系值得我继续投入吗？", shortLabel: "关系值不值得",
      source: `来自${report.identity.dayPillar}日柱的关系倾向与互动习惯`, interpretation: relationship.highlight, observation: relationship.summary,
      action: "提出一个具体需求，再观察对方是否愿意给出稳定、可验证的回应。", tone: "coral",
    },
    { ...flow.question, id: "home-action", context: "home", prompt: "最近我应该主动一点，还是先观察？", shortLabel: "主动还是观察", tone: "sage" },
    {
      id: "home-energy", context: "home", prompt: "为什么最近总觉得很累？", shortLabel: "为什么总觉得累",
      source: `来自${report.identity.strongestLabel}/${report.identity.weakestLabel}结构与${flow.daily.ganZhi}当日关系`, interpretation: report.identity.patternScene,
      observation: `${flow.daily.note} 当熟悉优势被反复打断、又缺少${report.identity.weakestLabel}相关支持时，疲惫会更明显。`,
      action: `暂停一项低回报回应，把精力留给“${flow.daily.suitable.split("、")[0]}”。`, tone: "warm",
    },
    {
      id: "home-choice", context: "home", prompt: "面对两个选择，我该先看什么？", shortLabel: "两个选择怎么选",
      source: `来自${report.identity.dayPillar}日柱的惯用决策方式`, interpretation: report.identity.dayMaster,
      observation: `你的主要力量更偏${report.identity.strongestLabel}，因此比起只比较眼前热度，更适合比较哪一个选择能长期发挥${report.identity.coverReading.title}。`,
      action: "分别写下两个选择三个月后会留下什么、需要承担什么，再做判断。", tone: "violet",
    },
    {
      id: "home-today", context: "home", prompt: "今天最值得我先做的一件事是什么？", shortLabel: "今天先做什么",
      source: `来自本命${flow.evidence.dayPillar}与今日${flow.daily.ganZhi}的结构关系`, interpretation: daily.title, observation: daily.summary, action: daily.action, tone: "sky",
    },
  ];
}

export function buildMobileQuestions(context: "home" | "bazi", profile: MobileProfile, date = new Date()) {
  return context === "home" ? homeQuestions(profile, date) : baziQuestions(profile, date);
}
