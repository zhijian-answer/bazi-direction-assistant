"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { ShareImageRecord, SharePosterData } from "./types";

const shareHistoryKey = "xuanshu-mobile-share-history-v1";
const shareHistoryEvent = "xuanshu-mobile-share-history-change";

export function loadShareImageHistory(): ShareImageRecord[] {
  if (typeof window === "undefined") return [];
  try {
    const value = window.localStorage.getItem(shareHistoryKey);
    return value ? (JSON.parse(value) as ShareImageRecord[]) : [];
  } catch {
    return [];
  }
}

export function recordShareImage(input: {
  profileId: string;
  type: SharePosterData["category"];
  sourceId: string;
  title: string;
}) {
  const record: ShareImageRecord = {
    id: window.crypto?.randomUUID?.() || `share-${Date.now()}`,
    profileId: input.profileId,
    type: input.type,
    sourceId: input.sourceId,
    title: input.title,
    width: 1080,
    height: 1920,
    delivery: "generated",
    createdAt: new Date().toISOString(),
  };
  const next = [record, ...loadShareImageHistory()].slice(0, 30);
  window.localStorage.setItem(shareHistoryKey, JSON.stringify(next));
  window.dispatchEvent(new Event(shareHistoryEvent));
  return record.id;
}

export function updateShareImageDelivery(recordId: string, delivery: ShareImageRecord["delivery"]) {
  const next = loadShareImageHistory().map((item) => item.id === recordId ? { ...item, delivery } : item);
  window.localStorage.setItem(shareHistoryKey, JSON.stringify(next));
  window.dispatchEvent(new Event(shareHistoryEvent));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(shareHistoryEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(shareHistoryEvent, callback);
  };
}

export function useShareImageHistory(profileId?: string) {
  const serialized = useSyncExternalStore(subscribe, () => JSON.stringify(loadShareImageHistory()), () => "[]");
  return useMemo(() => {
    try {
      const records = JSON.parse(serialized) as ShareImageRecord[];
      return profileId ? records.filter((item) => item.profileId === profileId) : records;
    } catch {
      return [];
    }
  }, [profileId, serialized]);
}
