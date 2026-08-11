import OpenAI from "openai";
import { getCompatibleAiSettings } from "../ai-config";
import { buildNarrativeAppContentBrief, renderAppContentSystemPrompt } from "./appContentProtocol";
import type { NarrativeCard, NarrativeRequest } from "./contracts";
import { narrativeSystemPrompt } from "./prompt";
import { generatedNarrativeSchema } from "./schema";

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

export async function generateNarrativeWithApi(input: NarrativeRequest, revisionIssues: string[] = []): Promise<{
  card: Omit<NarrativeCard, "evidenceSummary">;
  provider: string;
  model: string;
} | null> {
  const active = getClient();
  if (!active) return null;

  const completion = await active.client.chat.completions.create({
    model: active.settings.model,
    temperature: 0.72,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: narrativeSystemPrompt },
      { role: "system", content: renderAppContentSystemPrompt(buildNarrativeAppContentBrief(input)) },
      {
        role: "user",
        content: JSON.stringify({
          context: input.context,
          slot: input.slot,
          appContentBrief: buildNarrativeAppContentBrief(input),
          facts: input.facts,
          existingCopy: input.fallback,
          revision: revisionIssues.length
            ? `上一版没有符合当前 App 页面要求，请改正：${revisionIssues.join("；")}`
            : undefined,
        }),
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("文案模型没有返回内容");
  const parsed = generatedNarrativeSchema.parse(JSON.parse(raw));
  return {
    card: parsed,
    provider: active.settings.provider,
    model: active.settings.model,
  };
}
