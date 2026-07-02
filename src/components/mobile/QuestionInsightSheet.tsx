"use client";

import { ArrowRight, ImageDown, RefreshCw, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { finishMobileTiming, trackMobileEvent } from "@/lib/mobile/analytics";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { MobileSheet } from "./MobileSheet";
import { SharePosterSheet } from "./SharePosterSheet";

function questionPoster(question: QuestionInsightData): SharePosterData {
  return {
    id: `question-${question.id}`,
    category: "question",
    eyebrow: "一个值得继续观察的问题",
    title: question.prompt,
    body: `${question.interpretation} ${question.action}`,
    tags: ["直白解读", "可观察表现", "一个行动"],
    footer: question.source,
    tone: question.tone,
  };
}

export function QuestionInsightSheet({ open, question, questions, onClose }: { open: boolean; question: QuestionInsightData | null; questions: QuestionInsightData[]; onClose: () => void }) {
  const [current, setCurrent] = useState<QuestionInsightData | null>(question);
  const [posterOpen, setPosterOpen] = useState(false);
  const openTracked = useRef(false);

  function trackOpened() {
    if (!open || !current || openTracked.current) return;
    openTracked.current = true;
    trackMobileEvent("question_sheet_open", { questionId: current.id, context: current.context }, finishMobileTiming("question_sheet_open"));
  }

  function changeQuestion() {
    if (!current || !questions.length) return;
    const index = questions.findIndex((item) => item.id === current.id);
    const next = questions[(index + 1) % questions.length];
    trackMobileEvent("question_change", { fromId: current.id, toId: next.id, context: current.context });
    setCurrent(next);
  }

  if (!current) return null;

  return (
    <>
      <MobileSheet open={open} title="问题解读" onClose={onClose} onOpened={trackOpened}>
        <article className="question-insight-sheet">
          <header><span><Sparkles />你正在看的问题</span><h2>{current.prompt}</h2><p>{current.source}</p></header>
          <section><small>直白解读</small><p>{current.interpretation}</p></section>
          <section><small>你可以观察</small><p>{current.observation}</p></section>
          <aside><small>现在可以怎么做</small><strong>{current.action}</strong></aside>
          <div className="question-insight-actions">
            <button type="button" onClick={() => setPosterOpen(true)}><ImageDown />生成分享卡</button>
            <button type="button" onClick={changeQuestion}><RefreshCw />换一个问题</button>
            <button type="button" onClick={onClose}>关闭<ArrowRight /></button>
          </div>
        </article>
      </MobileSheet>
      <SharePosterSheet open={posterOpen} onClose={() => setPosterOpen(false)} items={[questionPoster(current)]} />
    </>
  );
}
