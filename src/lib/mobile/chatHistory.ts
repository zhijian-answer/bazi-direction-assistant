"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { MobileChatAnswer } from "./chatEngine";

export type MobileChatTurn =
  | { id: string; role: "user"; content: string; createdAt: string }
  | { id: string; role: "assistant"; answer: MobileChatAnswer; createdAt: string };

const historyPrefix = "xuanshu-mobile-chat-v2:";
const historyEvent = "xuanshu-mobile-chat-change";

function key(profileId: string) {
  return `${historyPrefix}${profileId || "local-profile"}`;
}

export function loadMobileChatHistory(profileId: string): MobileChatTurn[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(profileId));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as MobileChatTurn[];
    return Array.isArray(parsed) ? parsed.slice(-24) : [];
  } catch {
    return [];
  }
}

export function saveMobileChatHistory(profileId: string, turns: MobileChatTurn[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key(profileId), JSON.stringify(turns.slice(-24)));
  window.dispatchEvent(new Event(historyEvent));
}

export function clearMobileChatHistory(profileId: string) {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key(profileId));
  window.dispatchEvent(new Event(historyEvent));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(historyEvent, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(historyEvent, callback);
  };
}

export function useMobileChatHistory(profileId: string) {
  const serialized = useSyncExternalStore(
    subscribe,
    () => JSON.stringify(loadMobileChatHistory(profileId)),
    () => "[]",
  );
  return useMemo(() => {
    try {
      return JSON.parse(serialized) as MobileChatTurn[];
    } catch {
      return [];
    }
  }, [serialized]);
}
