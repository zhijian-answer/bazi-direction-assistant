"use client";

import { ArrowRight, Compass } from "lucide-react";
import { startMobileTiming, trackMobileEvent } from "@/lib/mobile/analytics";
import type { QuestionInsightData } from "@/lib/mobile/types";

export function ContinueExploring({ question, onSelect, label = "顺着这个问题继续看" }: { question: QuestionInsightData; onSelect: (question: QuestionInsightData) => void; label?: string }) {
  function selectQuestion() {
    startMobileTiming("question_sheet_open");
    trackMobileEvent("question_click", { questionId: question.id, context: question.context });
    onSelect(question);
  }

  return (
    <button type="button" className="continue-exploring" onClick={selectQuestion}>
      <Compass />
      <span><small>{label}</small><strong>{question.prompt}</strong></span>
      <ArrowRight />
    </button>
  );
}
