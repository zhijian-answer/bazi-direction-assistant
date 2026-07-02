import { NextResponse } from "next/server";
import { mobileAnalyticsEvents } from "@/lib/mobile/analyticsEvents";

const allowedEvents = new Set<string>(mobileAnalyticsEvents);
const allowedEnvironments = new Set(["ios_safari", "ios_wechat", "android_chrome", "android_wechat", "other"]);

type AnalyticsPayload = {
  event?: unknown;
  occurredAt?: unknown;
  route?: unknown;
  sessionId?: unknown;
  environment?: unknown;
  durationMs?: unknown;
  metadata?: unknown;
};

function normalizeMetadata(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  return Object.fromEntries(
    Object.entries(value)
      .slice(0, 12)
      .filter(([, item]) => ["string", "number", "boolean"].includes(typeof item) || item === null)
      .map(([key, item]) => [key.slice(0, 40), typeof item === "string" ? item.slice(0, 80) : item]),
  );
}

export async function POST(request: Request) {
  const raw = await request.text();
  if (raw.length > 4096) return NextResponse.json({ error: "埋点数据过大" }, { status: 413 });

  let payload: AnalyticsPayload;
  try {
    payload = JSON.parse(raw) as AnalyticsPayload;
  } catch {
    return NextResponse.json({ error: "埋点数据格式不正确" }, { status: 400 });
  }

  if (typeof payload.event !== "string" || !allowedEvents.has(payload.event)) {
    return NextResponse.json({ error: "埋点事件不支持" }, { status: 400 });
  }

  const normalized = {
    event: payload.event,
    occurredAt: typeof payload.occurredAt === "string" ? payload.occurredAt.slice(0, 40) : new Date().toISOString(),
    route: typeof payload.route === "string" ? payload.route.slice(0, 120) : "/",
    sessionId: typeof payload.sessionId === "string" ? payload.sessionId.slice(0, 80) : "unknown",
    environment: typeof payload.environment === "string" && allowedEnvironments.has(payload.environment) ? payload.environment : "other",
    durationMs: typeof payload.durationMs === "number" && Number.isFinite(payload.durationMs) ? Math.max(0, Math.min(payload.durationMs, 120000)) : undefined,
    metadata: normalizeMetadata(payload.metadata),
  };

  console.info("[xuanshu-mobile-event]", JSON.stringify(normalized));
  return NextResponse.json({ accepted: true }, { status: 202, headers: { "cache-control": "no-store" } });
}
