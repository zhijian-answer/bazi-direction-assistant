import { Solar } from "lunar-javascript";
import { buildBaziChart } from "../bazi";
import type { ElementKey } from "../types";
import type { MobileProfile, QuestionInsightData, SharePosterData } from "./types";

const stemElement: Record<string, ElementKey> = {
  甲: "wood", 乙: "wood", 丙: "fire", 丁: "fire", 戊: "earth",
  己: "earth", 庚: "metal", 辛: "metal", 壬: "water", 癸: "water",
};
const generates: Record<ElementKey, ElementKey> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
const controls: Record<ElementKey, ElementKey> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };
const weekdays = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const monthNames = ["一月", "二月", "三月", "四月", "五月", "六月", "七月", "八月", "九月", "十月", "十一月", "十二月"];

type FlowStyle = {
  key: "same" | "support" | "output" | "manage" | "pressure";
  theme: string;
  title: string;
  note: string;
  suitable: string;
  caution: string;
};

function styleFor(dayElement: ElementKey, flowStem: string): FlowStyle {
  const flowElement = stemElement[flowStem] || dayElement;
  if (flowElement === dayElement) return { key: "same", theme: "同频 · 收拢", title: "熟悉的节奏回来了，适合把一件事做完整", note: "今天不是没有力气，而是容易同时照顾太多方向。把注意力收回来，完成一个结果，比继续开新头更重要。", suitable: "收尾、复盘、兑现承诺", caution: "同时开启太多相似任务" };
  if (generates[flowElement] === dayElement) return { key: "support", theme: "承接 · 借力", title: "有人愿意搭把手，别急着什么都自己扛", note: "信息、协作或一句及时的提醒，都可能补上你卡住的地方。接住帮助以后，再决定怎么走，会比一个人反复琢磨更省力。", suitable: "请教、协作、整理资源", caution: "只准备却迟迟不行动" };
  if (generates[dayElement] === flowElement) return { key: "output", theme: "表达 · 落地", title: "想说的话变多了，先说最重要的那一句", note: "沟通和行动的冲动会更明显。先把最想表达的内容说清楚，再做出一个看得见的结果，别让热情散在太多开头里。", suitable: "沟通、展示、交付结果", caution: "把精力平均分给所有机会" };
  if (controls[dayElement] === flowElement) return { key: "manage", theme: "取舍 · 留白", title: "今天更重要的是取舍，不是继续加码", note: "时间、钱和注意力都有限。先看什么值得留下，再决定要不要投入更多，会比跟着短期热度走更稳。", suitable: "排期、预算、说清责任", caution: "因为舍不得投入而继续加码" };
  return { key: "pressure", theme: "减压 · 缓一缓", title: "外面的要求有点多，先别把每件事都接住", note: "压力不代表事情会变坏，但人在绷紧的时候更容易仓促答应。先减掉一件不必今天处理的事，答案会清楚很多。", suitable: "守住底线、减少并行、补齐信息", caution: "信息不够时仓促承诺" };
}

function flowGanZhi(at: Date) {
  const eightChar = Solar.fromYmdHms(at.getFullYear(), at.getMonth() + 1, at.getDate(), at.getHours(), at.getMinutes(), at.getSeconds()).getLunar().getEightChar();
  return { year: eightChar.getYear(), month: eightChar.getMonth(), day: eightChar.getDay() };
}

function shiftedMonth(at: Date, offset: number) {
  return new Date(at.getFullYear(), at.getMonth() + offset, Math.min(at.getDate(), 28), 12, 0, 0);
}

function noteForMonth(style: FlowStyle, offset: number) {
  const firstStep = style.suitable.split("、")[0];
  if (offset < 0) return `回看上个月，重点是把已经开始的事情收住。如果仍有没处理完的部分，可以先从${firstStep}开始补齐。`;
  if (offset === 0) return style.note;
  if (offset === 1) return `下个月更适合把注意力放在${firstStep}。先做出一个看得见的结果，再决定要不要扩大投入。`;
  return `再往后看，节奏会从准备转向落实。保留必要的余地，也别让“${style.caution}”拖慢真正重要的事。`;
}

