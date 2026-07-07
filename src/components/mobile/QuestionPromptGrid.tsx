"use client";

import { ArrowRight, ArrowUpRight, BriefcaseBusiness, Coins, Heart, MessageCircleMore, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { startMobileTiming, trackMobileEvent } from "@/lib/mobile/analytics";
import type { QuestionInsightData } from "@/lib/mobile/types";
import orbitMark from "../../../public/mobile/xuanshu-orbit-mark.webp";

const homeQuestionPresentation: Record<string, { title: string; note: string; icon: typeof BriefcaseBusiness }> = {
  "home-work": { title: "手上的事该怎么推进？", note: "看主线、反馈和下一步", icon: BriefcaseBusiness },
  "home-relationship": { title: "这段关系要继续投入吗？", note: "看回应，而不是只看感觉", icon: Heart },
  "home-action": { title: "现在适合主动一点吗？", note: "先判断节奏，再决定出手", icon: Coins },
  "home-energy": { title: "为什么最近总觉得累？", note: "看见消耗，重新分配精力", icon: UserRound },
  "home-choice": { title: "两个选择先看什么？", note: "先看成本、边界和回报", icon: Coins },
  "home-today": { title: "今天最该先做哪件事？", note: "把状态落成一个动作", icon: UserRound },
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
