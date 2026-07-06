import type { NormalizedZiweiInsight, ZiweiBirthInput } from "../ziwei/contracts";
import type { MobileProfile, QuestionInsightData, SharePosterData } from "./types";

function localDate(now: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Shanghai", year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(now);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

function localTime(now: Date) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Shanghai", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now);
}

export function mobileProfileToZiweiInput(profile: MobileProfile, now = new Date()): ZiweiBirthInput {
  return {
    calendarType: profile.calendarType,
    birthDate: profile.birthDate,
    birthTime: profile.birthTimeKnown ? profile.birthTime || null : null,
    birthTimeKnown: profile.birthTimeKnown,
    gender: profile.gender,
    isLeapMonth: profile.calendarType === "lunar" ? profile.isLeapMonth : false,
    targetDate: localDate(now),
    targetTime: localTime(now),
  };
}

export function buildZiweiQuestions(insight: NormalizedZiweiInsight): QuestionInsightData[] {
  return [
    {
      id: "ziwei-focus",
      context: "ziwei",
      prompt: "最近最值得我投入的领域是什么？",
      shortLabel: "最近投入哪里",
      source: "来自当前阶段与今日领域重心，仅供自我观察",
      interpretation: insight.stage.summary,
      observation: `今天的关注重点更靠近“${insight.today.keyword}”。如果同一件事反复出现，它通常比临时的新任务更值得先处理。`,
      action: insight.today.action,
      tone: "ink",
    },
    {
      id: "ziwei-relationship",
      context: "ziwei",
      prompt: "为什么我在关系里容易想得太多？",
      shortLabel: "关系里想太多",
      source: "来自关系领域与四化结构，仅供自我观察",
      interpretation: insight.relationship.summary,
      observation: "当回应不够明确时，你可能会用推测填补信息空白。真正需要确认的是事实和双方愿意承担的行动。",
      action: "提出一个具体问题，再观察对方是否愿意持续回应。",
      tone: "coral",
    },
    {
      id: "ziwei-work",
      context: "ziwei",
      prompt: "我的工作节奏更适合稳定推进，还是主动变化？",
      shortLabel: "工作要稳还是变",
      source: "来自身宫领域与阶段重心，仅供自我观察",
      interpretation: `你的稳定区包括：${insight.environment.stableZone.slice(0, 2).join("；")}。变化最好建立在这条主线上，而不是一次推翻所有积累。`,
      observation: `最容易消耗你的情况是：${insight.environment.drainZone[0]}。`,
      action: "保留一个长期主线，只对一个新方向做小范围验证。",
      tone: "sage",
    },
    {
      id: "ziwei-control",
      context: "ziwei",
      prompt: "为什么我总想把事情控制清楚？",
      shortLabel: "为什么需要掌控",
      source: "来自底层气质与行动领域，仅供自我观察",
      interpretation: insight.identity.summary,
      observation: "需要掌控不一定是强势，也可能是你在减少不确定。关键是分清哪些能通过行动改变，哪些只能等待反馈。",
      action: "列出一件能控制的事和一件暂时不追答案的事。",
      tone: "violet",
    },
    {
      id: "ziwei-recovery",
      context: "ziwei",
      prompt: "什么方式最能帮我恢复状态？",
      shortLabel: "怎么恢复状态",
      source: "来自稳定区与消耗区结构，仅供自我观察",
      interpretation: `恢复状态的第一步不是继续加速，而是回到这些稳定条件：${insight.environment.stableZone.join("；")}。`,
      observation: `如果你最近持续处在“${insight.environment.drainZone[0]}”的环境里，疲惫不一定是能力问题。`,
      action: insight.today.action,
      tone: "warm",
    },
  ];
}

export function buildZiweiPosters(insight: NormalizedZiweiInsight): SharePosterData[] {
  return [
    {
      id: "ziwei-identity",
      category: "ziwei",
      eyebrow: "紫微领域 · 当前结论",
      title: "你最近最该守住的是工作主线",
      body: "别急着开新方向，先完成一件能带来反馈的关键任务。关系里先确认回应，状态下降时先回到稳定节奏。",
      tags: ["工作主线", "关系回应", "恢复方式"],
      footer: "依据：命宫、身宫、主星与当前阶段结构",
      tone: "ink",
    },
    {
      id: "ziwei-today",
      category: "ziwei",
      eyebrow: "紫微领域 · 今日关注",
      title: `今天先把“${insight.today.keyword}”放回主线`,
      body: `${insight.today.summary} ${insight.today.action}`,
      tags: ["今日重点", "一个行动", "保留反馈"],
      footer: "阶段提示不是具体事件预测",
      tone: "sage",
    },
  ];
}
