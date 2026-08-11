import type { NarrativeCard, NarrativeContext } from "./contracts";

const forbiddenPhrases = [
  "结构化观察",
  "当前阶段",
  "行动建议",
  "环境适配",
  "反应路径",
  "建立结构关系",
  "转换成容易理解的内容",
  "工作主线",
  "领域分布",
  "稳定推进",
  "专注主线",
  "人生课题",
  "命运密码",
  "深度赋能",
  "全维度",
  "准确率",
  "命中率",
  "注定",
  "必然会",
  "一定会",
  "大师",
  "AI 分析",
];

export function inspectNarrativeCard(card: NarrativeCard) {
  const issues: string[] = [];
  const joined = [card.hook, card.scene, card.misunderstanding, card.action, card.nextQuestion]
    .filter(Boolean)
    .join("\n");

  for (const phrase of forbiddenPhrases) {
    if (joined.includes(phrase)) issues.push(`包含模板化或不允许的表达：${phrase}`);
  }
  if ((joined.match(/你不是/g) || []).length > 1) issues.push("重复使用“你不是……”句式");
  if (!/[？?]$/.test(card.nextQuestion)) issues.push("继续探索问题应以问号结束");
  if (card.hook.includes("依据") || card.hook.includes("日主为") || card.hook.includes("命宫为")) {
    issues.push("首句被专业依据占据");
  }
  if (card.scene === card.hook || card.action === card.hook) issues.push("标题、场景和动作存在重复");
  return issues;
}

const contextLeakage: Partial<Record<NarrativeContext, RegExp>> = {
  bazi: /(太阳星座|月亮星座|上升星座|本命星盘|紫微十二宫|命宫星曜)/,
  zodiac: /(日主|十神|四柱八字|紫微十二宫|命宫星曜)/,
  ziwei: /(日主|十神|四柱八字|太阳星座|月亮星座|上升星座)/,
};

export function inspectNarrativeContext(card: NarrativeCard, context: NarrativeContext) {
  const joined = [card.hook, card.scene, card.misunderstanding, card.action, card.nextQuestion]
    .filter(Boolean)
    .join("\n");
  const issues: string[] = [];
  if (contextLeakage[context]?.test(joined)) issues.push("文案混入了当前页面之外的命理体系");
  if (context === "flow" && /(天生|一生|这辈子|终身)/.test(joined)) {
    issues.push("近期节奏被写成了长期人格或人生定论");
  }
  return issues;
}

export function normalizeNarrativeCard(card: NarrativeCard): NarrativeCard {
  const nextQuestion = card.nextQuestion.replace(/[。！!]+$/, "");
  return {
    hook: card.hook.trim(),
    scene: card.scene.trim(),
    misunderstanding: card.misunderstanding?.trim() || undefined,
    evidenceSummary: card.evidenceSummary.trim(),
    action: card.action.trim(),
    nextQuestion: /[？?]$/.test(nextQuestion) ? nextQuestion : `${nextQuestion}？`,
  };
}
