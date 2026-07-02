"use client";

import { ArrowUpRight, MessageCircleMore } from "lucide-react";
import { motion } from "framer-motion";
import { startMobileTiming, trackMobileEvent } from "@/lib/mobile/analytics";
import type { QuestionInsightData } from "@/lib/mobile/types";

export function QuestionPromptGrid({ questions, onSelect, title = "今天你想先问哪件事", compact = false }: { questions: QuestionInsightData[]; onSelect: (question: QuestionInsightData) => void; title?: string; compact?: boolean }) {
  function selectQuestion(question: QuestionInsightData) {
    startMobileTiming("question_sheet_open");
    trackMobileEvent("question_click", { questionId: question.id, context: question.context });
    onSelect(question);
  }

  return (
    <section className={`question-prompt-section ${compact ? "question-prompt-section--compact" : ""}`}>
      <header><span><MessageCircleMore />继续探索</span><h2>{title}</h2></header>
      <div className="question-prompt-grid">
        {questions.map((question) => (
          <motion.button key={question.id} type="button" onClick={() => selectQuestion(question)} whileTap={{ scale: 0.98 }}>
            <span>{question.shortLabel}</span><ArrowUpRight />
          </motion.button>
        ))}
      </div>
    </section>
  );
}
