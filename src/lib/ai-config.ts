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
  model: process.env.OPENAI_MODEL || "gpt-4.1-mini",
  hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
};

export function getAiMode() {
  if (aiConfig.forceLocal || !aiConfig.hasOpenAIKey) {
    return "local";
  }
  return "openai";
}
