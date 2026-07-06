"use client";

import { AlertCircle, ArrowRight, CheckCircle2, CircleDotDashed, Gauge, HeartHandshake, ImageDown, Orbit, Settings2, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildZiweiPosters, buildZiweiQuestions, mobileProfileToZiweiInput } from "@/lib/mobile/ziweiAdapter";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { QuestionInsightData } from "@/lib/mobile/types";
import type { ZiweiCalculationResult } from "@/lib/ziwei/contracts";
import { calculateZiweiInsight } from "@/lib/ziwei/service";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { MobileShell } from "./MobileShell";
import { MobileTopBar } from "./MobileTopBar";
import { MobileReveal } from "./Reveal";
import { QuestionInsightSheet } from "./QuestionInsightSheet";
import { QuestionPromptGrid } from "./QuestionPromptGrid";
import { SharePosterSheet } from "./SharePosterSheet";
import { StickySegmentTabs } from "./StickySegmentTabs";
import { ZiweiPalaceMap } from "./ZiweiPalaceMap";
import { useReportPersistence } from "./useReportPersistence";
import { ProfileSwitcherSheet } from "./ProfileSwitcherSheet";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";

const tabs = [
  { id: "bazi", label: "生辰", href: "/m/report/bazi" },
  { id: "zodiac", label: "星座", href: "/m/report/zodiac" },
  { id: "ziwei", label: "紫微" },
];

