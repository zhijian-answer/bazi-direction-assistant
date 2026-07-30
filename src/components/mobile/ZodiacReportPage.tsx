"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  CloudSun,
  Eye,
  Heart,
  HeartHandshake,
  ImageDown,
  MessagesSquare,
  Orbit,
  Sparkles,
  Waves,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useState, type CSSProperties } from "react";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { buildMobileZodiacReport } from "@/lib/mobile/buildMobileZodiacReport";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { useNarrativeCard } from "@/lib/narrative/client";
import type { NarrativeRequest } from "@/lib/narrative/contracts";
import { signName } from "@/lib/zodiac/contentCatalog";
import { ExpandableTextCard } from "./ExpandableTextCard";
import { InlineShareButton } from "./InlineShareButton";
import { MobileShell } from "./MobileShell";
import { ReportBrandBar } from "./ReportBrandBar";
import { ReadingReminderCard } from "./ReadingReminderCard";
import { MobileReveal } from "./Reveal";
import { QuestionInsightSheet } from "./QuestionInsightSheet";
import { QuestionPromptGrid } from "./QuestionPromptGrid";
import { ZodiacPeakChart } from "./ReportCharts";
import { ShareInsightCard } from "./ShareInsightCard";
import { SharePosterSheet } from "./SharePosterSheet";
import { StickySegmentTabs } from "./StickySegmentTabs";
import { useReportPersistence } from "./useReportPersistence";
import { ProfileSwitcherSheet } from "./ProfileSwitcherSheet";
import { ReportDataScope } from "./ReportDataScope";
import { ReportReadingGuide } from "./ReportReadingGuide";
import { ReportDepthPrompt, ReportReadingModeSwitch, type ReportReadingMode } from "./ReportReadingModeSwitch";

const domainTabs = [
  { id: "bazi", label: "生辰", href: "/m/report/bazi" },
  { id: "zodiac", label: "星座" },
  { id: "chart", label: "星盘", href: "/m/chart" },
  { id: "ziwei", label: "紫微", href: "/m/report/ziwei" },
];

const corePlanetAssets = [
  "/mobile/style-lab-assets/zodiac-core-sun.png",
  "/mobile/style-lab-assets/zodiac-core-moon.png",
  "/mobile/style-lab-assets/zodiac-core-rising.png",
];
const traitIcons = [Eye, Waves, HeartHandshake, Heart, MessagesSquare, CircleAlert];

