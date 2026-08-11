import OpenAI from "openai";
import { getCompatibleAiSettings } from "../ai-config";
import { buildReportAppContentBrief } from "./appContentProtocol";
import type { ReportNarrativeBundle, ReportNarrativeRequest } from "./reportContracts";
import { buildReportScenarioSystemPrompt, reportNarrativeSystemPrompt } from "./reportPrompt";
import { reportNarrativeBundleSchema } from "./reportSchema";

let client: OpenAI | null = null;
let clientKey = "";

function getClient() {
  const settings = getCompatibleAiSettings();
  if (!settings.enabled || !settings.apiKey) return null;
  const nextKey = `${settings.baseURL || "openai"}:${settings.apiKey.slice(-6)}`;
  if (!client || clientKey !== nextKey) {
    client = new OpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseURL,
      timeout: settings.timeoutMs,
    });
    clientKey = nextKey;
  }
  return { client, settings };
}

export async function generateReportNarrativeWithApi(input: ReportNarrativeRequest, revisionIssues: string[] = []): Promise<{
  bundle: ReportNarrativeBundle;
  provider: string;
  model: string;
} | null> {
  const active = getClient();
  if (!active) return null;
  const completion = await active.client.chat.completions.create({
    model: active.settings.model,
    temperature: 0.74,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: reportNarrativeSystemPrompt },
      { role: "system", content: buildReportScenarioSystemPrompt(input) },
      {
        role: "user",
        content: JSON.stringify({
          context: input.context,
          reportKey: input.reportKey,
          relationshipType: input.relationshipType,
          appContentBrief: buildReportAppContentBrief(input),
          facts: input.facts,
          existingCopy: input.fallback,
          requiredSectionIds: input.fallback.sections.map((item) => item.id),
          revision: revisionIssues.length
            ? `上一版未通过内容质检，请重点改正：${revisionIssues.join("；")}`
            : undefined,
        }),
      },
    ],
  });
  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("内容服务没有返回结果");
  return {
    bundle: reportNarrativeBundleSchema.parse(JSON.parse(raw)),
    provider: active.settings.provider,
    model: active.settings.model,
  };
}
