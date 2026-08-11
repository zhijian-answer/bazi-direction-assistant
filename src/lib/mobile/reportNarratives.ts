import type { ReportNarrativeRequest, ReportNarrativeResponse } from "../narrative/reportContracts";
import type { MobileFlowReport } from "./buildMobileFlowReport";
import type { DailyInsightData, MobileProfile } from "./types";

export function buildDailyReportNarrativeRequest(daily: DailyInsightData, profile: MobileProfile): ReportNarrativeRequest {
  return {
    context: "daily",
    reportKey: `${daily.id}:${profile.id || profile.birthDate}`,
    facts: [
      { label: "当天依据", value: daily.evidenceLabel },
      { label: "适合", value: daily.suitable },
      { label: "少做", value: daily.avoid },
      { label: "本地结论", value: daily.summary },
    ],
    fallback: {
      title: daily.title,
      summary: daily.summary,
      action: daily.oneAction || daily.action,
      shareLine: daily.shareLine,
      questions: ["今天最值得先处理哪件事？", "关系里哪句话更需要说清楚？"],
      sections: [
        { id: "work", title: "工作上", body: daily.workNote, action: daily.oneAction || daily.action },
        { id: "relationship", title: "关系里", body: daily.relationshipNote, action: "先看对方接下来的行动，再决定要不要继续猜。" },
      ],
    },
  };
}

export function applyDailyReportNarrative(daily: DailyInsightData, response: ReportNarrativeResponse): DailyInsightData {
  const sections = new Map(response.bundle.sections.map((item) => [item.id, item]));
  return {
    ...daily,
    title: response.bundle.title,
    summary: response.bundle.summary,
    oneAction: response.bundle.action,
    action: response.bundle.action,
    shareLine: response.bundle.shareLine,
    workNote: sections.get("work")?.body || daily.workNote,
    relationshipNote: sections.get("relationship")?.body || daily.relationshipNote,
  };
}

export function buildFlowReportNarrativeRequest(flow: MobileFlowReport, profile: MobileProfile): ReportNarrativeRequest {
  return {
    context: "flow",
    reportKey: `${profile.id || profile.birthDate}:${flow.evidence.generatedAt.slice(0, 10)}:${flow.evidence.monthly}`,
    facts: [
      { label: "本命日柱", value: flow.evidence.dayPillar },
      { label: "流年", value: flow.evidence.annual },
      { label: "流月", value: flow.evidence.monthly },
      { label: "流日", value: flow.evidence.daily },
      { label: "本月适合", value: flow.focus.suitable },
      { label: "本月少做", value: flow.focus.caution },
      { label: "今日适合", value: flow.daily.suitable },
      { label: "今日少做", value: flow.daily.caution },
    ],
    fallback: {
      title: flow.title,
      summary: flow.summary,
      action: flow.question.action,
      shareLine: flow.poster.title,
      questions: [flow.question.prompt, "这一个月最适合先完成什么？"],
      sections: [
        { id: "focus", title: flow.focus.title, body: flow.focus.note, action: `先做一件和“${flow.focus.suitable.split("、")[0]}”有关的小事。` },
        { id: "daily", title: flow.daily.title, body: flow.daily.note, action: `今天减少${flow.daily.caution}。` },
        ...flow.months.map((item, index) => ({ id: `month-${index}`, title: `${item.month} · ${item.theme}`, body: item.note })),
      ],
    },
  };
}

export function applyFlowReportNarrative(flow: MobileFlowReport, response: ReportNarrativeResponse): MobileFlowReport {
  const sections = new Map(response.bundle.sections.map((item) => [item.id, item]));
  const focus = sections.get("focus");
  const daily = sections.get("daily");
  return {
    ...flow,
    title: response.bundle.title,
    summary: response.bundle.summary,
    focus: {
      ...flow.focus,
      title: focus?.title || flow.focus.title,
      note: focus?.body || flow.focus.note,
    },
    daily: {
      ...flow.daily,
      title: daily?.title || flow.daily.title,
      note: daily?.body || flow.daily.note,
    },
    months: flow.months.map((item, index) => ({
      ...item,
      theme: sections.get(`month-${index}`)?.title.replace(`${item.month} · `, "") || item.theme,
      note: sections.get(`month-${index}`)?.body || item.note,
    })),
    question: {
      ...flow.question,
      prompt: response.bundle.questions[0] || flow.question.prompt,
      interpretation: response.bundle.summary,
      action: response.bundle.action,
    },
    poster: {
      ...flow.poster,
      title: response.bundle.shareLine,
      body: `${response.bundle.summary} ${response.bundle.action}`,
    },
  };
}
