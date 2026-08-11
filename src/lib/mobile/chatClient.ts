"use client";

import { buildMobileChatAnswer, type MobileChatAnswer } from "./chatEngine";
import type { MobileChatTurn } from "./chatHistory";
import type { MobileProfile } from "./types";

function compactHistory(turns: MobileChatTurn[]) {
  return turns.slice(-10).map((turn) => turn.role === "user"
    ? { role: "user" as const, content: turn.content.slice(0, 600) }
    : {
        role: "assistant" as const,
        content: `${turn.answer.title}\n${turn.answer.summary}\n${turn.answer.action}`.slice(0, 600),
      });
}

export async function requestMobileChatAnswer(
  profile: MobileProfile,
  question: string,
  previousTurns: MobileChatTurn[],
): Promise<MobileChatAnswer> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 40_000);
  try {
    const response = await fetch("/api/mobile-chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, question, history: compactHistory(previousTurns) }),
      cache: "no-store",
      signal: controller.signal,
    });
    if (!response.ok) {
      const payload = await response.json().catch(() => null) as { error?: string } | null;
      throw new Error(payload?.error || `在线问答暂不可用（${response.status}）`);
    }
    const payload = await response.json() as { answer: MobileChatAnswer };
    return payload.answer;
  } catch {
    return buildMobileChatAnswer(profile, question);
  } finally {
    window.clearTimeout(timeout);
  }
}
