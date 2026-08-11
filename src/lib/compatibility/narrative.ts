"use client";

import { requestReportNarrative } from "../narrative/reportClient";
import type { ReportNarrativeBundle, ReportNarrativeRequest, ReportNarrativeResponse } from "../narrative/reportContracts";
import { relationshipLabels } from "./labels";
import type { CompatibilityDimension, CompatibilityReport, RelationshipType } from "./types";

const staleCompatibilityPhrases = [
  "这份报告从", "这个页面会", "这里先保留", "结合实际经历观察", "结合现实经历理解",
];

const relationshipDimensionLabels: Record<RelationshipType, Record<CompatibilityDimension["id"], string>> = {
  lover: { attraction: "彼此吸引", emotion: "情绪回应", communication: "沟通方式", stability: "稳定程度", rhythm: "相处节奏" },
  partner: { attraction: "亲近方式", emotion: "情绪回应", communication: "沟通方式", stability: "共同生活", rhythm: "相处节奏" },
  ambiguous: { attraction: "靠近意愿", emotion: "回应程度", communication: "表达方式", stability: "关系确定感", rhythm: "互动节奏" },
  friend: { attraction: "自然默契", emotion: "互相支持", communication: "沟通方式", stability: "信任基础", rhythm: "联络节奏" },
  family: { attraction: "亲近方式", emotion: "关心回应", communication: "沟通习惯", stability: "责任边界", rhythm: "生活节奏" },
  colleague: { attraction: "合作基础", emotion: "反馈方式", communication: "信息沟通", stability: "协作稳定", rhythm: "推进节奏" },
  other: { attraction: "相处基础", emotion: "回应方式", communication: "沟通方式", stability: "关系边界", rhythm: "互动节奏" },
};

const relationshipQuestions: Record<RelationshipType, string[]> = {
  lover: ["你们最容易在哪件事上误会彼此？", "这段感情最值得保留的相处方式是什么？", "下一次意见不同时，可以先改变哪一步？"],
  partner: ["日常相处中，哪种分工最需要重新说清？", "你们表达在意的方式有什么不同？", "下一次发生分歧时，可以先改变哪一步？"],
  ambiguous: ["对方哪些行动才算持续而明确的回应？", "现在最需要说清的是期待还是边界？", "继续了解之前，可以先确认哪件现实小事？"],
  friend: ["你们最容易因为什么产生误会？", "这段友情最值得保留的相处方式是什么？", "联络节奏不同的时候，可以怎样说得更自然？"],
  family: ["哪一种关心最容易被对方误解？", "哪些责任需要重新分清边界？", "下一次意见不同时，可以先把哪句话说清？"],
  colleague: ["哪一项职责最需要重新确认？", "你们接收反馈的方式有什么不同？", "下一次协作前，应该先同步哪条信息？"],
  other: ["你们最容易在哪件事上理解不同？", "这段关系中什么边界需要说清？", "下一次沟通时，可以先确认哪件事实？"],
};

function displayDimensionLabel(report: CompatibilityReport, dimension: CompatibilityDimension) {
  return relationshipDimensionLabels[report.relationshipType][dimension.id];
}

export function needsCompatibilityNarrativeUpgrade(report: CompatibilityReport, version: string) {
  if (report.delivery?.source !== "api" || report.delivery.promptVersion !== version) return true;
  const visibleCopy = [
    report.summary,
    ...report.dimensions.map((item) => item.summary),
    ...report.sections.flatMap((item) => [item.title, item.conclusion, item.observation, item.action]),
  ].join("\n");
  return staleCompatibilityPhrases.some((phrase) => visibleCopy.includes(phrase));
}

