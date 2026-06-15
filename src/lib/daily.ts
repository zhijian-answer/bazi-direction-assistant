import { elementLabels } from "./bazi";
import type { BirthProfile, DailyGuidance, ElementKey } from "./types";

const elementCycle: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

const suitableByElement: Record<ElementKey, string[]> = {
  wood: ["学习新内容", "梳理长期目标", "修复沟通", "做成长型计划"],
  fire: ["表达想法", "发布作品", "主动沟通", "争取曝光机会"],
  earth: ["整理资料", "复盘近期选择", "建立日程秩序", "处理积压事务"],
  metal: ["做清晰取舍", "制定规则", "打磨专业能力", "推进需要判断力的事"],
  water: ["收集信息", "安静观察", "休息恢复", "研究下一步路径"],
};

const avoidByElement: Record<ElementKey, string[]> = {
  wood: ["同时开太多新坑", "只规划不落地", "为了迎合别人改变方向"],
  fire: ["情绪化表达", "冲动公开承诺", "为了证明自己而硬撑"],
  earth: ["过度保守", "陷在琐事里不行动", "把拖延包装成谨慎"],
  metal: ["过度苛刻", "把关系处理得太冷", "还没验证就做最终判断"],
  water: ["想太多但不行动", "沉迷不确定性", "把疲惫误判成失败"],
};

const themes: Record<ElementKey, string> = {
  wood: "先成长，再决定",
  fire: "把想法说清楚",
  earth: "把节奏稳下来",
  metal: "做一次清晰取舍",
  water: "先观察，再出手",
};

function dayOfYear(date: Date) {
  const start = new Date(date.getFullYear(), 0, 0);
  return Math.floor((date.getTime() - start.getTime()) / 86_400_000);
}

export function buildDailyGuidance(profile: BirthProfile, date = new Date()): DailyGuidance {
  const weakest = profile.chart.wuxing.weakest[0];
  const dayIndex = dayOfYear(date);
  const focusElement = weakest || elementCycle[dayIndex % elementCycle.length];
  const supportElement = elementCycle[(elementCycle.indexOf(focusElement) + dayIndex) % elementCycle.length];
  const todayElement = dayIndex % 2 === 0 ? focusElement : supportElement;
  const label = elementLabels[todayElement];

  return {
    profileId: profile.id,
    date: date.toISOString().slice(0, 10),
    focusElement: todayElement,
    focusElementLabel: label,
    theme: themes[todayElement],
    summary: `今天更适合围绕“${label}”的节奏来行动：不追求一次解决所有问题，先把最能推进现实的一步做出来。`,
    suitable: suitableByElement[todayElement],
    avoid: avoidByElement[todayElement],
    actionSteps: [
      "先写下今天最重要的一个问题",
      "把它拆成 30 分钟内能完成的小动作",
      "晚上复盘一次：哪些信息更清楚了，哪些选择可以暂缓",
    ],
  };
}
