import { elementLabels } from "./bazi";
import type { ActionCard, BirthProfile, ElementKey } from "./types";

const groundingByElement: Record<ElementKey, string[]> = {
  wood: ["把脑子里最乱的事写成一句话", "给这件事起一个名字", "只保留今天能处理的一小段"],
  fire: ["先放慢语速和呼吸", "把想说的话写下来，不急着发出去", "等情绪降一点再决定是否表达"],
  earth: ["整理桌面或身边一个小区域", "喝水、吃点东西或站起来走两分钟", "先把身体安顿好，再处理问题"],
  metal: ["写下现在能控制和不能控制的事", "只选一个最小决策", "把其他决定延后到明天"],
  water: ["闭眼休息三分钟", "写下你已经知道的信息", "先不追问答案，只补一个信息缺口"],
};

const actionsByElement: Record<ElementKey, string[]> = {
  wood: ["发一条低压力的信息，修复一个小沟通", "读 10 分钟和目标有关的内容", "把长期目标拆成三行"],
  fire: ["整理一个可以展示的小成果", "和一个可信的人说清楚真实感受", "完成一件能让自己重新有热度的小事"],
  earth: ["完成一个 15 分钟内能收尾的任务", "把明天要做的三件事写出来", "清掉一个积压消息或文件"],
  metal: ["删掉一个不必要的待办", "给一个反复纠结的问题设定判断标准", "把今天最重要的一件事排到最前"],
  water: ["查一个关键资料", "暂停刷信息 20 分钟", "睡前写下明天先做哪一步"],
};

const avoidByElement: Record<ElementKey, string[]> = {
  wood: ["同时开启太多新计划", "为了讨好别人立刻改变决定", "只幻想不落地"],
  fire: ["带着情绪立刻摊牌", "公开承诺自己还没想清楚的事", "用硬撑证明自己没事"],
  earth: ["把谨慎变成拖延", "陷在琐事里逃避核心问题", "用自责替代行动"],
  metal: ["对自己过度苛刻", "在疲惫时做最终决定", "把关系处理得太冷"],
  water: ["反复搜索让自己更焦虑的信息", "把暂时低能量当成失败", "一直想但完全不动"],
};

function pickFocus(profile: BirthProfile) {
  return profile.chart.wuxing.weakest[0] || profile.chart.dayMaster.element;
}

export function buildActionCard(profile: BirthProfile, date = new Date()): ActionCard {
  const focusElement = pickFocus(profile);
  const label = elementLabels[focusElement];

  return {
    profileId: profile.id,
    date: date.toISOString().slice(0, 10),
    title: "低谷行动卡",
    focusElement,
    focusElementLabel: label,
    supportNote: `今天先不用急着把所有问题都解决。围绕“${label}”的节奏，先做一件能让现实变清楚的小事。`,
    groundingSteps: groundingByElement[focusElement],
    tinyActions: actionsByElement[focusElement],
    avoid: avoidByElement[focusElement],
    reflectionPrompts: [
      "现在最让我卡住的，是信息不够、体力不够，还是选择太多？",
      "如果只允许我做 15 分钟，我可以先做哪一步？",
      "这件事可以暂缓到明天再决定吗？",
    ],
    disclaimer: "如果你正处在强烈危机、伤害自己或伤害他人的风险中，请立刻联系身边可信任的人或当地紧急求助渠道。本卡片只提供文化娱乐和自我整理参考。",
  };
}
