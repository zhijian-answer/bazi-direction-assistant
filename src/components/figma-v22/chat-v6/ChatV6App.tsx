"use client";

import { Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { requestMobileChatAnswer } from "@/lib/mobile/chatClient";
import {
  clearMobileChatHistory,
  saveMobileChatHistory,
  useMobileChatHistory,
  type MobileChatTurn,
} from "@/lib/mobile/chatHistory";
import { useMobileProfileState } from "@/lib/mobile/profile";
import { MobileShell } from "@/components/mobile/MobileShell";
import ChatScreen from "./ChatScreen";
import type { ChatMsg, ChatReply, PersonFact } from "./types";

function messageId(prefix: string, index: number) {
  return `${prefix}-${Date.now()}-${index}`;
}

function toPersonFact(profile: ReturnType<typeof useMobileProfileState>["profile"]): PersonFact {
  return {
    id: profile.id || "local-profile",
    name: profile.name || "我的档案",
    birthday: profile.birthDate,
    birthTime: profile.birthTimeKnown ? profile.birthTime : "",
    birthTimeAccuracy: profile.birthTimeKnown ? "exact" : "unknown",
    birthPlace: profile.birthPlace,
    avatarColor: "#9B80D8",
    avatarChar: profile.name?.trim().slice(0, 1) || "我",
  };
}

function toInitialMessages(turns: MobileChatTurn[]): ChatMsg[] {
  let latestQuestion = "";
  const messages: ChatMsg[] = [];
  turns.forEach((turn, index) => {
    if (turn.role === "user") {
      latestQuestion = turn.content;
      messages.push({
        id: turn.id || messageId("user", index),
        role: "user",
        text: turn.content,
        status: "sent",
        ts: Date.parse(turn.createdAt) || Date.now() + index,
      });
      return;
    }
    if (turn.answer.delivery?.source !== "api") return;
    messages.push({
      id: turn.id || messageId("assistant", index),
      role: "assistant",
      questionText: latestQuestion,
      reply: {
        title: turn.answer.title,
        summary: turn.answer.summary,
        observations: turn.answer.observations,
        action: turn.answer.action,
        suggestions: turn.answer.suggestions,
        sourceAnswer: turn.answer,
      },
      status: "done",
      ts: Date.parse(turn.createdAt) || Date.now() + index,
    });
  });
  return messages;
}

export function ChatV6App() {
  const router = useRouter();
  const { profile } = useMobileProfileState();
  const profileId = profile.id || "local-profile";
  const persistedTurns = useMobileChatHistory(profileId);
  const [demoTurns, setDemoTurns] = useState<MobileChatTurn[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const turns = profile.isDemo ? demoTurns : persistedTurns;
  const initialMessages = useMemo(() => toInitialMessages(turns), [turns]);
  const person = useMemo(() => toPersonFact(profile), [profile]);

  const sendMessage = useCallback(async (question: string): Promise<ChatReply> => {
    const answer = await requestMobileChatAnswer(profile, question, turns);
    if (answer.delivery?.source !== "api") {
      throw new Error("在线解读暂时没有生成成功，请稍后再试。");
    }
    return {
      title: answer.title,
      summary: answer.summary,
      observations: answer.observations,
      action: answer.action,
      suggestions: answer.suggestions,
      sourceAnswer: answer,
    };
  }, [profile, turns]);

  const persistMessages = useCallback((messages: ChatMsg[]) => {
    const next: MobileChatTurn[] = [];
    for (const message of messages) {
      if (message.role === "user" && message.text) {
        next.push({ id: message.id, role: "user", content: message.text, createdAt: new Date(message.ts).toISOString() });
      }
      if (message.role === "assistant" && message.status === "done" && message.reply) {
        if (!message.reply.sourceAnswer) continue;
        next.push({
          id: message.id,
          role: "assistant",
          createdAt: new Date(message.ts).toISOString(),
          answer: message.reply.sourceAnswer,
        });
      }
    }
    const trimmed = next.slice(-24);
    if (profile.isDemo) setDemoTurns(trimmed);
    else saveMobileChatHistory(profileId, trimmed);
  }, [profile.isDemo, profileId]);

  function clearHistory() {
    if (profile.isDemo) setDemoTurns([]);
    else clearMobileChatHistory(profileId);
    setHistoryOpen(false);
  }

  return (
    <MobileShell active="tools" theme="home" appearance="figma-v22">
      <div className="xsc-v4 xsc-chat-v6">
        <ChatScreen
          userProfile={person}
          initialMessages={initialMessages}
          onSendMessage={sendMessage}
          onMessagesChange={persistMessages}
          onBack={() => router.push("/m/tools")}
          onOpenHistory={() => setHistoryOpen(true)}
        />
        {historyOpen ? (
          <div className="xsc-chat-history" role="dialog" aria-modal="true" aria-label="问答记录">
            <button className="xsc-chat-history__backdrop" type="button" onClick={() => setHistoryOpen(false)} aria-label="关闭记录" />
            <section className="glass-deep">
              <header>
                <div><small>最近的对话</small><h2>问答记录</h2></div>
                <button type="button" onClick={() => setHistoryOpen(false)} aria-label="关闭"><X /></button>
              </header>
              <div className="xsc-chat-history__list">
                {turns.filter((turn) => turn.role === "user").length ? turns.filter((turn) => turn.role === "user").map((turn) => (
                  <p key={turn.id}>{turn.role === "user" ? turn.content : ""}</p>
                )) : <p className="xsc-chat-history__empty">还没有留下对话。先说说你现在最想理清的事。</p>}
              </div>
              {turns.length ? <button className="xsc-chat-history__clear" type="button" onClick={clearHistory}><Trash2 />清空记录</button> : null}
            </section>
          </div>
        ) : null}
      </div>
    </MobileShell>
  );
}
