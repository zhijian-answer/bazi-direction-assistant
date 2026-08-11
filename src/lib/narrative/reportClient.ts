"use client";

import { useEffect, useMemo, useState } from "react";
import { REPORT_NARRATIVE_VERSION, type ReportNarrativeRequest, type ReportNarrativeResponse } from "./reportContracts";

const remoteEnabled = process.env.NEXT_PUBLIC_NARRATIVE_API_ENABLED !== "false";
const remoteBase = (process.env.NEXT_PUBLIC_NARRATIVE_API_URL || "").replace(/\/$/, "");
const sessionCache = new Map<string, ReportNarrativeResponse>();

export async function requestReportNarrative(input: ReportNarrativeRequest, signal?: AbortSignal) {
  const request = { ...input, promptVersion: input.promptVersion || REPORT_NARRATIVE_VERSION };
  const serialized = JSON.stringify(request);
  const cached = sessionCache.get(serialized);
  if (cached) return cached;
  if (!remoteEnabled) return { bundle: input.fallback, source: "fallback", promptVersion: request.promptVersion, issues: ["在线内容服务未启用"] } satisfies ReportNarrativeResponse;
  const response = await fetch(`${remoteBase}/api/report-narratives`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: serialized,
    signal,
  });
  if (!response.ok) throw new Error(`Report narrative API ${response.status}`);
  const result = await response.json() as ReportNarrativeResponse;
  if (result.source === "api") sessionCache.set(serialized, result);
  return result;
}

export function useReportNarrative(input: ReportNarrativeRequest | null) {
  const serialized = useMemo(() => input ? JSON.stringify({ ...input, promptVersion: input.promptVersion || REPORT_NARRATIVE_VERSION }) : "", [input]);
  const [remote, setRemote] = useState<{ key: string; value: ReportNarrativeResponse } | null>(null);
  useEffect(() => {
    if (!input || !serialized || remote?.key === serialized) return;
    const controller = new AbortController();
    requestReportNarrative(input, controller.signal)
      .then((value) => setRemote({ key: serialized, value }))
      .catch(() => undefined);
    return () => controller.abort();
  }, [input, remote?.key, serialized]);
  if (!input) return null;
  if (remote?.key === serialized) return remote.value;
  return { bundle: input.fallback, source: "fallback", promptVersion: input.promptVersion || REPORT_NARRATIVE_VERSION, issues: [] } satisfies ReportNarrativeResponse;
}
