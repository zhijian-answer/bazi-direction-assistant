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
  if (flowElement === dayElement) return { key: "same", theme: "同频 · 守主线", title: "同频力量变强，更适合把主线做完整", note: "熟悉的做事方式更容易被调用，关键是把力量集中到一个能完成的结果。", suitable: "推进主线、复盘方法、完成承诺", caution: "同时开启太多相似任务" };
  if (generates[flowElement] === dayElement) return { key: "support", theme: "承接 · 用支持", title: "外部支持更明显，先接住已有资源", note: "当前结构更容易获得信息、协作或恢复空间，适合把已有支持转成实际进展。", suitable: "学习、协作、整理资源", caution: "只准备而迟迟不行动" };
  if (generates[dayElement] === flowElement) return { key: "output", theme: "表达 · 看结果", title: "表达与输出增加，也要守住完成边界", note: "想推进、沟通和展示的事情会变多。先定义完成标准，能减少只开头不收尾。", suitable: "沟通、展示、交付阶段成果", caution: "把精力平均分给所有机会" };
  if (controls[dayElement] === flowElement) return { key: "manage", theme: "取舍 · 定边界", title: "取舍任务比继续加码更重要", note: "当前更适合管理资源、确认优先级，把时间留给真正能形成回报的事情。", suitable: "预算、排期、谈清责任", caution: "因为短期热度追加投入" };
  return { key: "pressure", theme: "减压 · 留余地", title: "外部要求变多，先降低并行任务", note: "压力并不等于结果不好，但更需要留出确认、恢复和复盘空间。", suitable: "守住底线、减少并行、补足信息", caution: "在信息不足时仓促承诺" };
}

function flowGanZhi(at: Date) {
  const eightChar = Solar.fromYmdHms(at.getFullYear(), at.getMonth() + 1, at.getDate(), at.getHours(), at.getMinutes(), at.getSeconds()).getLunar().getEightChar();
  return { year: eightChar.getYear(), month: eightChar.getMonth(), day: eightChar.getDay() };
}

function shiftedMonth(at: Date, offset: number) {
  return new Date(at.getFullYear(), at.getMonth() + offset, Math.min(at.getDate(), 28), 12, 0, 0);
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
      note: style.note,
      isCurrent: offset === 0,
    };
  });
  const dateLabel = `${at.getMonth() + 1}月${at.getDate()}日 ${weekdays[at.getDay()]} · 今日流盘`;
  const title = currentStyle.title;
  const summary = `当前流月为${current.month}，${currentStyle.note}流盘描述的是时间结构与本命方式的关系，不保证具体事件。`;
  const poster: SharePosterData = {
    id: `flow-${at.getFullYear()}-${at.getMonth() + 1}`,
    category: "daily",
    eyebrow: `${at.getFullYear()} 年阶段观察`,
    title,
    body: `${currentStyle.note}今天先完成一件能产生反馈的关键任务。`,
    tags: [current.month, currentStyle.theme, `本命${chart.pillars.day}`],
    footer: "玄枢 · 流盘结构观察",
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
