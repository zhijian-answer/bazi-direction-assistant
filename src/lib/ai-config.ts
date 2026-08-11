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
  provider: process.env.AI_PROVIDER || (process.env.DEEPSEEK_API_KEY ? "deepseek" : "openai"),
  timeoutMs: readPositiveInt("AI_TIMEOUT_MS", readPositiveInt("OPENAI_TIMEOUT_MS", 30_000)),
  model: process.env.AI_MODEL || process.env.OPENAI_MODEL || "gpt-4.1-mini",
  baseURL: process.env.AI_BASE_URL || undefined,
  apiKey: process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY || "",
  hasApiKey: Boolean(process.env.AI_API_KEY || process.env.DEEPSEEK_API_KEY || process.env.OPENAI_API_KEY),
};

function compatibleBaseURL() {
  if (aiConfig.baseURL) return aiConfig.baseURL;
  return aiConfig.provider === "deepseek" ? "https://api.deepseek.com" : undefined;
}

function compatibleModel(kind: "narrative" | "chat") {
  const override = kind === "narrative" ? process.env.NARRATIVE_MODEL : process.env.CHAT_MODEL;
  if (override) return override;
  if (process.env.AI_MODEL || process.env.OPENAI_MODEL) return aiConfig.model;
  return aiConfig.provider === "deepseek" ? "deepseek-chat" : aiConfig.model;
}

export function getAiMode() {
  if (aiConfig.forceLocal || !aiConfig.hasApiKey) {
    return "local";
  }
  return "api";
}

export function getCompatibleAiSettings() {
  return {
    enabled: !aiConfig.forceLocal && aiConfig.hasApiKey && readBoolean("NARRATIVE_AI_ENABLED", true),
    provider: aiConfig.provider,
    baseURL: compatibleBaseURL(),
    apiKey: aiConfig.apiKey,
    model: compatibleModel("narrative"),
    timeoutMs: aiConfig.timeoutMs,
  };
}

export function getChatAiSettings() {
  return {
    enabled: !aiConfig.forceLocal && aiConfig.hasApiKey && readBoolean("CHAT_AI_ENABLED", true),
    provider: aiConfig.provider,
    baseURL: compatibleBaseURL(),
    apiKey: aiConfig.apiKey,
    model: compatibleModel("chat"),
    timeoutMs: aiConfig.timeoutMs,
  };
}
