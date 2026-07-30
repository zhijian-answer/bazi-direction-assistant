"use client";

import { ChevronDown, Compass } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { formatDailyDate } from "@/lib/mobile/dailyInsightCatalog";
import { insightDataAdapter } from "@/lib/mobile/insightDataAdapter";
import { activateDemoProfile, useMobileProfileState } from "@/lib/mobile/profile";
import { isValidProfileBirthDate } from "@/lib/mobile/profileCapabilities";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { MobileReveal } from "./Reveal";
import { MobileShell } from "./MobileShell";
import { QuestionInsightSheet } from "./QuestionInsightSheet";
import { SharePosterSheet } from "./SharePosterSheet";
import { HomeWelcome } from "./HomeWelcome";
import { ProfileSwitcherSheet } from "./ProfileSwitcherSheet";
import { DemoProfileBanner, ProfileRouteGuard } from "./ProfileRouteGuard";
import { HomeDailyHero } from "./HomeDailyHero";
import { HomeQuestionList } from "./HomeQuestionList";
import { HomeReportGateway } from "./HomeReportGateway";
import { HomeTodayFocus } from "./HomeTodayFocus";
import orbitMark from "../../../public/mobile/xuanshu-orbit-mark.webp";
import Image from "next/image";

export function AppHome() {
  const { profile, hasProfile } = useMobileProfileState();
  const canCalculate = hasProfile && isValidProfileBirthDate(profile);
  const daily = useMemo(() => canCalculate ? insightDataAdapter.getDailyInsight(profile) : null, [canCalculate, profile]);
  const questions = useMemo(() => canCalculate ? insightDataAdapter.getQuestions("home", profile) : [], [canCalculate, profile]);
  const impressionTracked = useRef(false);
  const openTracked = useRef(false);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [profileSwitcherOpen, setProfileSwitcherOpen] = useState(false);
  const profileLabel = profile.name.replace(/^示例[:：]\s*/, "") || "当前档案";
  const todayPoster: SharePosterData | null = daily ? {
    id: `daily-${daily.id}`,
    category: "daily",
    eyebrow: `${formatDailyDate()} · 今日提醒`,
    title: daily.title,
    body: `${daily.summary} ${daily.action}`,
    tags: daily.tags,
    footer: "今日内容同一天保持不变，第二天自然更新",
    tone: "sage",
  } : null;

  useEffect(() => {
    if (openTracked.current) return;
    openTracked.current = true;
    trackMobileEvent("app_open", { hasProfile, profileKind: profile.isDemo ? "demo" : hasProfile ? "local" : "none" });
    if (!hasProfile) trackMobileEvent("onboarding_start", { source: "first_open" });
  }, [hasProfile, profile.isDemo]);

  useEffect(() => {
    if (!hasProfile || !daily) return;
    if (impressionTracked.current) return;
    impressionTracked.current = true;
    const frame = window.requestAnimationFrame(() => trackMobileEvent("home_hero_impression", { dailyId: daily.id, dataSource: insightDataAdapter.source }));
    return () => window.cancelAnimationFrame(frame);
  }, [daily, hasProfile]);

  if (!hasProfile) {
    return (
      <MobileShell withNav={false} active="home" theme="home">
        <HomeWelcome onDemo={activateDemoProfile} />
      </MobileShell>
    );
  }

  if (!daily || !todayPoster) return <ProfileRouteGuard><></></ProfileRouteGuard>;

  return (
    <>{profile.isDemo ? <DemoProfileBanner /> : null}<MobileShell active="home" theme="home">
      <div className="home-v2">
        <header className="home-v2-header">
          <div className="home-v2-brand">
            <span aria-hidden="true"><Image src={orbitMark} alt="" priority /></span>
            <div><strong>玄枢</strong><small>让命理，被科学看见</small></div>
          </div>
          <button type="button" className="home-v2-profile" onClick={() => setProfileSwitcherOpen(true)}>
            <span><small>当前档案</small><strong>{profileLabel}</strong></span>
            <ChevronDown />
          </button>
        </header>

        <MobileReveal><HomeDailyHero insight={daily} dateLabel={formatDailyDate()} onShare={() => setPosterOpen(true)} /></MobileReveal>
        <MobileReveal delay={0.04}><HomeTodayFocus insight={daily} /></MobileReveal>
        <MobileReveal delay={0.07}><HomeQuestionList questions={questions} onSelect={setSelectedQuestion} /></MobileReveal>
        <MobileReveal delay={0.1}><HomeReportGateway /></MobileReveal>

        <footer className="home-v2-boundary"><Compass /><p>内容用于传统文化研究、娱乐和自我观察，不作为重大决定的唯一依据。</p></footer>
      </div>

      <QuestionInsightSheet key={selectedQuestion?.id ?? "home-question"} open={Boolean(selectedQuestion)} question={selectedQuestion} questions={questions} onClose={() => setSelectedQuestion(null)} />
      <SharePosterSheet key={`home-poster-${posterOpen}`} open={posterOpen} onClose={() => setPosterOpen(false)} items={[todayPoster]} />
      <ProfileSwitcherSheet open={profileSwitcherOpen} onClose={() => setProfileSwitcherOpen(false)} />
    </MobileShell></>
  );
}
