"use client";

import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Fingerprint,
  Gauge,
  HeartHandshake,
  ImageDown,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { buildMobileBaziReport } from "@/lib/mobile/buildMobileBaziReport";
import { buildMobileFlowReport } from "@/lib/mobile/buildMobileFlowReport";
import { insightDataAdapter } from "@/lib/mobile/insightDataAdapter";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { useNarrativeCard } from "@/lib/narrative/client";
import type { NarrativeRequest } from "@/lib/narrative/contracts";
import { ContinueExploring } from "./ContinueExploring";
import { ExpandableTextCard } from "./ExpandableTextCard";
import { MobileShell } from "./MobileShell";
import { ReportBrandBar } from "./ReportBrandBar";
import { MobileReveal } from "./Reveal";
import { QuestionInsightSheet } from "./QuestionInsightSheet";
import { FiveElementsChart, LuckTrendChart, TenGodChart } from "./ReportCharts";
import { ShareInsightCard } from "./ShareInsightCard";
import { SharePosterSheet } from "./SharePosterSheet";
import { StickySegmentTabs } from "./StickySegmentTabs";
import { useReportPersistence } from "./useReportPersistence";
import { ProfileSwitcherSheet } from "./ProfileSwitcherSheet";
import { ReportDataScope } from "./ReportDataScope";
import { ReportReadingGuide } from "./ReportReadingGuide";
import { ReportDepthPrompt, ReportReadingModeSwitch, type ReportReadingMode } from "./ReportReadingModeSwitch";

type BaziTab = "bazi" | "flow";

const tabs = [
  { id: "bazi", label: "生辰" },
  { id: "flow", label: "流盘" },
  { id: "zodiac", label: "星座", href: "/m/report/zodiac" },
  { id: "ziwei", label: "紫微", href: "/m/report/ziwei" },
];

const conclusionIcons = [BriefcaseBusiness, HeartHandshake, WalletCards];