export function ZodiacReportPage() {
  const profile = useMobileProfile();
  const zodiacReport = useMemo(() => buildMobileZodiacReport(profile), [profile]);
  const zodiacQuestions = zodiacReport.questions;
  const whyConfiguration = zodiacReport.whyConfiguration;
  const zodiacNarrativeInput = useMemo<NarrativeRequest>(() => ({
    context: "zodiac",
    slot: "hero",
    signals: [
      `sun:${zodiacReport.signs.sun}`,
      `moon:${zodiacReport.signs.moon || "unknown"}`,
      `rising:${zodiacReport.signs.rising || "unknown"}`,
    ],
    facts: [
      { label: "太阳", value: signName(zodiacReport.signs.sun) },
      { label: "月亮", value: zodiacReport.signs.moon ? signName(zodiacReport.signs.moon) : "资料不足" },
      { label: "上升", value: zodiacReport.signs.rising ? signName(zodiacReport.signs.rising) : "资料不足" },
      { label: "组合表现", value: zodiacReport.highlight.note },
    ],
    fallback: {
      hook: zodiacReport.highlight.statistic,
      scene: zodiacReport.identity.subtitle,
      misunderstanding: zodiacReport.whyConfiguration.observation,
      evidenceSummary: zodiacReport.whyConfiguration.source,
      action: zodiacReport.daily.title,
      nextQuestion: zodiacReport.whyConfiguration.prompt,
    },
  }), [zodiacReport]);
  const zodiacNarrative = useNarrativeCard(zodiacNarrativeInput)!;
  const zodiacSharePosters: SharePosterData[] = useMemo(() => zodiacReport.shareInsights.map((item) => ({
    id: `zodiac-${item.id}`,
    category: "zodiac",
    eyebrow: item.eyebrow,
    title: item.id === "memory" ? zodiacNarrative.hook : item.title,
    body: item.id === "memory" ? zodiacNarrative.scene : item.body,
    tags: zodiacReport.identity.tags,
    footer: item.footer,
    tone: item.tone,
  })), [zodiacNarrative, zodiacReport]);
  const zodiacDailyPoster: SharePosterData = useMemo(() => ({
    id: "zodiac-energy-today",
    category: "zodiac",
    eyebrow: "今日星座结构提醒",
    title: zodiacReport.daily.title,
    body: zodiacReport.daily.note,
    tags: zodiacReport.peaks.slice(0, 3).map((item) => `${item.name} ${item.value}`),
    footer: zodiacReport.identity.tags.join(" · "),
    tone: "sky",
  }), [zodiacReport]);
  useReportPersistence("zodiac", zodiacReport as unknown as Record<string, unknown>, "zodiac-engine-1.1.0");
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [profileSwitcherOpen, setProfileSwitcherOpen] = useState(false);
  const [posterItems, setPosterItems] = useState<SharePosterData[]>([]);
  const [posterIndex, setPosterIndex] = useState(0);
  const [readingMode, setReadingMode] = useState<ReportReadingMode>("quick");
  const zodiacUsed = [
    "公历出生日期",
    zodiacReport.completeness.hasTime ? `出生时间 ${profile.birthTime}` : "仅使用不依赖时辰的星体位置",
    zodiacReport.completeness.hasLocation ? `出生地点 ${zodiacReport.completeness.locationLabel}` : "不使用个人宫位",
  ];
  const zodiacExcluded = [
    !zodiacReport.completeness.hasTime ? "上升与宫位" : "",
    !zodiacReport.completeness.hasLocation ? "地点相关宫位计算" : "",
    "现实经历与个人选择",
  ].filter(Boolean);

  useEffect(() => {
    trackMobileEvent("report_view", { reportType: "zodiac", profileKind: profile.isDemo ? "demo" : "local", partial: zodiacReport.completeness.isPartial });
    if (zodiacReport.completeness.isPartial) trackMobileEvent("insufficient_data_show", { reportType: "zodiac", hasTime: zodiacReport.completeness.hasTime, hasLocation: zodiacReport.completeness.hasLocation });
  }, [profile.isDemo, zodiacReport.completeness.hasLocation, zodiacReport.completeness.hasTime, zodiacReport.completeness.isPartial]);

  function openPoster(items: SharePosterData[], index = 0) {
    setPosterItems(items);
    setPosterIndex(index);
    setPosterOpen(true);
  }

  function customPoster(title: string, body: string, tone: SharePosterData["tone"] = "violet"): SharePosterData {
    return { id: `zodiac-${title}`, category: "zodiac", eyebrow: "我的星座人格", title, body, tags: zodiacReport.identity.tags, footer: "让命理，被科学看见", tone };
  }

  function openProfessionalReading() {
    setReadingMode("professional");
    window.requestAnimationFrame(() => document.getElementById("reading-zodiac")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  }

  return (
    <MobileShell active="zodiac" theme="zodiac">
      <ReportBrandBar profileName={profile.name} onProfileClick={() => setProfileSwitcherOpen(true)} />
      <StickySegmentTabs tabs={domainTabs} active="zodiac" label="报告类型" />

      <div className="market-report market-report--zodiac" data-reading-mode={readingMode}>
      <section id="zodiac-summary" className="zodiac-overview-frame">
      <section className="zodiac-cover-intro">
        <Image className="zodiac-cover-instrument" src="/mobile/style-lab-assets/zodiac-hero-instrument.png" alt="" aria-hidden="true" width={476} height={390} priority sizes="210px" />
        <div><small><Orbit />太阳 · 月亮 · 上升</small><span>你在不同场景里的样子</span></div>
        <h1 title={zodiacNarrative.hook}>{zodiacNarrative.hook}</h1>
        <p>{zodiacNarrative.scene}</p>
        <div className="zodiac-cover-core">
          {zodiacReport.core.slice(0, 3).map((item) => <span key={item.title}><small>{item.title}</small><strong>{item.value.split(/[，,。；;]/)[0]}</strong></span>)}
        </div>
      </section>

      {zodiacReport.completeness.isPartial ? <section className="zodiac-partial-note"><CircleAlert /><div><strong>当前为部分星座报告</strong><p>{zodiacReport.completeness.warning}</p><span>补充准确时辰和建议城市后，会自动更新完整配置。</span></div></section> : null}

      <ReportDataScope used={zodiacUsed} excluded={zodiacExcluded} engine={zodiacReport.completeness.engine} />
      <ReportReadingModeSwitch mode={readingMode} onChange={setReadingMode} />
      <ReportReadingGuide reportId={`zodiac:${profile.id || "local"}`} sections={[
        { id: "zodiac-summary", label: "总览" },
        { id: "zodiac-energy", label: "能量" },
        { id: "relationships", label: "关系" },
        { id: "zodiac-daily", label: "今日" },
        ...(readingMode === "professional" ? [
          { id: "traits", label: "场景" },
          { id: "reading-zodiac", label: "解读" },
        ] : []),
      ]} />

      <MobileReveal>
        <section id="zodiac-energy" className="zodiac-highlight-card">
          <header><div><Sparkles /><span>{zodiacReport.highlight.title}</span></div><button type="button" onClick={() => setSelectedQuestion(whyConfiguration)}>为什么<ArrowRight /></button></header>
          <h2>{zodiacReport.highlight.statistic}</h2>
          <p>{zodiacReport.highlight.note}</p>
          <ZodiacPeakChart data={zodiacReport.peaks} />
          <div className="zodiac-highlight-meta">{zodiacReport.peaks.map((item) => <span key={item.name} style={{ "--peak": `${item.value}%`, "--peak-color": item.color } as CSSProperties}><i />{item.name}<b /><strong>{item.value}%</strong></span>)}</div>
          <footer>
            <span>太阳 · {signName(zodiacReport.signs.sun)}</span>
            <span>月亮 · {zodiacReport.signs.moon ? signName(zodiacReport.signs.moon) : "待确认"}</span>
            <span>上升 · {zodiacReport.signs.rising ? signName(zodiacReport.signs.rising) : "待补充"}</span>
          </footer>
        </section>
      </MobileReveal>

      <section className="zodiac-core-grid">
        {zodiacReport.core.map((item, index) => {
          return (
            <MobileReveal key={item.title} delay={index * 0.04}>
              <motion.article whileTap={{ scale: 0.985 }}>
                <Image className="zodiac-core-planet" src={corePlanetAssets[index]} alt="" aria-hidden="true" width={286} height={154} sizes="116px" />
                <div className="zodiac-core-card-top"><span>{item.title}</span><InlineShareButton title={item.value} onShare={() => openPoster([customPoster(item.value, item.note)])} /></div>
                <small>{item.title}</small>
                <strong>{item.value.split(/[，,。；;]/)[0]}</strong>
                <p>{item.note}</p>
                <button className="zodiac-core-expand" type="button" onClick={openProfessionalReading}>
                  展开解读<ChevronDown />
                </button>
              </motion.article>
            </MobileReveal>
          );
        })}
      </section>

      <div id="relationships"><QuestionPromptGrid questions={zodiacQuestions} onSelect={setSelectedQuestion} title="关系里，你最想先看懂哪一件事" compact /></div>
      </section>

      <section id="traits" className="zodiac-traits-section report-depth--professional">
        <header><small>六个被看见的瞬间</small><h2>不同场景里的你，都是真的</h2></header>
        <div>
          {zodiacReport.traits.map((item, index) => {
            const Icon = traitIcons[index];
            return <MobileReveal key={item.title} delay={(index % 2) * 0.04}>
              <motion.article className={`zodiac-trait-card zodiac-trait-card--${index + 1}`} whileTap={{ scale: 0.985, y: -2 }}>
                <header><span><Icon />{item.title}</span><div><small>{item.highlight}</small><InlineShareButton title={item.value} onShare={() => openPoster([customPoster(item.value, item.note, index % 2 ? "sky" : "violet")])} /></div></header>
                <strong>{item.value}</strong><p>{item.note}</p>
                <footer>玄枢 · 星座人格观察</footer>
              </motion.article>
            </MobileReveal>;
          })}
        </div>
      </section>

      <MobileReveal>
        <section id="zodiac-daily" className="zodiac-daily-card">
          <div className="zodiac-daily-icon"><CloudSun /></div>
          <small>今日提醒</small>
          <h2>{zodiacReport.daily.title}</h2>
          <p>{zodiacReport.daily.note}</p>
          <dl><div><dt>结构色彩</dt><dd>{zodiacReport.daily.luckyColor}</dd></div><div><dt>适合做的事</dt><dd>{zodiacReport.daily.suitable}</dd></div></dl>
          <button type="button" className="zodiac-energy-share" onClick={() => openPoster([zodiacDailyPoster])}><ImageDown />生成星座能量图</button>
        </section>
      </MobileReveal>

      {readingMode === "quick" ? <ReportDepthPrompt title="继续查看六类生活场景与星体长文" note="需要术语、星体依据和完整解读时，再切换到专业内容。" onOpen={() => setReadingMode("professional")} /> : null}

      <section id="share-zodiac" className="share-story-section share-story-section--zodiac">
        <header><small>适合分享的我</small><h2>一张卡，说清一个被理解的瞬间</h2></header>
        <MobileReveal><ShareInsightCard item={zodiacReport.shareInsights[0]} onShare={() => openPoster(zodiacSharePosters, 0)} /></MobileReveal>
        <button type="button" className="share-poster-picker share-poster-picker--zodiac" onClick={() => openPoster(zodiacSharePosters, 0)}>选择其他分享图<ArrowRight /></button>
      </section>

      <section id="reading-zodiac" className="report-reading-section report-reading-section--zodiac report-depth--professional">
        <header><small>星座解读</small><h2>从一句解释开始，慢慢看懂自己</h2></header>
        {zodiacReport.readings.map((item, index) => {
          const reminder = zodiacReport.readingReminders.find((entry) => entry.after === index);
          return <Fragment key={item.id}><MobileReveal><ExpandableTextCard item={item} tone="zodiac" /></MobileReveal>{reminder ? <ReadingReminderCard title={reminder.title} note={reminder.note} /> : null}</Fragment>;
        })}
      </section>

      <section className="report-boundary report-boundary--zodiac"><CheckCircle2 /><p>星座内容用于娱乐与自我观察，不定义性格，也不替代现实沟通、专业判断与个人选择。</p></section>
      </div>

      <QuestionInsightSheet key={selectedQuestion?.id ?? "zodiac-question"} open={Boolean(selectedQuestion)} question={selectedQuestion} questions={selectedQuestion?.id === whyConfiguration.id ? [whyConfiguration, ...zodiacQuestions] : zodiacQuestions} onClose={() => setSelectedQuestion(null)} />
      <SharePosterSheet key={`zodiac-poster-${posterOpen}-${posterItems[0]?.id}-${posterIndex}`} open={posterOpen} onClose={() => setPosterOpen(false)} items={posterItems} initialIndex={posterIndex} />
      <ProfileSwitcherSheet open={profileSwitcherOpen} onClose={() => setProfileSwitcherOpen(false)} />

    </MobileShell>
  );
}