export function buildMobileFlowReport(profile: MobileProfile, at = new Date()) {
  const chart = buildBaziChart({
    calendarType: profile.calendarType,
    birthDate: profile.birthDate,
    birthTime: profile.birthTime || "12:00",
    timeUnknown: !profile.birthTimeKnown,
    isLeapMonth: profile.isLeapMonth,
    gender: profile.gender,
    birthPlace: profile.birthPlace,
    latitude: profile.latitude,
    longitude: profile.longitude,
    timezone: profile.timezone,
  });
  const dayElement = chart.dayMaster.element;
  const current = flowGanZhi(at);
  const currentStyle = styleFor(dayElement, current.month.slice(0, 1));
  const dailyStyle = styleFor(dayElement, current.day.slice(0, 1));
  const annualStyle = styleFor(dayElement, current.year.slice(0, 1));
  const currentLuck = chart.luckCycles?.find((item) => at.getFullYear() >= item.startYear && at.getFullYear() <= item.endYear);
  const months = [-1, 0, 1, 2].map((offset) => {
    const date = shiftedMonth(at, offset);
    const ganZhi = flowGanZhi(date).month;
    const style = styleFor(dayElement, ganZhi.slice(0, 1));
    return {
      month: monthNames[date.getMonth()],
      stem: ganZhi,
      theme: style.theme,
      note: noteForMonth(style, offset),
      isCurrent: offset === 0,
    };
  });
  const dateLabel = `${at.getMonth() + 1}月${at.getDate()}日 ${weekdays[at.getDay()]} · 今日流盘`;
  const title = currentStyle.title;
  const summary = `这个月进入${current.month}，更适合围绕“${currentStyle.theme.replace(" · ", "和")}”安排轻重缓急。先看哪些事值得推进，哪些可以暂缓；这不是对具体事件的预测。`;
  const poster: SharePosterData = {
    id: `flow-${at.getFullYear()}-${at.getMonth() + 1}`,
    category: "daily",
    eyebrow: `${at.getFullYear()} 年阶段观察`,
    title,
    body: `${currentStyle.note}今天先完成一件能产生反馈的关键任务。`,
    tags: [current.month, currentStyle.theme, `本命${chart.pillars.day}`],
    footer: "玄枢 · 近期节奏",
    tone: "warm",
  };
  const question: QuestionInsightData = {
    id: `flow-action-${at.getFullYear()}-${at.getMonth() + 1}`,
    context: "bazi",
    prompt: "这个阶段更适合主动，还是先稳住？",
    shortLabel: "主动还是稳住",
    source: `来自本命${chart.pillars.day}、${current.year}流年与${current.month}流月的结构关系`,
    interpretation: `${annualStyle.title}；进入当前月份后，${currentStyle.title}。`,
    observation: summary,
    action: `本周先做一件“${currentStyle.suitable.split("、")[0]}”相关的小事，同时减少${currentStyle.caution}。`,
    tone: "warm",
  };

  return {
    dateLabel,
    periodLabel: `${at.getFullYear()} 年 ${at.getMonth() + 1} 月`,
    title,
    summary,
    columns: [
      { label: "本命", value: chart.pillars.day, note: `${chart.dayMaster.elementLabel}日主` },
      { label: "大运", value: currentLuck?.ganZhi || "待确认", note: currentLuck ? `${currentLuck.startAge}–${currentLuck.endAge} 岁` : "阶段资料" },
      { label: "流年", value: current.year, note: String(at.getFullYear()) },
      { label: "流月", value: current.month, note: `${at.getMonth() + 1} 月` },
    ],
    focus: {
      eyebrow: `当前流月 · ${current.month}`,
      title: currentStyle.title,
      note: currentStyle.note,
      suitable: currentStyle.suitable,
      caution: currentStyle.caution,
    },
    daily: {
      key: dailyStyle.key,
      ganZhi: current.day,
      theme: dailyStyle.theme,
      title: dailyStyle.title,
      note: dailyStyle.note,
      suitable: dailyStyle.suitable,
      caution: dailyStyle.caution,
    },
    months,
    poster,
    question,
    evidence: {
      dayPillar: chart.pillars.day,
      annual: current.year,
      monthly: current.month,
      daily: current.day,
      generatedAt: at.toISOString(),
      calculationScope: chart.engine?.calculationScope || (profile.birthTimeKnown ? "four-pillar" : "three-pillar"),
      warnings: chart.engine?.uncertainties || [],
    },
    engineVersion: "lunar-javascript-stage-v2",
  };
}

export type MobileFlowReport = ReturnType<typeof buildMobileFlowReport>;
