import { readPositiveInt } from "./limits";

export function readBoolean(name: string, fallback: boolean) {
  const raw = process.env[name];
  if (raw === undefined || raw === "") {
    return fallback;
  }
  return ["1", "true", "yes", "on"].includes(raw.toLowerCase());
}

export const aiConfig = {
  forceLocal: readBoolean("AI_FORCE_LOCAL", false),
  fallbackOnError: readBoolean("AI_FALLBACK_ON_ERROR", true),
  openaiTimeoutMs: readPositiveInt("OPENAI_TIMEOUT_MS", 20_000),
  model: process.env.AI_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini",
  provider: process.env.AI_PROVIDER || "openai",
  baseURL: process.env.AI_BASE_URL || undefined,
  apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY || "",
  hasOpenAIKey: Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY),
};

export function getAiMode() {
  if (aiConfig.forceLocal || !aiConfig.hasOpenAIKey) {
    return "local";
  }
  return "openai";
}

export function getCompatibleAiSettings() {
  return {
    enabled: !aiConfig.forceLocal && aiConfig.hasOpenAIKey && readBoolean("NARRATIVE_AI_ENABLED", true),
    provider: aiConfig.provider,
    baseURL: aiConfig.baseURL,
    apiKey: aiConfig.apiKey,
    model: process.env.NARRATIVE_MODEL || aiConfig.model,
  };
}
