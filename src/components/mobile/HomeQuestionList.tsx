"use client";

import { ArrowRight, MessageCircleMore } from "lucide-react";
import Link from "next/link";
import { startMobileTiming, trackMobileEvent } from "@/lib/mobile/analytics";
import type { QuestionInsightData } from "@/lib/mobile/types";

export function HomeQuestionList({ questions, onSelect }: { questions: QuestionInsightData[]; onSelect: (question: QuestionInsightData) => void }) {
  const visibleQuestions = questions.slice(0, 2);

  function selectQuestion(question: QuestionInsightData) {
    startMobileTiming("question_sheet_open");
    trackMobileEvent("question_click", { questionId: question.id, context: question.context, source: "home_v2" });
    onSelect(question);
  }

  return (
    <section className="home-v2-questions" aria-labelledby="home-v2-questions-title">
      <header><h2 id="home-v2-questions-title">现在想先理清什么？</h2><Link href="/m/chat">更多问题<ArrowRight /></Link></header>
      <div className="home-v2-question-list">
        {visibleQuestions.map((question) => {
          return (
            <button type="button" key={question.id} onClick={() => selectQuestion(question)}>
              <strong>{question.prompt}</strong>
              <ArrowRight />
            </button>
          );
        })}
      </div>
      <Link className="home-v2-questions__custom" href="/m/chat"><MessageCircleMore />自己写下一个问题<ArrowRight /></Link>
    </section>
  );
}
