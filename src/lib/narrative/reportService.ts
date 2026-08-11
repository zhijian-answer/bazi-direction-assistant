import { createHash } from "node:crypto";
import type { ReportNarrativeRequest, ReportNarrativeResponse } from "./reportContracts";
import { generateReportNarrativeWithApi } from "./reportProvider";
import { reportNarrativePromptVersion } from "./reportPrompt";
import {
  inspectRelationshipNarrative,
  inspectReportContextNarrative,
  inspectReportNarrative,
  normalizeReportNarrative,
} from "./reportQuality";

const cache = new Map<string, ReportNarrativeResponse>();

function requestKey(input: ReportNarrativeRequest) {
  return createHash("sha256")
    .update(JSON.stringify({ ...input, promptVersion: input.promptVersion || reportNarrativePromptVersion }))
    .digest("hex");
}

function remember(key: string, value: ReportNarrativeResponse) {
  if (cache.size >= 120) cache.delete(cache.keys().next().value || "");
  cache.set(key, value);
  return value;
}

function inspectAgainstFallback(input: ReportNarrativeRequest, bundle: ReportNarrativeResponse["bundle"]) {
  const issues = inspectReportNarrative(bundle, input.fallback.sections.map((item) => item.id));
  issues.push(...inspectRelationshipNarrative(bundle, input.relationshipType));
  issues.push(...inspectReportContextNarrative(bundle, input.context));
  if (bundle.summary.replace(/\s/g, "") === input.fallback.summary.replace(/\s/g, "")) {
    issues.push("摘要照抄了旧模板，没有转成用户语言");
  }
  const unchangedSections = bundle.sections.filter((section, index) => (
    section.body.replace(/\s/g, "") === input.fallback.sections[index]?.body.replace(/\s/g, "")
  )).length;
  if (unchangedSections >= Math.max(1, Math.ceil(bundle.sections.length / 2))) {
    issues.push("过多章节照抄旧模板，没有完成整份内容重写");
  }
  return [...new Set(issues)];
}

export async function resolveReportNarrative(input: ReportNarrativeRequest): Promise<ReportNarrativeResponse> {
  const promptVersion = input.promptVersion || reportNarrativePromptVersion;
  const key = requestKey(input);
  const cached = cache.get(key);
  if (cached) return cached;
  try {
    const generated = await generateReportNarrativeWithApi(input);
    if (!generated) return { bundle: input.fallback, source: "fallback", promptVersion, issues: ["在线内容服务未启用"] };
    let bundle = normalizeReportNarrative(generated.bundle);
    let issues = inspectAgainstFallback(input, bundle);
    for (let attempt = 0; issues.length && attempt < 2; attempt += 1) {
      const revised = await generateReportNarrativeWithApi(input, issues);
      if (!revised) break;
      bundle = normalizeReportNarrative(revised.bundle);
      issues = inspectAgainstFallback(input, bundle);
    }
    // A rejected rewrite must not poison the process cache. A later page visit can
    // retry the provider instead of receiving the same stale fallback forever.
    if (issues.length) return { bundle: input.fallback, source: "fallback", provider: generated.provider, model: generated.model, promptVersion, issues };
    return remember(key, { bundle, source: "api", provider: generated.provider, model: generated.model, promptVersion, issues: [] });
  } catch (error) {
    return {
      bundle: input.fallback,
      source: "fallback",
      promptVersion,
      issues: [process.env.NODE_ENV === "development" && error instanceof Error ? error.message.slice(0, 180) : "在线内容暂时没有整理成功"],
    };
  }
}
