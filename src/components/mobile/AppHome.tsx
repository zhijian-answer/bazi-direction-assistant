"use client";

import { ArrowRight, CalendarRange, Compass, Plus, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { formatDailyDate } from "@/lib/mobile/dailyInsightCatalog";
import { insightDataAdapter } from "@/lib/mobile/insightDataAdapter";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { MobileReveal } from "./Reveal";
import { MobileShell } from "./MobileShell";
import { QuestionInsightSheet } from "./QuestionInsightSheet";
import { QuestionPromptGrid } from "./QuestionPromptGrid";
import { SharePosterSheet } from "./SharePosterSheet";
import { TodayStatusCard } from "./TodayStatusCard";

export function AppHome() {
  const profile = useMobileProfile();
  const daily = useMemo(() => insightDataAdapter.getDailyInsight(profile), [profile]);
  const questions = useMemo(() => insightDataAdapter.getQuestions("home", profile), [profile]);
  const impressionTracked = useRef(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const todayPoster: SharePosterData = {
    id: `daily-${daily.id}`,
    category: "daily",
    eyebrow: `${formatDailyDate()} · 今日提醒`,
    title: daily.title,
    body: `${daily.summary} ${daily.action}`,
    tags: daily.tags,
    footer: "今日内容同一天保持不变，第二天自然更新",
    tone: "sage",
  };

  useEffect(() => {
    if (impressionTracked.current) return;
    impressionTracked.current = true;
    const frame = window.requestAnimationFrame(() => trackMobileEvent("home_hero_impression", { dailyId: daily.id, dataSource: insightDataAdapter.source }));
    return () => window.cancelAnimationFrame(frame);
  }, [daily.id]);

  return (
    <MobileShell active="home" theme="home">
      <header className="app-home-header app-home-header--daily">
        <div className="app-home-brand">
          <span aria-hidden="true">玄</span>
          <div><strong>玄枢</strong><small>{profile.name} · 今日结构观察</small></div>
        </div>
        <Link href="/m/create" className="app-create-button"><Plus />切换档案</Link>
      </header>

      <MobileReveal>
        <TodayStatusCard insight={daily} dateLabel={formatDailyDate()} onShare={() => setPosterOpen(true)} />
      </MobileReveal>

      <MobileReveal>
        <QuestionPromptGrid questions={questions} onSelect={setSelectedQuestion} />
      </MobileReveal>

      <section className="continue-home-section">
        <header><small>继续上次的阅读</small><h2>从一个已经出现的线索继续</h2></header>
        <div>
          <Link href="/m/report/bazi#five-elements"><span><CalendarRange />生辰</span><strong>什么环境更容易让我稳定发挥？</strong><ArrowRight /></Link>
          <Link href="/m/report/zodiac#relationships"><span><Sparkles />星座</span><strong>我在关系里真正需要什么？</strong><ArrowRight /></Link>
        </div>
      </section>

      <section className="home-report-section">
        <header><small>我的报告</small><h2>需要完整理解时，再进入报告</h2></header>
        <div>
          <motion.div whileTap={{ scale: 0.985 }}><Link href="/m/report/bazi"><CalendarRange /><span><small>生辰人格</small><strong>看见你的稳定区与消耗区</strong></span><ArrowRight /></Link></motion.div>
          <motion.div whileTap={{ scale: 0.985 }}><Link href="/m/report/zodiac"><Sparkles /><span><small>星座人格</small><strong>看见关系里的反应与需要</strong></span><ArrowRight /></Link></motion.div>
        </div>
      </section>

      <footer className="app-home-boundary"><Compass /><p>内容来自本地结构化内容库，用于传统文化研究、娱乐和自我探索，不是实时 AI，也不替代专业意见。</p></footer>

      <QuestionInsightSheet key={selectedQuestion?.id ?? "home-question"} open={Boolean(selectedQuestion)} question={selectedQuestion} questions={questions} onClose={() => setSelectedQuestion(null)} />
      <SharePosterSheet key={`home-poster-${posterOpen}`} open={posterOpen} onClose={() => setPosterOpen(false)} items={[todayPoster]} />
    </MobileShell>
  );
}
