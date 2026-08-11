import type { DailyInsightData, MobileProfile } from "./types";
import { buildMobileFlowReport } from "./buildMobileFlowReport";
import { dailyCopyByKey, type DailyCopyKey } from "../../content/mobile-copy";

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

export function getDailyInsight(profile: MobileProfile, date = new Date()) {
  const flow = buildMobileFlowReport(profile, date);
  const profileId = `${profile.id || profile.name}|${profile.birthDate}|${profile.birthTime}`;
  const actionTarget = flow.daily.suitable.split("、")[0];
  const presentation = dailyCopyByKey[flow.daily.key as DailyCopyKey];
  return {
    id: `daily-${localDateKey(date)}-${hash(profileId).toString(36)}`,
    keyword: flow.daily.theme.split("·")[0].trim(),
    title: presentation.title,
    summary: presentation.plainInsight,
    workNote: presentation.workNote,
    relationshipNote: presentation.relationshipNote,
    oneAction: presentation.oneAction,
    evidenceLabel: `本命${flow.evidence.dayPillar} · 今日${flow.daily.ganZhi}`,
    shareLine: presentation.shareLine,
    suitable: flow.daily.suitable,
    avoid: flow.daily.caution,
    action: presentation.oneAction || `从“${actionTarget}”里选一件 30 分钟内能完成的事，做完再决定下一步。`,
    tags: [flow.daily.ganZhi, flow.daily.theme, `本命${flow.evidence.dayPillar}`],
  } satisfies DailyInsightData;
}

export function formatDailyDate(date = new Date()) {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short" }).format(date);
}