function bundleFor(report: CompatibilityReport): ReportNarrativeBundle {
  const ranked = [...report.dimensions].sort((left, right) => right.score - left.score);
  const strongest = ranked[0];
  const needsTranslation = ranked.at(-1);
  const relationship = relationshipLabels[report.relationshipType];
  const strongestLabel = strongest ? displayDimensionLabel(report, strongest) : "相处方式";
  const needsTranslationLabel = needsTranslation ? displayDimensionLabel(report, needsTranslation) : "沟通";
  const summary = strongest && needsTranslation
    ? `你们在${strongestLabel}上更容易接住彼此，到了${needsTranslationLabel}这件事上，则需要把各自的期待说得更清楚。`
    : `这段${relationship}关系里既有自然靠近的地方，也有需要慢慢说清的差异。`;
  return {
    title: strongest ? `你们最容易在${strongestLabel}上接住彼此` : "有些默契不用猜，有些差异需要说清",
    summary,
    action: needsTranslation
      ? `选一件最近和${needsTranslationLabel}有关的小事，各自说清事实、感受和希望对方怎么做。`
      : "先选一件最近反复出现的小事，确认彼此看到的是不是同一个问题。",
    shareLine: summary,
    questions: relationshipQuestions[report.relationshipType],
    sections: [
      ...report.dimensions.map((item) => ({
        id: `dimension-${item.id}`,
        title: displayDimensionLabel(report, item),
        body: item.summary,
        action: "回想一次真实相处，看看这项表现是否真的出现过。",
      })),
      ...report.sections.map((item) => ({
        id: `section-${item.id}`,
        title: item.title,
        body: `${item.conclusion}${item.observation}`,
        action: item.action,
      })),
    ],
  };
}

export function buildCompatibilityNarrativeRequest(report: CompatibilityReport): ReportNarrativeRequest {
  return {
    context: "compatibility",
    reportKey: `${report.id}:${report.engine.ruleVersion}`,
    relationshipType: report.relationshipType,
    facts: [
      { label: "关系类型", value: relationshipLabels[report.relationshipType] },
      { label: "分析方式", value: report.mode === "astrology" ? "双方本命星体与相位" : "双方四柱、五行与合冲关系" },
      { label: "双方称呼", value: `${report.primary.name}与${report.partner.name}` },
      { label: "资料边界", value: report.warnings.join("；") || "出生资料可用于当前报告" },
      ...report.dimensions.map((item) => ({
        label: `${item.label}事实`,
        value: `${item.score}分；${item.evidence.join("；") || item.summary}`.slice(0, 220),
      })),
      ...report.sections.map((item) => ({
        label: `${item.title}依据`,
        value: (item.evidence.join("；") || `${item.conclusion}；${item.observation}`).slice(0, 220),
      })),
    ],
    fallback: bundleFor(report),
  };
}

export function applyCompatibilityNarrative(report: CompatibilityReport, response: ReportNarrativeResponse): CompatibilityReport {
  const byId = new Map(response.bundle.sections.map((item) => [item.id, item]));
  return {
    ...report,
    title: response.bundle.title,
    summary: response.bundle.summary,
    shareLine: response.bundle.shareLine,
    narrativeQuestions: response.bundle.questions,
    dimensions: report.dimensions.map((item) => ({
      ...item,
      label: byId.get(`dimension-${item.id}`)?.title || displayDimensionLabel(report, item),
      summary: byId.get(`dimension-${item.id}`)?.body || item.summary,
    })),
    sections: report.sections.map((item) => {
      const generated = byId.get(`section-${item.id}`);
      return generated ? {
        ...item,
        title: generated.title,
        conclusion: generated.body.split(/[。！？]/)[0] || item.conclusion,
        observation: generated.body,
        action: generated.action || item.action,
      } : item;
    }),
    delivery: {
      source: response.source,
      provider: response.provider,
      model: response.model,
      promptVersion: response.promptVersion,
      generatedAt: new Date().toISOString(),
    },
  };
}

export async function enrichCompatibilityReport(report: CompatibilityReport, signal?: AbortSignal) {
  const response = await requestReportNarrative(buildCompatibilityNarrativeRequest(report), signal);
  return applyCompatibilityNarrative(report, response);
}
