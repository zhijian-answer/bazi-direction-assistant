"use client";

import { ArrowRight, ImageDown, RefreshCw, Sparkles } from "lucide-react";
import { useRef, useState } from "react";
import { finishMobileTiming, trackMobileEvent } from "@/lib/mobile/analytics";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { MobileSheet } from "./MobileSheet";
import { SharePosterSheet } from "./SharePosterSheet";

const ziweiPosterTitles: Record<string, string> = {
  "ziwei-focus": "你最近最该守住的是工作主线",
  "ziwei-relationship": "关系里，先确认回应再继续投入",
  "ziwei-work": "先守住主线，再小范围验证变化",
  "ziwei-control": "你想要的不是掌控，而是确定边界",
  "ziwei-recovery": "恢复状态，要先回到稳定节奏",
};

function questionPoster(question: QuestionInsightData): SharePosterData {
  return {
    id: `question-${question.id}`,
    category: question.context === "ziwei" ? "ziwei" : "question",
    eyebrow: question.context === "ziwei" ? "紫微领域 · 当前结论" : "结构观察 · 当前结论",
    title: ziweiPosterTitles[question.id] || question.action,
    body: question.context === "ziwei" && question.id === "ziwei-focus" ? "别急着开新方向，先完成一件能带来反馈的关键任务。" : `${question.interpretation} ${question.action}`,
    tags: question.context === "ziwei" ? ["紫微领域", "可观察表现", "一个行动"] : ["直白解读", "可观察表现", "一个行动"],
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
      <MobileSheet open={open} title="这件事可以怎么理解" onClose={onClose} onOpened={trackOpened}>
        <article className="question-insight-sheet">
          <header><span><Sparkles />当前观察</span><h2>{current.prompt}</h2><p>{current.source}</p></header>
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
