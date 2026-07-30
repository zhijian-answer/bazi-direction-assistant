import { buildProfileZodiacChart } from "../astrology/profileChart";
import type { MobileProfile } from "../mobile/types";
import { bodyLabels, signName } from "../zodiac/contentCatalog";
import type { ZodiacBodyKey, ZodiacPlacement } from "../zodiac/types";
import type { CompatibilityDimension, CompatibilitySection } from "./types";

type CrossAspect = {
  left: ZodiacBodyKey;
  right: ZodiacBodyKey;
  type: "conjunction" | "sextile" | "square" | "trine" | "opposition";
  orb: number;
};

const aspectAngles: Array<{ type: CrossAspect["type"]; angle: number; orb: number }> = [
  { type: "conjunction", angle: 0, orb: 8 },
  { type: "sextile", angle: 60, orb: 5 },
  { type: "square", angle: 90, orb: 6 },
  { type: "trine", angle: 120, orb: 6 },
  { type: "opposition", angle: 180, orb: 8 },
];

const aspectLabels: Record<CrossAspect["type"], string> = {
  conjunction: "合相",
  sextile: "六合相",
  square: "刑相",
  trine: "拱相",
  opposition: "冲相",
};

const supportive = new Set<CrossAspect["type"]>(["conjunction", "sextile", "trine"]);
const dimensionLabels: Record<CompatibilityDimension["id"], string> = {
  attraction: "彼此吸引",
  emotion: "情绪回应",
  communication: "沟通理解",
  stability: "长期稳定",
  rhythm: "行动节奏",
};

const dimensionPairs: Record<CompatibilityDimension["id"], Array<[ZodiacBodyKey, ZodiacBodyKey]>> = {
  attraction: [["sun", "venus"], ["venus", "sun"], ["venus", "mars"], ["mars", "venus"]],
  emotion: [["moon", "moon"], ["moon", "sun"], ["sun", "moon"], ["moon", "venus"]],
  communication: [["mercury", "mercury"], ["mercury", "moon"], ["moon", "mercury"], ["mercury", "sun"]],
  stability: [["saturn", "sun"], ["sun", "saturn"], ["saturn", "moon"], ["moon", "saturn"], ["saturn", "venus"]],
  rhythm: [["mars", "mars"], ["sun", "mars"], ["mars", "sun"], ["jupiter", "mars"]],
};

function angularDistance(left: number, right: number) {
  const raw = Math.abs(left - right) % 360;
  return Math.min(raw, 360 - raw);
}

function findAspect(left: ZodiacPlacement, right: ZodiacPlacement): CrossAspect | null {
  const distance = angularDistance(left.degree, right.degree);
  const match = aspectAngles
    .map((candidate) => ({ ...candidate, difference: Math.abs(distance - candidate.angle) }))
    .filter((candidate) => candidate.difference <= candidate.orb)
    .sort((a, b) => a.difference - b.difference)[0];
  return match ? { left: left.body, right: right.body, type: match.type, orb: Number(match.difference.toFixed(2)) } : null;
}

function explainAspect(aspect: CrossAspect, leftName: string, rightName: string) {
  return `${leftName}的${bodyLabels[aspect.left]}与${rightName}的${bodyLabels[aspect.right]}形成${aspectLabels[aspect.type]}（容许度 ${aspect.orb.toFixed(1)}°）`;
}

function scoreAspects(aspects: CrossAspect[]) {
  if (!aspects.length) return 58;
  const total = aspects.reduce((score, aspect) => {
    const closeness = Math.max(0, 1 - aspect.orb / 8);
    const direction = supportive.has(aspect.type) ? 1 : -1;
    return score + direction * (8 + closeness * 8);
  }, 62);
  return Math.max(28, Math.min(92, Math.round(total / Math.max(1, aspects.length * 0.42))));
}

function dimensionSummary(id: CompatibilityDimension["id"], score: number) {
  const tone = score >= 72 ? "这部分比较容易自然接上" : score >= 56 ? "这部分既有连接，也需要主动翻译彼此" : "这部分差异较明显，靠猜测容易增加误会";
  const actions: Record<CompatibilityDimension["id"], string> = {
    attraction: "吸引力适合用真实相处验证，不把强烈感受直接等同于长期适配。",
    emotion: "情绪起来时先确认对方需要陪伴、空间，还是一个明确答案。",
    communication: "把事实、感受和请求分开说，减少用自己的方式代替对方理解。",
    stability: "提前说清承诺、边界和现实安排，比临时猜测更能建立稳定感。",
    rhythm: "重要事情先约定速度和分工，避免一个人催、另一个人被动退开。",
  };
  return `${tone}。${actions[id]}`;
}

export function buildAstrologyCompatibility(primary: MobileProfile, partner: MobileProfile) {
  const left = buildProfileZodiacChart(primary);
  const right = buildProfileZodiacChart(partner);
  const dimensions = (Object.keys(dimensionPairs) as CompatibilityDimension["id"][]).map((id) => {
    const aspects = dimensionPairs[id]
      .map(([leftBody, rightBody]) => findAspect(left.chart.placements[leftBody], right.chart.placements[rightBody]))
      .filter(Boolean) as CrossAspect[];
    const score = scoreAspects(aspects);
    return {
      id,
      label: dimensionLabels[id],
      score,
      summary: dimensionSummary(id, score),
      evidence: aspects.slice(0, 4).map((aspect) => explainAspect(aspect, primary.name, partner.name)),
    } satisfies CompatibilityDimension;
  });
  const strongest = [...dimensions].sort((a, b) => b.score - a.score)[0];
  const needsCare = [...dimensions].sort((a, b) => a.score - b.score)[0];
  const overallScore = Math.round(dimensions.reduce((sum, item) => sum + item.score, 0) / dimensions.length);
  const sections: CompatibilitySection[] = [
    {
      id: "connection",
      title: "关系里最容易形成连接的地方",
      conclusion: `${strongest.label}是两人当前更容易自然接上的部分。`,
      observation: strongest.summary,
      action: "把已经有效的相处方式说出来，并继续用现实行动确认。",
      evidence: strongest.evidence,
    },
    {
      id: "friction",
      title: "最需要主动翻译彼此的地方",
      conclusion: `${needsCare.label}存在更明显的节奏差异。`,
      observation: needsCare.summary,
      action: "发生分歧时先描述正在发生什么，再讨论谁对谁错。",
      evidence: needsCare.evidence,
    },
    {
      id: "natal-context",
      title: "两个人带进关系的基础配置",
      conclusion: `${primary.name}太阳${signName(left.chart.placements.sun.sign)}，${partner.name}太阳${signName(right.chart.placements.sun.sign)}。`,
      observation: "太阳配置只说明主动追求的生活方式；关系还要结合月亮、金星、火星、土星和真实经历。",
      action: "用这份结构提出问题，不用它替代现实沟通。",
      evidence: [`${primary.name}：太阳${signName(left.chart.placements.sun.sign)}、月亮${signName(left.chart.placements.moon.sign)}`, `${partner.name}：太阳${signName(right.chart.placements.sun.sign)}、月亮${signName(right.chart.placements.moon.sign)}`],
    },
  ];
  return {
    overallScore,
    dimensions,
    sections,
    warnings: [...left.warnings.map((item) => `${primary.name}：${item}`), ...right.warnings.map((item) => `${partner.name}：${item}`)],
    engine: `${left.source.engine} ${left.source.engineVersion}`,
  };
}
