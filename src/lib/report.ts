import { elementLabels, getElementAdvice } from "./bazi";
import type { BirthProfile, BirthReport, ElementKey } from "./types";

const elementStrengthTone: Record<ElementKey, string> = {
  wood: "木气代表成长、学习和关系修复。能量明显时，适合把想法落实成长期计划。",
  fire: "火气代表表达、热情和被看见。能量明显时，适合主动沟通、展示作品和争取机会。",
  earth: "土气代表稳定、承接和秩序。能量明显时，适合整理资源、做复盘和处理积压事务。",
  metal: "金气代表判断、规则和专业。能量明显时，适合做取舍、定标准和打磨能力。",
  water: "水气代表观察、信息和恢复。能量明显时，适合收集资料、安静思考和保存体力。",
};

const elementSupportAction: Record<ElementKey, string[]> = {
  wood: ["给自己安排一个可持续学习计划", "主动修复一个长期被搁置的沟通", "把模糊目标写成三个月计划"],
  fire: ["把一个想法公开说清楚", "整理作品或成果并争取展示机会", "用温和直接的方式表达真实需求"],
  earth: ["清理积压任务并建立固定日程", "复盘最近一个选择的得失", "先稳住生活节奏再做大决定"],
  metal: ["列出取舍标准并减少消耗项", "打磨一个专业技能或交付物", "把边界和规则说清楚"],
  water: ["先收集信息再判断", "安排一次高质量休息", "把担心的问题写下来逐一验证"],
};

const dayMasterStyle: Record<ElementKey, string> = {
  wood: "更适合在成长中找到答案。越是迷茫，越需要把问题拆成学习、沟通和长期积累，而不是急着一次定终局。",
  fire: "更适合通过表达和行动建立信心。重要的是让热情有节奏，避免为了证明自己而过度消耗。",
  earth: "更适合先稳住秩序再扩张。把生活、工作和情绪的基本盘整理好，方向感会更容易回来。",
  metal: "更适合用清晰标准做选择。真正重要的是减少犹豫和反复，把精力放到少数关键事情上。",
  water: "更适合先观察和理解全局。不要把暂时慢下来当成失败，信息足够后再行动会更稳。",
};

function labelElements(elements: ElementKey[]) {
  return elements.map((item) => elementLabels[item]).join("、") || "不明显";
}

function buildBalanceText(profile: BirthProfile) {
  const { strongest, weakest } = profile.chart.wuxing;
  return `当前五行里，偏明显的是 ${labelElements(strongest)}，相对需要补足的是 ${labelElements(weakest)}。这不是好坏判断，更适合作为行动节奏的参考：把优势用于推进现实，把不足用环境、习惯和计划慢慢补齐。`;
}

function buildHighlights(profile: BirthProfile) {
  const { chart } = profile;
  const strongest = labelElements(chart.wuxing.strongest);
  const weakest = labelElements(chart.wuxing.weakest);

  return [
    `日主为 ${chart.dayMaster.stem}${chart.dayMaster.elementLabel}，适合先理解自己的行动方式，再做现实选择。`,
    `五行偏明显：${strongest}；待补方向：${weakest}。`,
    `四柱为 ${chart.pillars.year}、${chart.pillars.month}、${chart.pillars.day}、${chart.pillars.time}，报告会围绕长期节奏和可执行行动展开。`,
  ];
}

export function buildBirthReport(profile: BirthProfile): BirthReport {
  const dayElement = profile.chart.dayMaster.element;
  const strongest = profile.chart.wuxing.strongest;
  const weakest = profile.chart.wuxing.weakest;
  const strongestPrimary = strongest[0] || dayElement;
  const weakestPrimary = weakest[0] || dayElement;

  const sections = [
    {
      id: "self",
      title: "自我底色",
      body: dayMasterStyle[dayElement],
      bullets: [
        `日主：${profile.chart.dayMaster.stem}${profile.chart.dayMaster.elementLabel}`,
        `适合关注：${getElementAdvice(dayElement)}`,
        "判断方向时，先看这件事是否能带来长期积累，而不是只看短期情绪。",
      ],
    },
    {
      id: "wuxing",
      title: "五行能量",
      body: buildBalanceText(profile),
      bullets: [
        `偏强：${labelElements(strongest)}`,
        `待补：${labelElements(weakest)}`,
        ...elementSupportAction[weakestPrimary].slice(0, 2),
      ],
    },
    {
      id: "career",
      title: "事业与学习",
      body: "事业方向上，优先选择能沉淀能力、作品、信用和长期关系的路径。不要只追求短期兴奋感，也不要因为暂时看不到结果就频繁推翻自己。",
      bullets: [
        `可借用${elementLabels[strongestPrimary]}的优势：${elementStrengthTone[strongestPrimary]}`,
        "把目标拆成一周能验证的小动作。",
        "适合建立可复盘的作品、案例、简历或学习记录。",
      ],
    },
    {
      id: "relationship",
      title: "关系与沟通",
      body: "关系问题不适合只靠猜测。先表达事实和感受，再谈请求和边界。真正重要的关系，既需要温度，也需要稳定的沟通节奏。",
      bullets: [
        "遇到误会时，先确认事实，少做情绪化推断。",
        "不确定是否主动时，可以先发一个低压力的关心或确认。",
        "把边界说清楚，比长期忍耐后爆发更有建设性。",
      ],
    },
    {
      id: "rhythm",
      title: "近期行动节奏",
      body: "当人迷茫时，最需要的不是立刻得到终极答案，而是恢复可行动感。先做能让现实变清楚的小事，再逐步扩大选择。",
      bullets: [
        "今天只选一个最重要的问题处理。",
        "把它拆成 30 分钟内能完成的行动。",
        "晚上复盘一次：哪些信息更清楚，哪些决定可以暂缓。",
      ],
    },
  ];

  return {
    profileId: profile.id,
    generatedAt: new Date().toISOString(),
    title: `${profile.name} 的命盘方向报告`,
    summary: `这份报告基于四柱八字生成，重点不是断定命运，而是帮助你理解自己的行动节奏、优势能量和近期可以落地的选择。`,
    highlights: buildHighlights(profile),
    wuxing: {
      strongest,
      weakest,
      balanceText: buildBalanceText(profile),
      suggestions: [...new Set([...elementSupportAction[weakestPrimary], ...elementSupportAction[dayElement]])].slice(0, 5),
    },
    sections,
    actionPlan: [
      "写下当前最困扰你的一个问题，不同时处理太多方向。",
      "把问题拆成信息、选择、行动三类，先补信息缺口。",
      "选一个 30 分钟能完成的小动作，今天就做。",
      "连续三天记录行动后的变化，再决定是否加大投入。",
    ],
    disclaimers: [
      "本报告定位为文化娱乐、自我探索和行动参考。",
      "不替代医疗、法律、投资、心理咨询或职业咨询等专业建议。",
    ],
  };
}
