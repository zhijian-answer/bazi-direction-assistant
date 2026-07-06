"use client";

import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Coins, Heart, MessageCircleMore, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { startMobileTiming, trackMobileEvent } from "@/lib/mobile/analytics";
import type { QuestionInsightData } from "@/lib/mobile/types";
import orbitMark from "../../../public/mobile/xuanshu-orbit-mark.webp";

const homeQuestionPresentation: Record<string, { title: string; note: string; icon: typeof BriefcaseBusiness }> = {
  "home-work": { title: "事业进展如何？", note: "把握节奏，找准发力点", icon: BriefcaseBusiness },
  "home-relationship": { title: "感情有何变化？", note: "看见关系，理解彼此", icon: Heart },
  "home-action": { title: "现在该主动吗？", note: "判断节奏，再决定出手", icon: Coins },
  "home-energy": { title: "为什么总觉得累？", note: "看见消耗，重新分配精力", icon: UserRound },
  "home-choice": { title: "财富机会在哪？", note: "识别趋势，稳中求进", icon: Coins },
  "home-today": { title: "我的状态如何？", note: "能量评估，调整身心", icon: UserRound },
};

export function QuestionPromptGrid({ questions, onSelect, title = "今天你想先问哪件事", compact = false }: { questions: QuestionInsightData[]; onSelect: (question: QuestionInsightData) => void; title?: string; compact?: boolean }) {
  const visibleQuestions = compact ? questions : questions.slice(0, 4);

  function selectQuestion(question: QuestionInsightData) {
    startMobileTiming("question_sheet_open");
    trackMobileEvent("question_click", { questionId: question.id, context: question.context });
    onSelect(question);
  }

  return (
    <section className={`question-prompt-section ${compact ? "question-prompt-section--compact" : ""}`}>
      <header><span><MessageCircleMore />继续探索</span><h2>{title}</h2></header>
      <div className="question-prompt-grid">
        {visibleQuestions.map((question) => {
          if (compact) {
            return (
              <motion.button key={question.id} type="button" onClick={() => selectQuestion(question)} whileTap={{ scale: 0.98 }}>
                <span>{question.shortLabel}</span><ArrowUpRight />
              </motion.button>
            );
          }

          const presentation = homeQuestionPresentation[question.id];
          const Icon = presentation?.icon ?? MessageCircleMore;
          return (
            <motion.button key={question.id} type="button" onClick={() => selectQuestion(question)} whileTap={{ scale: 0.98 }}>
              <span className="question-prompt-orbit" aria-hidden="true"><Image src={orbitMark} alt="" /><Icon /></span>
              <span className="question-prompt-copy"><strong>{presentation?.title ?? question.shortLabel}</strong><small>{presentation?.note ?? question.action}</small></span>
              <ArrowRight />
            </motion.button>
          );
        })}
      </div>
    </section>
  );
}
