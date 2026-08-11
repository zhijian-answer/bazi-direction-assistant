import { NextResponse } from "next/server";
import { aiConfig, getAiMode } from "@/lib/ai-config";
import { appLimits } from "@/lib/limits";
import { appId } from "@/lib/site";

export async function GET() {
  return NextResponse.json({
    app_id: appId,
    status: "ok",
    time: new Date().toISOString(),
    ai_mode: getAiMode(),
    ai: {
      provider: aiConfig.provider,
      model: aiConfig.model,
      has_api_key: aiConfig.hasApiKey,
      force_local: aiConfig.forceLocal,
      fallback_on_error: aiConfig.fallbackOnError,
      timeout_ms: aiConfig.timeoutMs,
    },
    data_store: process.env.APP_DATA_DIR || "./data",
    limits: appLimits,
    version: process.env.APP_VERSION || "1.0.0",
  });
}
