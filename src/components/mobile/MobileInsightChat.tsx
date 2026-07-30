"use client";

import { ArrowLeft, ArrowRight, BookOpenText, ImageDown, MessageCircleMore, RotateCcw, Send, ShieldCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import { buildMobileChatAnswer, mobileChatStarters, type MobileChatAnswer } from "@/lib/mobile/chatEngine";
import { clearMobileChatHistory, saveMobileChatHistory, useMobileChatHistory, type MobileChatTurn } from "@/lib/mobile/chatHistory";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { useMobileProfileState } from "@/lib/mobile/profile";
import { MobileShell } from "./MobileShell";
import { SharePosterSheet } from "./SharePosterSheet";
import styles from "./MobileInsightChat.module.css";

function nowId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function MobileInsightChat() {
  const { profile, hasProfile } = useMobileProfileState();
  const profileId = profile.id || "local-profile";
  const persistedTurns = useMobileChatHistory(profileId);
  const [demoTurns, setDemoTurns] = useState<MobileChatTurn[]>([]);
  const turns = profile.isDemo ? demoTurns : persistedTurns;
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [shareAnswer, setShareAnswer] = useState<MobileChatAnswer | null>(null);
  const endRef = useRef<HTMLDivElement>(null);
  const trackedProfileRef = useRef("");

  function persistTurns(next: MobileChatTurn[]) {
    if (profile.isDemo) setDemoTurns(next.slice(-24));
    else saveMobileChatHistory(profileId, next);
  }

  useEffect(() => {
    if (!hasProfile || trackedProfileRef.current === profileId) return;
    trackedProfileRef.current = profileId;
    trackMobileEvent("chat_open", { profileId, hasHistory: turns.length > 0 });
  }, [hasProfile, profileId, turns.length]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [busy, turns]);

  async function ask(question: string) {
    const cleanQuestion = question.trim();
    if (busy || cleanQuestion.length < 2) return;
    const userTurn: MobileChatTurn = { id: nowId("user"), role: "user", content: cleanQuestion, createdAt: new Date().toISOString() };
    const withQuestion = [...turns, userTurn].slice(-24);
    persistTurns(withQuestion);
    setInput("");
    setError("");
    setBusy(true);
    trackMobileEvent("chat_question_submit", { profileId, length: cleanQuestion.length });

    try {
      const answer = await buildMobileChatAnswer(profile, cleanQuestion);
      const assistantTurn: MobileChatTurn = { id: nowId("assistant"), role: "assistant", answer, createdAt: new Date().toISOString() };
      const next = [...withQuestion, assistantTurn].slice(-24);
      persistTurns(next);
      trackMobileEvent("chat_answer_ready", { profileId, category: answer.category, evidenceCount: answer.evidence.length, limitationCount: answer.limitations.length });
    } catch (answerError) {
      const message = answerError instanceof Error ? answerError.message : "暂时无法整理这条问题，请稍后再试。";
      setError(message);
      trackMobileEvent("chat_answer_failure", { profileId, reason: message.slice(0, 60) });
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(input);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void ask(input);
    }
  }

  function resetConversation() {
    if (profile.isDemo) setDemoTurns([]);
    else clearMobileChatHistory(profileId);
    setError("");
  }

  if (!hasProfile) {
    return (
      <MobileShell active="tools" theme="home">
        <main className={styles.page}>
          <header className={styles.topbar}><Link href="/m" aria-label="返回首页"><ArrowLeft /></Link><strong>问题解读</strong><span /></header>
          <section className={styles.noProfile}>
            <span><MessageCircleMore /></span>
            <small>需要一份可追溯的出生档案</small>
            <h1>先建立档案，再开始提问</h1>
            <p>问题解读会使用你的生辰、星座、流盘和可用的紫微依据，不会套用默认出生资料。</p>
            <Link href="/m/create">创建我的档案<ArrowRight /></Link>
          </section>
        </main>
      </MobileShell>
    );
  }

  return (
    <MobileShell active="tools" theme="home">
      <main className={styles.page}>
        <header className={styles.topbar}>
          <Link href="/m" aria-label="返回首页"><ArrowLeft /></Link>
          <div><strong>问玄枢</strong><small>{profile.name}的结构化解读</small></div>
          <button type="button" onClick={resetConversation} disabled={busy} aria-label="清空当前对话" title="清空当前对话"><RotateCcw /></button>
        </header>

        <section className={styles.intro}>
          <span className={styles.introIcon}><Sparkles /></span>
          <div><small>直接说你现在想了解的事</small><h1>先看命盘依据，再给出一个能执行的回答</h1></div>
          <p>这里不是确定性预测。资料不足时，系统会主动排除不能确认的部分。</p>
          {profile.isDemo ? <aside className={styles.demoNotice}>当前是示例问答。可以完整体验提问与分享，但本次对话不会保存到历史记录。</aside> : null}
        </section>

        {!turns.length ? (
          <section className={styles.starters} aria-label="常见问题">
            <header><MessageCircleMore /><div><small>可以从这里开始</small><strong>你现在最想先看哪件事？</strong></div></header>
            <div>{mobileChatStarters.map((starter) => <button type="button" key={starter} onClick={() => void ask(starter)}>{starter}<ArrowRight /></button>)}</div>
          </section>
        ) : null}

        <section className={styles.messages} aria-live="polite" aria-busy={busy}>
          {turns.map((turn) => turn.role === "user" ? (
            <div className={styles.userTurn} key={turn.id}><p>{turn.content}</p></div>
          ) : (
            <article className={styles.answer} key={turn.id}>
              <header><span><Sparkles />结构化解读</span><small>{turn.answer.evidence.length} 组可用依据</small></header>
              <h2>{turn.answer.title}</h2>
              <p className={styles.summary}>{turn.answer.summary}</p>
              <div className={styles.observations}>
                <small>你可以这样观察</small>
                {turn.answer.observations.map((observation) => <p key={observation}>{observation}</p>)}
              </div>
              <aside className={styles.action}><ShieldCheck /><div><small>现在可以怎么做</small><strong>{turn.answer.action}</strong></div></aside>
              <details className={styles.evidence}>
                <summary><BookOpenText />查看这条回答用了什么依据</summary>
                <div>{turn.answer.evidence.map((item) => (
                  <section key={`${item.system}-${item.label}`}>
                    <header><strong>{item.system}</strong><small>{item.engine}</small></header>
                    <p>{item.label}：{item.value}</p>
                    <span>{item.detail}</span>
                  </section>
                ))}</div>
              </details>
              {turn.answer.limitations.length ? <div className={styles.limitations}><small>资料边界</small>{turn.answer.limitations.map((item) => <p key={item}>{item}</p>)}</div> : null}
              <div className={styles.answerActions}>
                <button type="button" onClick={() => setShareAnswer(turn.answer)}><ImageDown />生成分享图</button>
              </div>
              <div className={styles.followUps}><small>继续问</small>{turn.answer.suggestions.map((item) => <button type="button" key={item} onClick={() => void ask(item)}>{item}<ArrowRight /></button>)}</div>
            </article>
          ))}
          {busy ? <div className={styles.thinking}><span /><span /><span /><p>正在整理当前档案中的可用依据</p></div> : null}
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
          <div ref={endRef} />
        </section>

        <form className={styles.composer} onSubmit={submit}>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value.slice(0, 240))}
            onKeyDown={handleKeyDown}
            placeholder="例如：我最近适合主动推进工作吗？"
            aria-label="输入你想了解的问题"
            rows={1}
          />
          <button type="submit" disabled={busy || input.trim().length < 2} aria-label="发送问题"><Send /></button>
        </form>
        <p className={styles.boundary}>仅供传统文化研究与自我观察，不作为医疗、法律、投资或重大关系决定依据。</p>
      </main>
      {shareAnswer ? <SharePosterSheet open onClose={() => setShareAnswer(null)} items={[shareAnswer.poster]} /> : null}
    </MobileShell>
  );
}
