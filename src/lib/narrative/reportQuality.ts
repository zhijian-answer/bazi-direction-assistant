import type { ReportNarrativeBundle, ReportNarrativeContext, ReportRelationshipType } from "./reportContracts";

const forbidden = [
  "结构化观察", "当前阶段", "行动建议", "能量场", "人生课题", "命运密码",
  "深度赋能", "精准预测", "AI 分析", "模型输出", "系统生成", "注定", "必然会", "一定会",
  "稳住心态", "按部就班", "顺利推进", "相信自己", "一切都会好", "拥抱变化", "迎接机会",
  "做好规划", "调整状态", "保持沟通", "多维度", "全方位",
  "这份报告从", "这个页面会", "我们将为你",
];

function compact(value: string) {
  return value.replace(/[\s，。！？；：、,.!?;:]/g, "");
}

export function inspectReportNarrative(bundle: ReportNarrativeBundle, expectedIds: string[]) {
  const issues: string[] = [];
  const ids = bundle.sections.map((item) => item.id);
  if (ids.length !== expectedIds.length || ids.some((id, index) => id !== expectedIds[index])) {
    issues.push("章节编号或顺序与原报告不一致");
  }

  const allText = [
    bundle.title, bundle.summary, bundle.action, bundle.shareLine,
    ...bundle.questions,
    ...bundle.sections.flatMap((item) => [item.title, item.body, item.action || ""]),
  ].join("\n");
  for (const phrase of forbidden) {
    if (allText.includes(phrase)) issues.push(`包含不适合交付的表达：${phrase}`);
  }
  if (/^(今日|关系|人格|命盘|阶段).{0,8}(提示|分析|解读|观察)$/.test(bundle.title)) {
    issues.push("根标题仍然像栏目名称，没有直接对用户说话");
  }
  if (bundle.sections.some((item) => compact(item.title) === compact(bundle.title))) {
    issues.push("根标题与章节标题重复，页面阅读没有层级");
  }
  if (bundle.sections.filter((item) => /结合.{0,8}(实际|真实).{0,8}(观察|理解)/.test(item.body)).length > 2) {
    issues.push("多个章节仍然使用“结合实际观察”的回避式模板");
  }
  if (/(搬家|装修|遇到贵人|贵人相助|投资|大额消费|容易熬夜|睡不好|失眠|消化问题|身体疼痛|已有孩子|与孩子相处|疾病|患病)/.test(allText)) {
    issues.push("出现了资料中没有提供的具体生活事件");
  }
  if (bundle.sections.some((item) => /(最近|接下来).{0,8}(会|容易|可能有).{0,10}(变动|发生|遇到|出现)/.test(item.body))) {
    issues.push("把结构解释写成了具体事件预测");
  }

  const bodies = bundle.sections.map((item) => compact(item.body));
  if (new Set(bodies).size !== bodies.length) issues.push("多个章节正文完全重复");
  for (let left = 0; left < bodies.length; left += 1) {
    for (let right = left + 1; right < bodies.length; right += 1) {
      const shorter = bodies[left].length <= bodies[right].length ? bodies[left] : bodies[right];
      const longer = bodies[left].length > bodies[right].length ? bodies[left] : bodies[right];
      if (shorter.length >= 24 && longer.includes(shorter)) issues.push("多个章节仍在复用同一段模板");
    }
  }
  if (bundle.questions.some((item) => !/[？?]$/.test(item))) issues.push("继续探索问题缺少问号");
  return [...new Set(issues)];
}

const romanticCopy = /(恋爱|暧昧|心动|伴侣|婚姻|复合|分手|爱情|爱意|亲密吸引|吸引力)/;

export function inspectRelationshipNarrative(bundle: ReportNarrativeBundle, relationshipType?: ReportRelationshipType) {
  if (!relationshipType) return [];
  const allText = [
    bundle.title, bundle.summary, bundle.action, bundle.shareLine,
    ...bundle.questions,
    ...bundle.sections.flatMap((item) => [item.title, item.body, item.action || ""]),
  ].join("\n");
  const issues: string[] = [];
  if (["friend", "family", "colleague"].includes(relationshipType) && romanticCopy.test(allText)) {
    issues.push("当前关系不是爱情关系，文案却使用了恋爱或亲密关系话术");
  }
  if (relationshipType === "ambiguous" && /(已经是|作为)(恋人|伴侣)|婚姻生活|共同生活的伴侣/.test(allText)) {
    issues.push("正在了解阶段被错误写成了已经确认的伴侣关系");
  }
  if (relationshipType === "partner" && /(暧昧期|还没确定关系|是否要确认关系)/.test(allText)) {
    issues.push("伴侣关系被错误写成了尚未确认的关系");
  }
  return issues;
}

const reportContextLeakage: Partial<Record<ReportNarrativeContext, RegExp>> = {
  bazi: /(太阳星座|月亮星座|上升星座|本命星盘|紫微十二宫|命宫星曜)/,
  zodiac: /(日主|十神|四柱八字|紫微十二宫|命宫星曜)/,
  ziwei: /(日主|十神|四柱八字|太阳星座|月亮星座|上升星座)/,
};

export function inspectReportContextNarrative(bundle: ReportNarrativeBundle, context: ReportNarrativeContext) {
  const allText = [
    bundle.title, bundle.summary, bundle.action, bundle.shareLine,
    ...bundle.questions,
    ...bundle.sections.flatMap((item) => [item.title, item.body, item.action || ""]),
  ].join("\n");
  const issues: string[] = [];
  if (reportContextLeakage[context]?.test(allText)) issues.push("报告混入了当前页面之外的命理体系");
  if ((context === "daily" || context === "flow") && /(天生|一生|这辈子|终身)/.test(allText)) {
    issues.push("短期内容被写成了长期人格或人生定论");
  }
  return issues;
}

export function normalizeReportNarrative(bundle: ReportNarrativeBundle): ReportNarrativeBundle {
  return {
    title: bundle.title.trim(),
    summary: bundle.summary.trim(),
    action: bundle.action.trim(),
    shareLine: bundle.shareLine.trim(),
    questions: bundle.questions.map((item) => {
      const value = item.trim().replace(/[。！!]+$/, "");
      return /[？?]$/.test(value) ? value : `${value}？`;
    }),
    sections: bundle.sections.map((item) => ({
      id: item.id,
      title: item.title.trim(),
      body: item.body.trim(),
      action: item.action?.trim() || undefined,
    })),
  };
}
