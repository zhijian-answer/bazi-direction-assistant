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
      prompt: "最近，我最该把力气放在哪里？",
      shortLabel: "力气该放哪里",
      source: "结合命宫、身宫与近期运限，只提供一个观察角度",
      interpretation: insight.stage.summary,
      observation: `今天更值得留意“${insight.today.keyword}”。如果同一件事最近反复出现，它可能比临时冒出来的新任务更需要先处理。`,
      action: insight.today.action,
      tone: "ink",
    },
    {
      id: "ziwei-relationship",
      context: "ziwei",
      prompt: "为什么关系一含糊，我就容易反复想？",
      shortLabel: "为什么反复想",
      source: "结合关系宫位与四化，只提供一个观察角度",
      interpretation: insight.relationship.summary,
      observation: "当回应不够明确时，你可能会用推测填补信息空白。真正需要确认的是事实和双方愿意承担的行动。",
      action: "把猜测换成一个具体问题，再看对方愿不愿意持续回应。",
      tone: "coral",
    },
    {
      id: "ziwei-work",
      context: "ziwei",
      prompt: "这份工作该继续稳着，还是试试新的方向？",
      shortLabel: "工作要稳还是变",
      source: "结合身宫落点与近期运限，只提供一个观察角度",
      interpretation: `在“${insight.environment.stableZone.slice(0, 2).join("；")}”这样的条件里，你更容易发挥。想变化时，先留住已经有效的部分，不必一次推翻全部积累。`,
      observation: `最容易消耗你的情况是：${insight.environment.drainZone[0]}。`,
      action: "先保留一件已经做出反馈的事，再给新方向一次小范围尝试。",
      tone: "sage",
    },
    {
      id: "ziwei-control",
      context: "ziwei",
      prompt: "我是真的需要掌控，还是只是怕事情悬着？",
      shortLabel: "为什么怕悬着",
      source: "结合命宫气质与行动宫位，只提供一个观察角度",
      interpretation: insight.identity.summary,
      observation: "想把事情弄清楚不一定是强势，也可能是你很难忍受没有着落。真正需要分清的，是哪些能靠行动改变，哪些只能等待对方回应。",
      action: "写下一件今天能处理的事，也允许另一件暂时没有答案。",
      tone: "violet",
    },
    {
      id: "ziwei-recovery",
      context: "ziwei",
      prompt: "最近这么累，我该先停掉什么？",
      shortLabel: "先停掉什么",
      source: "结合稳定条件与消耗来源，只提供一个观察角度",
      interpretation: `很多时候不是做得不够，而是一直没有离开消耗你的环境。先回到这些让你舒服的条件：${insight.environment.stableZone.join("；")}。`,
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
      eyebrow: "紫微斗数 · 最近的你",
      title: insight.identity.title,
      body: insight.identity.summary,
      tags: insight.identity.tags.slice(0, 3),
      footer: "依据：命宫、身宫、主星与近期运限",
      tone: "ink",
    },
    {
      id: "ziwei-today",
      category: "ziwei",
      eyebrow: "紫微斗数 · 今天先看这里",
      title: `今天先照顾好“${insight.today.keyword}”这件事`,
      body: `${insight.today.summary} ${insight.today.action}`,
      tags: ["今天的重点", "能做的一步", "留意现实反馈"],
      footer: "近期提示不等于具体事件预测",
      tone: "sage",
    },
  ];
}
