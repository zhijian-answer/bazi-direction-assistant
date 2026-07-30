"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { CompatibilityDraft, CompatibilityReport } from "./types";

const draftKey = "xuanshu-compatibility-draft-v1";
const latestKey = "xuanshu-compatibility-latest-v1";
const historyKey = "xuanshu-compatibility-history-v1";
const compatibilityEvent = "xuanshu-compatibility-change";

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const stored = window.localStorage.getItem(key);
    return stored ? JSON.parse(stored) as T : fallback;
  } catch {
    return fallback;
  }
}

export function saveCompatibilityDraft(draft: CompatibilityDraft) {
  window.localStorage.setItem(draftKey, JSON.stringify(draft));
  window.dispatchEvent(new Event(compatibilityEvent));
}

export function loadCompatibilityDraft() {
  return readJson<CompatibilityDraft | null>(draftKey, null);
}

export function saveCompatibilityReport(report: CompatibilityReport, options: { persistHistory?: boolean } = {}) {
  const { persistHistory = true } = options;
  window.localStorage.setItem(latestKey, JSON.stringify(report));
  if (persistHistory) {
    const history = loadCompatibilityHistory();
    const next = [report, ...history.filter((item) => item.id !== report.id)].slice(0, 30);
    window.localStorage.setItem(historyKey, JSON.stringify(next));
  }
  window.dispatchEvent(new Event(compatibilityEvent));
}

export function loadLatestCompatibilityReport() {
  return readJson<CompatibilityReport | null>(latestKey, null);
}

export function loadCompatibilityHistory() {
  return readJson<CompatibilityReport[]>(historyKey, []);
}

export function deleteCompatibilityReport(reportId: string) {
  const next = loadCompatibilityHistory().filter((item) => item.id !== reportId);
  window.localStorage.setItem(historyKey, JSON.stringify(next));
  const latest = loadLatestCompatibilityReport();
  if (latest?.id === reportId) window.localStorage.removeItem(latestKey);
  window.dispatchEvent(new Event(compatibilityEvent));
}

function subscribeCompatibility(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(compatibilityEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(compatibilityEvent, callback);
  };
}

export function useCompatibilityHistory() {
  const serialized = useSyncExternalStore(
    subscribeCompatibility,
    () => window.localStorage.getItem(historyKey) || "[]",
    () => "[]",
  );
  return useMemo(() => {
    try { return JSON.parse(serialized) as CompatibilityReport[]; }
    catch { return []; }
  }, [serialized]);
}

export function useLatestCompatibilityReport() {
  const serialized = useSyncExternalStore(
    subscribeCompatibility,
    () => window.localStorage.getItem(latestKey) || "null",
    () => "null",
  );
  return useMemo(() => {
    try { return JSON.parse(serialized) as CompatibilityReport | null; }
    catch { return null; }
  }, [serialized]);
}
