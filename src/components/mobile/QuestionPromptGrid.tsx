"use client";

import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  BriefcaseBusiness,
  Coins,
  Compass,
  Flower2,
  Heart,
  HeartHandshake,
  MessageCircleMore,
  ShieldCheck,
  UserRound,
} from "lucide-react";
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

const zodiacQuestionPresentation: Record<string, { title: string; note: string; icon: typeof BriefcaseBusiness }> = {
  "zodiac-attraction": { title: "会喜欢谁", note: "你容易被怎样的人吸引", icon: HeartHandshake },
  "zodiac-fear": { title: "关系里怕什么", note: "什么会让你收回自己", icon: ShieldCheck },
  "zodiac-hot-cold": { title: "为何忽冷忽热", note: "看见情绪反复的底层原因", icon: Activity },
  "zodiac-relax": { title: "谁让我放松", note: "和谁一起更像真实的自己", icon: Flower2 },
  "zodiac-initiative": { title: "主动还是被动", note: "看清关系里的行动节奏", icon: Compass },
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
            const presentation = zodiacQuestionPresentation[question.id];
            if (presentation) {
              const Icon = presentation.icon;
              return (
                <motion.button className="question-prompt-card--zodiac" key={question.id} type="button" onClick={() => selectQuestion(question)} whileTap={{ scale: 0.98 }}>
                  <span className="question-prompt-compact-icon" aria-hidden="true"><Icon /></span>
                  <span className="question-prompt-compact-copy"><strong>{presentation.title}</strong><small>{presentation.note}</small></span>
                  <ArrowUpRight className="question-prompt-compact-arrow" />
                </motion.button>
              );
            }

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
