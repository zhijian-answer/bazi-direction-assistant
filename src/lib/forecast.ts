import { elementLabels } from "./bazi";
import type { BirthProfile, ElementKey, ForecastMonth, YearForecast } from "./types";

const elementCycle: ElementKey[] = ["wood", "fire", "earth", "metal", "water"];

const themes: Record<ElementKey, string> = {
  wood: "生长与修复",
  fire: "表达与显化",
  earth: "稳定与整理",
  metal: "取舍与打磨",
  water: "观察与蓄力",
};

const suitable: Record<ElementKey, string[]> = {
  wood: ["学习新能力", "建立长期计划", "修复沟通", "启动成长型项目"],
  fire: ["表达观点", "展示作品", "主动争取机会", "推进需要热度的事"],
  earth: ["整理资料", "稳定作息", "复盘选择", "处理积压事务"],
  metal: ["做取舍", "定规则", "打磨专业成果", "推进需要判断力的事"],
  water: ["收集信息", "研究趋势", "休息恢复", "为下一步做准备"],
};

const avoid: Record<ElementKey, string[]> = {
  wood: ["目标太散", "只规划不行动", "为迎合别人改变方向"],
  fire: ["情绪化承诺", "冲动公开", "为了证明自己而过度消耗"],
  earth: ["过度保守", "陷在琐事里", "把拖延包装成谨慎"],
  metal: ["过度苛刻", "关系处理太冷", "还没验证就下最终结论"],
  water: ["想太多不行动", "沉迷不确定", "把疲惫误判成失败"],
};

const actions: Record<ElementKey, string> = {
  wood: "把一个长期目标拆成三步，并在本月完成第一步。",
  fire: "选择一个值得被看见的成果，整理后主动展示。",
  earth: "清理一个积压问题，把生活和工作节奏重新稳住。",
  metal: "列出本月最重要的三个取舍，减少无效消耗。",
  water: "先补信息缺口，再决定是否推进，不急着给自己下结论。",
};

function pickFocus(profile: BirthProfile, year: number, month: number) {
  const weak = profile.chart.wuxing.weakest[0];
  const day = profile.chart.dayMaster.element;
  const baseIndex = elementCycle.indexOf(weak || day);
  return elementCycle[(baseIndex + year + month) % elementCycle.length];
}

function buildMonth(profile: BirthProfile, year: number, month: number): ForecastMonth {
  const focusElement = pickFocus(profile, year, month);
  const label = elementLabels[focusElement];

  return {
    month,
    focusElement,
    focusElementLabel: label,
    theme: `${month}月：${themes[focusElement]}`,
    summary: `${year}年${month}月更适合围绕“${label}”的节奏安排选择。重点不是急着证明结果，而是让现实中的下一步更清楚、更可执行。`,
    suitable: suitable[focusElement],
    avoid: avoid[focusElement],
    action: actions[focusElement],
  };
}

export function buildYearForecast(profile: BirthProfile, year = new Date().getFullYear(), month = new Date().getMonth() + 1): YearForecast {
  const months = Array.from({ length: 12 }, (_, index) => buildMonth(profile, year, index + 1));
  const currentMonth = months[Math.min(Math.max(month, 1), 12) - 1];
  const weakLabels = profile.chart.wuxing.weakest.map((item) => elementLabels[item]).join("、") || profile.chart.dayMaster.elementLabel;
  const strongLabels = profile.chart.wuxing.strongest.map((item) => elementLabels[item]).join("、") || profile.chart.dayMaster.elementLabel;

  return {
    profileId: profile.id,
    year,
    generatedAt: new Date().toISOString(),
    title: `${profile.name} 的 ${year} 年度方向`,
    overview: `${year}年适合把“偏强的${strongLabels}”用于稳定产出，同时用计划、环境和习惯温和补足“${weakLabels}”。这份流年/月度方向不做绝对预测，而是帮助你按月安排节奏。`,
    yearlyKeywords: [`日主${profile.chart.dayMaster.stem}${profile.chart.dayMaster.elementLabel}`, `偏强${strongLabels}`, `待补${weakLabels}`, "按月复盘", "小步推进"],
    currentMonth,
    months,
    disclaimers: [
      "流年/月度方向定位为文化娱乐和自我探索参考。",
      "不替代专业决策、医疗、法律、投资或心理咨询建议。",
    ],
  };
}
