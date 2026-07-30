import type { NarrativeCard } from "./contracts";

const forbiddenPhrases = [
  "结构化观察",
  "当前阶段",
  "行动建议",
  "环境适配",
  "反应路径",
  "建立结构关系",
  "转换成容易理解的内容",
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