export function BaziReportPage({ initialTab = "bazi" }: { initialTab?: BaziTab }) {
  const [tab, setTab] = useState<BaziTab>(initialTab);
  const profile = useMobileProfile();
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [profileSwitcherOpen, setProfileSwitcherOpen] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);
  const [readingMode, setReadingMode] = useState<ReportReadingMode>("quick");
  const baziReport = useMemo(() => buildMobileBaziReport(profile), [profile]);
  const baziQuestions = useMemo(() => insightDataAdapter.getQuestions("bazi", profile), [profile]);
  const flowReport = useMemo(() => buildMobileFlowReport(profile), [profile]);
  const baziNarrativeInput = useMemo<NarrativeRequest>(() => ({
    context: "bazi",
    slot: "hero",
    signals: [
      `dominant:${baziReport.evidence.strongest[0] || "unknown"}`,
      `weak:${baziReport.evidence.weakest[0] || "unknown"}`,
    ],
    facts: [
      { label: "日主", value: baziReport.identity.dayLabel },
      { label: "主要力量", value: baziReport.identity.strongestLabel },
      { label: "需要补充", value: baziReport.identity.weakestLabel },
      { label: "高频表现", value: baziReport.identity.patternScene },
    ],
    fallback: {
      hook: baziReport.identity.pattern,
      scene: baziReport.identity.patternScene,
      misunderstanding: baziReport.identity.coverReading.note,
      evidenceSummary: baziReport.identity.basis,
      action: baziReport.todayAction.title,
      nextQuestion: baziQuestions[0]?.prompt || "什么样的环境更容易让我发挥？",
    },
  }), [baziQuestions, baziReport]);
  const baziNarrative = useNarrativeCard(baziNarrativeInput)!;
  const baziPosters: SharePosterData[] = useMemo(() => baziReport.shareInsights.map((item) => ({
    id: `bazi-${item.id}`,
    category: "personality",
    eyebrow: item.eyebrow,
    title: item.id === "poster" ? baziNarrative.hook : item.title,
    body: item.id === "poster" ? baziNarrative.scene : item.body,
    tags: baziReport.identity.tags,
    footer: item.footer,
    tone: item.tone,
  })), [baziNarrative, baziReport]);
  const activePosters = tab === "flow" ? [flowReport.poster] : baziPosters;
  const baziUsed = [
    `${profile.calendarType === "lunar" ? "农历" : "公历"}出生日期`,
    profile.birthTimeKnown && profile.birthTime ? `出生时间 ${profile.birthTime}` : "三柱结构",
    profile.gender !== "other" ? "排盘性别" : "",
  ].filter(Boolean);
  const baziExcluded = [
    !profile.birthTimeKnown || !profile.birthTime ? "出生时辰与时柱" : "",
    "出生地点未做真太阳时换算",
    "现实经历与个人选择",
  ].filter(Boolean);
  useReportPersistence(tab === "bazi" ? "bazi" : "liupan", tab === "bazi" ? undefined : flowReport as unknown as Record<string, unknown>, tab === "bazi" ? "market-v1" : flowReport.engineVersion);

  useEffect(() => {
    trackMobileEvent("report_view", { reportType: tab === "flow" ? "liupan" : "bazi", profileKind: profile.isDemo ? "demo" : "local" });
  }, [profile.isDemo, tab]);

  function openPoster(index = 0) {
    setPosterIndex(index);
    setPosterOpen(true);
  }

  function handleTab(id: string) {
    if (id === "bazi" || id === "flow") setTab(id);
  }

  return (
    <MobileShell active="bazi" theme="bazi">
      <ReportBrandBar profileName={profile.name} onProfileClick={() => setProfileSwitcherOpen(true)} />
      <StickySegmentTabs tabs={tabs} active={tab} onChange={handleTab} label="生辰报告分类" />

      <div className={`market-report market-report--${tab}`} data-reading-mode={readingMode}>
      {tab === "bazi" ? (
        <>
          <section id="bazi-summary" className="bazi-cover-card">
            <header><span><Fingerprint />{baziReport.identity.dayPillar}日 · 行动方式</span><small>生活里的高频表现</small></header>
            <h1>{baziNarrative.hook}</h1>
            <p className="bazi-cover-lead">{baziNarrative.scene}</p>
            <div className="bazi-cover-tags">{baziReport.identity.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="bazi-cover-basis"><small>容易被误解的地方</small><strong>{baziReport.identity.coverReading.title}</strong><p>{baziNarrative.misunderstanding}</p></div>
          </section>

          {baziReport.calculation.warnings.length ? (
            <section className="report-boundary"><CalendarClock /><p>{baziReport.calculation.warnings.join(" ")}</p></section>
          ) : null}

          <section className="bazi-today-action">
            <small>这对今天意味着什么</small>
            <h2>{baziNarrative.action}</h2>
            <p>{baziReport.todayAction.note}</p>
            <button type="button" onClick={() => openPoster(2)}><ImageDown />生成今日提醒图</button>
          </section>

          <ReportDataScope used={baziUsed} excluded={baziExcluded} engine={baziReport.calculation.engine} />
          <ReportReadingModeSwitch mode={readingMode} onChange={setReadingMode} />
          <ReportReadingGuide reportId={`bazi:${profile.id || "local"}`} sections={[
            { id: "bazi-summary", label: "总览" },
            { id: "five-elements", label: "五行" },
            { id: "luck-trend", label: "阶段" },
            ...(readingMode === "professional" ? [
              { id: "bazi-habits", label: "十神" },
              { id: "reading-bazi", label: "解读" },
              { id: "professional-chart", label: "盘面" },
            ] : []),
          ]} />

          <ContinueExploring question={baziQuestions[0]} onSelect={setSelectedQuestion} label="先从环境问题继续" />

          <section id="share-bazi" className="share-story-section share-story-section--bazi share-story-section--after-cover">
            <header><small>一句话人格卡</small><h2>先保存最像你的这一句</h2></header>
            <MobileReveal><ShareInsightCard item={baziReport.shareInsights[0]} onShare={() => openPoster(0)} /></MobileReveal>
            <button type="button" className="share-poster-picker" onClick={() => openPoster(0)}>选择其他分享图<ArrowRight /></button>
          </section>

          <MobileReveal>
            <section className="bazi-structure-card">
              <div className="bazi-structure-kicker"><Gauge /><span>可见结构 · 白话结论</span></div>
              <h2>{baziReport.identity.pattern}</h2>
              <p>{baziReport.identity.patternEvidence}</p>
              <p>{baziReport.identity.patternScene}</p>
              <div className="bazi-structure-boundary">{baziReport.identity.patternBoundary}</div>
              <footer><span>结构重点</span><strong>{baziReport.identity.supportElements.join(" · ")}</strong><small>主要力量 · 待补能力</small></footer>
            </section>
          </MobileReveal>

          <MobileReveal>
            <section id="five-elements" className="bazi-section-card">
              <header className="report-section-heading">
                <div><small>力量去向</small><h2>你的力量通常会流向哪里</h2></div>
                <span>{baziReport.identity.strongestLabel}最先被看见</span>
              </header>
              <p className="element-flow-intro">数字不是好坏评分，而是在提醒你：表达和行动更容易先出现，稳定与判断则决定能不能持续。</p>
              <FiveElementsChart data={baziReport.elements} />
              <div className="element-legend">
                {baziReport.elements.map((item) => (
                  <div key={item.key}><i style={{ backgroundColor: item.color }} /><span>{item.label} {item.value}%</span><small>{item.meaning}</small></div>
                ))}
              </div>
            </section>
          </MobileReveal>

          <ContinueExploring question={baziQuestions[1]} onSelect={setSelectedQuestion} label="看见关系里的真实需要" />

          <section className="bazi-conclusion-stack">
            {baziReport.lightConclusions.map((item, index) => {
              const Icon = conclusionIcons[index];
              return (
                <MobileReveal key={item.title} delay={index * 0.04}>
                  <article>
                    <header><span><Icon />{item.eyebrow}</span><small>{item.highlight}</small></header>
                    <h3>{item.title}</h3>
                    <strong>{item.value}</strong>
                    <p>{item.note}</p>
                    <footer>玄枢 · 生辰结构观察</footer>
                  </article>
                </MobileReveal>
              );
            })}
          </section>

          <MobileReveal>
            <section id="luck-trend" className="bazi-section-card">
              <header className="report-section-heading"><div><small>大运趋势</small><h2>不同阶段的发力方式</h2></div><CalendarClock /></header>
              <LuckTrendChart data={baziReport.luckTrend} />
              <div className="luck-keywords">{baziReport.luckTrend.map((item) => <span key={item.age}>{item.age}<strong>{item.keyword}</strong></span>)}</div>
              <p className="report-caption">趋势用来观察阶段节奏，不代表某一年一定好或坏。</p>
            </section>
          </MobileReveal>

          <ContinueExploring question={baziQuestions[2]} onSelect={setSelectedQuestion} label="把趋势落到一个具体选择" />

          {readingMode === "quick" ? <ReportDepthPrompt title="继续查看十神、长文解读和四柱盘面" note="专业内容保留完整，但不会默认占满你的阅读路径。" onOpen={() => setReadingMode("professional")} /> : null}

          <MobileReveal>
            <section id="bazi-habits" className="bazi-section-card report-depth--professional">
              <header className="report-section-heading"><div><small>行为结构</small><h2>你处理人和事的习惯</h2></div><Sparkles /></header>
              <div className="ten-god-top-three">
                {baziReport.tenGods.slice(0, 3).map((item, index) => <article key={item.name}><small>TOP {index + 1}</small><strong>{item.name}</strong><span>{item.value}%</span><p>{item.note}</p></article>)}
              </div>
              <TenGodChart data={baziReport.tenGods} />
              <div className="ten-god-notes">
                {baziReport.tenGods.slice(3).map((item) => <p key={item.name}><strong>{item.name}</strong><span>{item.note}</span></p>)}
              </div>
            </section>
          </MobileReveal>

          <ContinueExploring question={baziQuestions[3]} onSelect={setSelectedQuestion} label="识别最容易消耗你的部分" />

          <section id="reading-bazi" className="report-reading-section report-depth--professional">
            <header><small>基础解读</small><h2>先理解术语，再看它与你的关系</h2></header>
            {baziReport.readings.map((item) => <MobileReveal key={item.id}><ExpandableTextCard item={item} /></MobileReveal>)}
          </section>

          <MobileReveal>
            <section id="professional-chart" className="professional-table-section report-depth--professional">
              <header><div><small>专业命盘</small><h2>四柱结构明细</h2></div><span>左右滑动查看</span></header>
              <details className="professional-table-help"><summary>怎么看这张表</summary><p>先看日柱，它更接近你处理事情的惯用方式；再看月柱，理解你进入环境后的适应节奏。神煞只作传统文化娱乐参考，不作为判断依据。</p></details>
              <div className="professional-table-scroll" tabIndex={0} aria-label="可横向滚动的四柱命盘表">
                <table>
                  <thead><tr>{baziReport.pillars.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                  <tbody>{baziReport.pillars.rows.map((row) => <tr key={row[0]} className={row[0] === "神煞" ? "is-reference-row" : ""}>{row.map((cell, index) => index === 0 ? <th key={cell}>{cell}{cell === "神煞" ? <small>娱乐参考</small> : null}</th> : <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </section>
          </MobileReveal>

          <section className="report-boundary"><CheckCircle2 /><p>这份报告用于传统文化研究、娱乐和自我探索。涉及健康、法律、投资或重大人生决定时，请结合现实信息与专业意见。</p></section>
        </>
      ) : (
        <FlowPanel report={flowReport} onAsk={() => setSelectedQuestion(flowReport.question)} />
      )}
      </div>

      <QuestionInsightSheet key={selectedQuestion?.id ?? "bazi-question"} open={Boolean(selectedQuestion)} question={selectedQuestion} questions={selectedQuestion?.id === flowReport.question.id ? [flowReport.question, ...baziQuestions] : baziQuestions} onClose={() => setSelectedQuestion(null)} />
      <SharePosterSheet key={`bazi-poster-${posterOpen}-${posterIndex}-${tab}`} open={posterOpen} onClose={() => setPosterOpen(false)} items={activePosters} initialIndex={posterIndex} />
      <ProfileSwitcherSheet open={profileSwitcherOpen} onClose={() => setProfileSwitcherOpen(false)} />

    </MobileShell>
  );
}

function FlowPanel({ report, onAsk }: { report: ReturnType<typeof buildMobileFlowReport>; onAsk: () => void }) {
  const [titleLead, titleFocus] = report.title.split("，");
  const focusLength = titleFocus && titleFocus.length > 5 ? 3 : 2;
  const focusLead = titleFocus ? titleFocus.slice(0, -focusLength) : "";
  const focusKeyword = titleFocus ? titleFocus.slice(-focusLength) : "";
  return (
    <section className="flow-page">
      <header className="flow-hero">
        <Image src="/mobile/style-lab-assets/flow-hero-instrument.png" alt="" aria-hidden="true" width={511} height={330} priority sizes="220px" />
        <small>{report.dateLabel}</small>
        <h1>{titleLead}{titleFocus ? "，" : ""}<br />{titleFocus ? <span>{focusLead}<strong>{focusKeyword}</strong></span> : null}</h1>
        <p>{report.summary}</p>
      </header>
      <section className="flow-matrix-section">
        <header><h2>当前盘面</h2><span>{report.periodLabel}</span></header>
        <div className="flow-matrix">
          {report.columns.map((item, index) => <div key={item.label} className={index === 2 ? "is-current" : ""}><small>{item.label}</small><strong>{item.value}</strong><span>{item.note}</span></div>)}
        </div>
      </section>
      <section className="flow-focus-card">
        <header><span><Gauge /></span><div><small>{report.focus.eyebrow}</small><h2>{report.focus.title}</h2></div></header><p>{report.focus.note}</p>
        <div><span>适合推进<strong>{report.focus.suitable}</strong></span><span>需要留意<strong>{report.focus.caution}</strong></span></div>
      </section>
      <section className="flow-months"><header><small>近四个月</small><h2>每个月的关注重点</h2></header>{report.months.map((item, index) => <MobileReveal key={`${item.month}-${item.stem}`} delay={index * 0.04}><article className={item.isCurrent ? "is-current" : ""}><div><small>{item.month}</small><strong>{item.stem}</strong></div><span>{item.theme}</span><p>{item.note}</p><ArrowRight aria-hidden="true" /></article></MobileReveal>)}</section>
      <motion.button type="button" className="flow-ask-button" onClick={onAsk} whileTap={{ scale: 0.98 }}><Sparkles />{report.question.prompt}<ArrowRight /></motion.button>
      <section className="report-boundary"><CheckCircle2 /><p>阶段提示仅供文化娱乐和自我探索，不应作为投资、健康、法律或职业决定的唯一依据。</p></section>
    </section>
  );
}
