import { createHash } from "node:crypto";
import type { NarrativeRequest, NarrativeResponse } from "./contracts";
import { buildLocalNarrative } from "./local";
import { narrativePromptVersion } from "./prompt";
import { generateNarrativeWithApi } from "./provider";
import { inspectNarrativeCard, normalizeNarrativeCard } from "./quality";

const cache = new Map<string, NarrativeResponse>();
const maxCacheEntries = 240;

function requestKey(input: NarrativeRequest) {
  return createHash("sha256")
    .update(JSON.stringify({ ...input, promptVersion: input.promptVersion || narrativePromptVersion }))
    .digest("hex");
}

function cacheResult(key: string, value: NarrativeResponse) {
  if (cache.size >= maxCacheEntries) cache.delete(cache.keys().next().value || "");
  cache.set(key, value);
  return value;
}

export async function resolveNarrative(input: NarrativeRequest): Promise<NarrativeResponse> {
  const promptVersion = input.promptVersion || narrativePromptVersion;
  const key = requestKey(input);
  const cached = cache.get(key);
  if (cached) return cached;

  const localCard = buildLocalNarrative(input);
  try {
    const generated = await generateNarrativeWithApi(input);
    if (!generated) {
      return cacheResult(key, { card: localCard, source: "catalog", promptVersion, issues: [] });
    }

    const card = normalizeNarrativeCard({ ...generated.card, evidenceSummary: input.fallback.evidenceSummary });
    const issues = inspectNarrativeCard(card);
    if (issues.length) {
      return cacheResult(key, {
        card: localCard,
        source: "fallback",
        provider: generated.provider,
        model: generated.model,
        promptVersion,
        issues,
      });
    }

    return cacheResult(key, {
      card,
      source: "api",
      provider: generated.provider,
      model: generated.model,
      promptVersion,
      issues: [],
    });
  } catch (error) {
    return cacheResult(key, {
      card: localCard,
      source: "fallback",
      promptVersion,
      issues: [process.env.NODE_ENV === "development" && error instanceof Error
        ? error.message.slice(0, 180)
        : "远程文案暂不可用，已使用本地版本"],
    });
  }
}
