import { buildBaziChart, elementLabels } from "../bazi";
import type { MobileProfile } from "../mobile/types";
import type { ElementKey } from "../types";
import type { CompatibilityDimension, CompatibilitySection } from "./types";

const generates: Record<ElementKey, ElementKey> = { wood: "fire", fire: "earth", earth: "metal", metal: "water", water: "wood" };
const controls: Record<ElementKey, ElementKey> = { wood: "earth", earth: "water", water: "fire", fire: "metal", metal: "wood" };
const relationPairs = [
  { type: "相合", pairs: ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"], effect: 12 },
  { type: "相冲", pairs: ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"], effect: -10 },
  { type: "相害", pairs: ["子未", "丑午", "寅巳", "卯辰", "申亥", "酉戌"], effect: -7 },
  { type: "相破", pairs: ["子酉", "卯午", "辰丑", "未戌", "寅亥", "巳申"], effect: -5 },
];

function chartFor(profile: MobileProfile) {
  return buildBaziChart({
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
}

function branchRelation(left: string, right: string) {
  const pair = `${left}${right}`;
  const reverse = `${right}${left}`;
  return relationPairs.find((item) => item.pairs.includes(pair) || item.pairs.includes(reverse));
}

function elementScore(left: ElementKey, right: ElementKey) {
  if (left === right) return { score: 74, note: `${elementLabels[left]}与${elementLabels[right]}同频，理解方式相近，也要避免彼此固化。` };
  if (generates[left] === right || generates[right] === left) return { score: 80, note: `${elementLabels[left]}与${elementLabels[right]}形成相生关系，更容易出现支持与带动。` };
  if (controls[left] === right || controls[right] === left) return { score: 52, note: `${elementLabels[left]}与${elementLabels[right]}形成制约关系，需要说清边界与决定权。` };
  return { score: 64, note: `${elementLabels[left]}与${elementLabels[right]}连接较间接，更依赖现实互动建立默契。` };
}

export function buildBaziCompatibility(primary: MobileProfile, partner: MobileProfile) {
  const left = chartFor(primary);
  const right = chartFor(partner);
  const dayRelation = branchRelation(left.branches.day, right.branches.day);
  const yearRelation = branchRelation(left.branches.year, right.branches.year);
  const element = elementScore(left.dayMaster.element, right.dayMaster.element);
  const branchBase = 64 + (dayRelation?.effect || 0);
  const dimensions: CompatibilityDimension[] = [
    { id: "attraction", label: "彼此吸引", score: Math.max(30, Math.min(92, branchBase)), summary: dayRelation ? `双方日支呈${dayRelation.type}，靠近时容易形成鲜明感受。` : "双方日支没有明显合冲，吸引力更依赖共同经历和现实选择。", evidence: [`${primary.name}日支${left.branches.day}，${partner.name}日支${right.branches.day}${dayRelation ? `，形成${dayRelation.type}` : ""}`] },
    { id: "emotion", label: "情绪回应", score: element.score, summary: element.note, evidence: [`${primary.name}日主属${left.dayMaster.elementLabel}，${partner.name}日主属${right.dayMaster.elementLabel}`] },
    { id: "communication", label: "沟通理解", score: Math.round((element.score + (yearRelation ? 66 + yearRelation.effect : 64)) / 2), summary: "沟通质量取决于双方能否把感受、事实和请求分开表达。", evidence: [`年支：${left.branches.year}与${right.branches.year}${yearRelation ? `呈${yearRelation.type}` : "无明显合冲"}`] },
    { id: "stability", label: "长期稳定", score: Math.max(36, Math.min(88, 62 + (dayRelation?.effect || 0) + (yearRelation?.effect || 0) / 2)), summary: "稳定度不等于关系结局，主要用来观察承诺、秩序和压力下的惯性。", evidence: [dayRelation ? `日支${dayRelation.type}` : "日支无明显合冲", yearRelation ? `年支${yearRelation.type}` : "年支无明显合冲"] },
    { id: "rhythm", label: "行动节奏", score: element.score >= 70 ? 72 : 58, summary: "节奏相近时容易一起推进；节奏不同则更需要提前约定速度和分工。", evidence: [element.note] },
  ];
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0];
  const needsCare = [...dimensions].sort((a, b) => a.score - b.score)[0];
  const sections: CompatibilitySection[] = [
    { id: "strength", title: "这段关系更容易发挥的部分", conclusion: `${strongest.label}是当前更容易建立默契的部分。`, observation: strongest.summary, action: "把有效的相处方式变成双方都知道的约定。", evidence: strongest.evidence },
    { id: "friction", title: "摩擦更可能从哪里出现", conclusion: `${needsCare.label}需要更多主动确认。`, observation: needsCare.summary, action: "分歧出现时先确认事实和各自需要，再讨论调整方式。", evidence: needsCare.evidence },
    { id: "needs", title: "双方带进关系的核心方式", conclusion: `${primary.name}更常用${left.dayMaster.elementLabel}的方式处理事情，${partner.name}更常用${right.dayMaster.elementLabel}的方式。`, observation: element.note, action: "不要要求对方用和自己完全相同的速度表达在意。", evidence: [`${primary.name}：${left.pillars.day}日柱`, `${partner.name}：${right.pillars.day}日柱`] },
  ];
  const warnings: string[] = [];
  if (!primary.birthTimeKnown) warnings.push(`${primary.name}时辰不确定：不使用时柱、大运等时辰相关信息。`);
  if (!partner.birthTimeKnown) warnings.push(`${partner.name}时辰不确定：不使用时柱、大运等时辰相关信息。`);
  return {
    overallScore: Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length),
    dimensions,
    sections,
    warnings,
    engine: "lunar-javascript",
  };
}