export function ZiweiReportPage() {
  const profile = useMobileProfile();
  const profileKey = JSON.stringify([profile.calendarType, profile.birthDate, profile.birthTime, profile.birthTimeKnown, profile.gender, profile.isLeapMonth]);
  const [calculation, setCalculation] = useState<{ profileKey: string; result: ZiweiCalculationResult } | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [profileSwitcherOpen, setProfileSwitcherOpen] = useState(false);

  useEffect(() => {
    let active = true;
    calculateZiweiInsight(mobileProfileToZiweiInput(profile)).then((next) => {
      if (active) setCalculation({ profileKey, result: next });
    });
    return () => { active = false; };
  }, [profile, profileKey]);

  useEffect(() => {
    trackMobileEvent("report_view", { reportType: "ziwei", profileKind: profile.isDemo ? "demo" : "local" });
  }, [profile.isDemo]);

  const result = calculation?.profileKey === profileKey ? calculation.result : null;
  const insight = result?.status === "ready" ? result.insight : null;
  const questions = useMemo(() => insight ? buildZiweiQuestions(insight) : [], [insight]);
  const posters = useMemo(() => insight ? buildZiweiPosters(insight) : [], [insight]);
  useReportPersistence("ziwei", insight as unknown as Record<string, unknown> | undefined, "iztro-market-v1");

  useEffect(() => {
    if (result?.status === "insufficient_input") trackMobileEvent("insufficient_data_show", { reportType: "ziwei", reasons: result.reasons.join(",") });
  }, [result]);

  return (
    <MobileShell theme="ziwei" active="home">
      <MobileTopBar title={profile.name} onProfileClick={() => setProfileSwitcherOpen(true)} onShare={insight ? () => setPosterOpen(true) : undefined} />
      <StickySegmentTabs tabs={tabs} active="ziwei" label="报告类型" />

      <div className="market-report market-report--ziwei">
      {!result ? <ZiweiLoading /> : null}
      {result?.status === "insufficient_input" ? <ZiweiUnavailable reasons={result.reasons} /> : null}
      {result?.status === "calculation_error" ? <ZiweiError message={result.message} /> : null}

      {insight ? (
        <>
          <header className="ziwei-report-heading">
            <small>紫微领域报告</small>
            <h1>紫微报告</h1>
            <p>从十二个人生领域观察精力分布、行动重心与恢复方式。</p>
          </header>

          <section className="ziwei-cover-card">
            <Image className="ziwei-cover-instrument" src={armillaryImage} alt="" aria-hidden="true" priority sizes="390px" />
            <header><span><CircleDotDashed />玄枢 · 紫微领域观察</span><small>依据真实出生时辰</small></header>
            <p className="ziwei-cover-kicker">人生领域分布</p>
            <h2><span>紫微看的是</span><strong>你的人生领域分布</strong></h2>
            <p>这张盘里，当前最值得观察的是工作主线、关系回应和恢复方式。你最近更适合先守住一个能产生反馈的主线，再决定是否开启新的方向。</p>
            <div><span>工作主线</span><span>关系回应</span><span>恢复方式</span></div>
            <footer><small>今日关注</small><strong>{insight.today.keyword}</strong><span>{insight.today.action}</span></footer>
          </section>

          <MobileReveal>
            <section className="ziwei-domain-overview">
              <header className="ziwei-section-heading"><div><small>领域总览</small><h2>先看这张盘的三个重点</h2></div><span><Orbit /></span></header>
              <p>不要同时解决所有问题。先看精力主要落在哪里，再决定今天应该推进、确认还是休息。</p>
              <div className="ziwei-domain-brief">
                <div><span><Gauge /></span><small>工作主线</small><strong>完成一件能产生反馈的任务</strong></div>
                <div><span><HeartHandshake /></span><small>关系回应</small><strong>先确认回应是否持续</strong></div>
                <div><span><ShieldCheck /></span><small>恢复方式</small><strong>回到边界清楚、节奏稳定的环境</strong></div>
              </div>
            </section>
          </MobileReveal>

          <MobileReveal delay={0.05}>
            <section className="ziwei-palace-section">
              <header className="ziwei-section-heading"><div><small>十二宫结构</small><h2>简化十二宫结构</h2></div><span><CircleDotDashed /></span></header>
              <ZiweiPalaceMap mingGong={insight.evidence.mingGong} shenGong={insight.evidence.shenGong} />
              <p className="ziwei-palace-note">先看高亮的命宫、官禄、夫妻与福德：它们分别对应底层气质、工作主线、关系回应和恢复方式。</p>
            </section>
          </MobileReveal>

          <MobileReveal delay={0.08}>
            <section className="ziwei-focus-instrument">
              <header className="ziwei-section-heading"><div><small>领域重点</small><h2>领域重点仪表</h2></div><span><Gauge /></span></header>
              <div className="ziwei-focus-tracks">
                <div className="ziwei-focus-track ziwei-focus-track--work"><span>工作主线</span><i /><strong>先守住</strong></div>
                <div className="ziwei-focus-track ziwei-focus-track--relation"><span>关系回应</span><i /><strong>先确认</strong></div>
                <div className="ziwei-focus-track ziwei-focus-track--recovery"><span>恢复方式</span><i /><strong>先回稳</strong></div>
              </div>
            </section>
          </MobileReveal>

          <section className="ziwei-life-grid">
            <MobileReveal><article><header><Gauge />工作主线</header><h2>先把已有积累变成反馈</h2><p>{insight.stage.summary}</p><strong>别急着开新方向，先完成一件能带来反馈的关键任务。</strong></article></MobileReveal>
            <MobileReveal><article><header><HeartHandshake />关系回应</header><h2>先确认事实，再决定投入多少</h2><p>{insight.relationship.summary}</p><strong>提出一个具体问题，观察回应是否持续。</strong></article></MobileReveal>
            <MobileReveal><article><header><ShieldCheck />恢复方式</header><h2>回到能让你稳定发挥的条件</h2><ul>{insight.environment.stableZone.map((item) => <li key={item}>{item}</li>)}</ul></article></MobileReveal>
            <MobileReveal><article><header><AlertCircle />需要减少的消耗</header><h2>不是每件事都要立刻得到答案</h2><ul>{insight.environment.drainZone.map((item) => <li key={item}>{item}</li>)}</ul></article></MobileReveal>
          </section>

          <section className="ziwei-question-section">
            <QuestionPromptGrid questions={questions} onSelect={setSelectedQuestion} title="现在最想先看懂哪一件事" compact />
          </section>

          <section className="ziwei-share-card">
            <small>保存这一刻的观察</small><h2>把领域重点封存成一张图</h2><p>分享图只保留白话结论、行动建议和必要边界，不展示复杂专业盘。</p>
            <button className="xs-pressable" type="button" onClick={() => setPosterOpen(true)}><ImageDown />生成紫微分享图</button>
          </section>

          <section className="ziwei-evidence-card">
            <header><Sparkles /><div><small>专业依据</small><h2>结论来自哪些结构</h2></div></header>
            <details><summary>查看命盘证据</summary><dl><div><dt>命宫</dt><dd>{insight.evidence.mingGong || "未识别"}</dd></div><div><dt>身宫</dt><dd>{insight.evidence.shenGong || "未识别"}</dd></div><div><dt>重点星曜</dt><dd>{insight.evidence.majorStars.join("、") || "空宫，结合对宫观察"}</dd></div><div><dt>四化</dt><dd>{insight.evidence.mutagens.join("、") || "未提取"}</dd></div><div><dt>计算引擎</dt><dd>{insight.evidence.engine} {insight.evidence.engineVersion} · {insight.evidence.license}</dd></div></dl></details>
          </section>

          <section className="report-boundary"><CheckCircle2 /><p>紫微内容用于传统文化研究、娱乐和自我观察。它描述的是结构倾向，不预测具体事件，也不替代现实信息和专业意见。</p></section>
        </>
      ) : null}
      </div>

      <QuestionInsightSheet key={selectedQuestion?.id || "ziwei-question"} open={Boolean(selectedQuestion)} question={selectedQuestion} questions={questions} onClose={() => setSelectedQuestion(null)} />
      {posters.length ? <SharePosterSheet key={`ziwei-poster-${posterOpen}`} open={posterOpen} onClose={() => setPosterOpen(false)} items={posters} /> : null}
      <ProfileSwitcherSheet open={profileSwitcherOpen} onClose={() => setProfileSwitcherOpen(false)} />
    </MobileShell>
  );
}

function ZiweiLoading() {
  return <section className="ziwei-state"><CircleDotDashed className="is-spinning" /><strong>正在整理紫微领域结构</strong><p>只在本地计算，不调用远程 AI。</p></section>;
}

function ZiweiUnavailable({ reasons }: { reasons: string[] }) {
  const needsTime = reasons.includes("birth_time_unknown") || reasons.includes("invalid_birth_time");
  return <section className="ziwei-state ziwei-state--notice"><AlertCircle /><strong>完整紫微报告还需要补充资料</strong><p>{needsTime ? "紫微十二宫依赖出生时辰，我们不会用中午或随机时间代替。" : "紫微运限方向需要明确排盘所需性别，当前资料不足。"}</p><Link href="/m/create"><Settings2 />补充出生资料<ArrowRight /></Link><Link href="/m/report/bazi" className="is-secondary">先看生辰报告</Link></section>;
}

function ZiweiError({ message }: { message: string }) {
  return <section className="ziwei-state ziwei-state--notice"><AlertCircle /><strong>暂时没有生成成功</strong><p>{message}</p><Link href="/m/create"><Settings2 />检查出生资料<ArrowRight /></Link></section>;
}
