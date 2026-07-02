"use client";

import type { MobileAnalyticsEventName } from "./analyticsEvents";

type EventMetadata = Record<string, string | number | boolean | null | undefined>;

const timingMarks = new Map<string, number>();
const sessionKey = "xuanshu-analytics-session";

function getSessionId() {
  try {
    const existing = window.sessionStorage.getItem(sessionKey);
    if (existing) return existing;
    const next = crypto.randomUUID();
    window.sessionStorage.setItem(sessionKey, next);
    return next;
  } catch {
    return "session-unavailable";
  }
}

function getEnvironment() {
  const userAgent = navigator.userAgent.toLowerCase();
  const wechat = userAgent.includes("micromessenger");
  const ios = /iphone|ipad|ipod/.test(userAgent);
  const android = userAgent.includes("android");
  if (wechat && ios) return "ios_wechat";
  if (wechat && android) return "android_wechat";
  if (ios) return "ios_safari";
  if (android) return "android_chrome";
  return "other";
}

export function startMobileTiming(key: string) {
  timingMarks.set(key, performance.now());
}

export function finishMobileTiming(key: string) {
  const start = timingMarks.get(key);
  timingMarks.delete(key);
  return start === undefined ? undefined : Math.round((performance.now() - start) * 10) / 10;
}

export function trackMobileEvent(event: MobileAnalyticsEventName, metadata: EventMetadata = {}, durationMs?: number) {
  if (process.env.NEXT_PUBLIC_DISABLE_MOBILE_ANALYTICS === "true" || typeof window === "undefined" || navigator.doNotTrack === "1") return;
  const payload = {
    event,
    occurredAt: new Date().toISOString(),
    route: window.location.pathname,
    sessionId: getSessionId(),
    environment: getEnvironment(),
    durationMs,
    metadata,
  };

  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
    keepalive: true,
    credentials: "same-origin",
  }).catch(() => {
    // Analytics must never interrupt the product flow.
  });
}
