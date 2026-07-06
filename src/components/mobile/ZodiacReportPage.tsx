"use client";

import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  CloudSun,
  Eye,
  Heart,
  HeartHandshake,
  ImageDown,
  MessageCircleMore,
  MessagesSquare,
  Moon,
  Orbit,
  Sparkles,
  Sun,
  Sunrise,
  Waves,
} from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { buildMobileZodiacReport } from "@/lib/mobile/buildMobileZodiacReport";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { signName } from "@/lib/zodiac/contentCatalog";
import { ExpandableTextCard } from "./ExpandableTextCard";
import { InlineShareButton } from "./InlineShareButton";
import { MobileSheet } from "./MobileSheet";
import { MobileShell } from "./MobileShell";
import { MobileTopBar } from "./MobileTopBar";
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
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";

const domainTabs = [
  { id: "sandbox", label: "沙盘", disabled: true },
  { id: "zodiac", label: "星座" },
  { id: "bazi", label: "生辰", href: "/m/report/bazi" },
  { id: "stars", label: "星宿", disabled: true },
  { id: "ziwei", label: "紫微", href: "/m/report/ziwei" },
  { id: "zhengyu", label: "政余", disabled: true },
];

const coreIcons = [Sun, Moon, Sunrise];
const traitIcons = [Eye, Waves, HeartHandshake, Heart, MessagesSquare, CircleAlert];

export function ZodiacReportPage() {
  const profile = useMobileProfile();
  const zodiacReport = useMemo(() => buildMobileZodiacReport(profile), [profile]);
  const zodiacQuestions = zodiacReport.questions;
  const whyConfiguration = zodiacReport.whyConfiguration;
  const zodiacSharePosters: SharePosterData[] = useMemo(() => zodiacReport.shareInsights.map((item) => ({
    id: `zodiac-${item.id}`,
    category: "zodiac",
    eyebrow: item.eyebrow,
    title: item.title,
    body: item.body,
    tags: zodiacReport.identity.tags,
    footer: item.footer,
    tone: item.tone,
  })), [zodiacReport]);
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
  const [sheet, setSheet] = useState<"coming" | "settings" | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [profileSwitcherOpen, setProfileSwitcherOpen] = useState(false);
  const [posterItems, setPosterItems] = useState<SharePosterData[]>([]);
  const [posterIndex, setPosterIndex] = useState(0);

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

  function handleDomain(id: string) {
    if (id !== "zodiac") setSheet("coming");
  }

  return (
    <MobileShell active="zodiac" theme="zodiac">
      <MobileTopBar title={profile.name} onProfileClick={() => setProfileSwitcherOpen(true)} onShare={() => openPoster(zodiacSharePosters, 1)} onSettings={() => setSheet("settings")} />
      <StickySegmentTabs tabs={domainTabs} active="zodiac" onChange={handleDomain} label="报告类型" />

      <div className="market-report market-report--zodiac">
      <section className="zodiac-cover-intro">
        <Image className="zodiac-cover-instrument" src={armillaryImage} alt="" aria-hidden="true" priority sizes="390px" />
        <div><small>你的星座人格封面</small><span>结构化观察</span></div>
        <h1>{zodiacReport.identity.title}</h1>
        <p>{zodiacReport.identity.subtitle}</p>
        <div className="zodiac-orbit-mark" aria-hidden="true"><Orbit /><span>{signName(zodiacReport.signs.sun)}</span></div>
      </section>

      {zodiacReport.completeness.isPartial ? <section className="zodiac-partial-note"><CircleAlert /><div><strong>当前为部分星座报告</strong><p>{zodiacReport.completeness.warning}</p><span>补充准确时辰和建议城市后，会自动更新完整配置。</span></div></section> : null}

      <MobileReveal>
        <section className="zodiac-highlight-card">
          <header><div><Sparkles /><span>{zodiacReport.highlight.title}</span></div><button type="button" onClick={() => setSelectedQuestion(whyConfiguration)}>为什么<ArrowRight /></button></header>
          <h2>{zodiacReport.highlight.statistic}</h2>
          <p>{zodiacReport.highlight.note}</p>
          <ZodiacPeakChart data={zodiacReport.peaks} />
          <div className="zodiac-highlight-meta">{zodiacReport.peaks.map((item) => <span key={item.name}><i style={{ backgroundColor: item.color }} />{item.name}<strong>{item.value}</strong></span>)}</div>
          <footer>
            <span>太阳 · {signName(zodiacReport.signs.sun)}</span>
            <span>月亮 · {zodiacReport.signs.moon ? signName(zodiacReport.signs.moon) : "待确认"}</span>
            <span>上升 · {zodiacReport.signs.rising ? signName(zodiacReport.signs.rising) : "待补充"}</span>
          </footer>
        </section>
      </MobileReveal>

      <div id="relationships"><QuestionPromptGrid questions={zodiacQuestions} onSelect={setSelectedQuestion} title="关系里，你最想先看懂哪一件事" compact /></div>

      <section className="zodiac-core-grid">
        {zodiacReport.core.map((item, index) => {
          const Icon = coreIcons[index];
          return (
            <MobileReveal key={item.title} delay={index * 0.04}>
              <motion.article animate={{ y: [0, index % 2 ? -3 : 3, 0] }} transition={{ duration: 8 + index, repeat: Infinity, ease: "easeInOut" }}>
                <div className="zodiac-core-card-top"><Icon /><InlineShareButton title={item.value} onShare={() => openPoster([customPoster(item.value, item.note)])} /></div>
                <small>{item.title}</small>
                <strong>{item.value}</strong>
                <p>{item.note}</p>
              </motion.article>
            </MobileReveal>
          );
        })}
      </section>

      <section id="traits" className="zodiac-traits-section">
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
        <section className="zodiac-daily-card">
          <div className="zodiac-daily-icon"><CloudSun /></div>
          <small>今日提醒</small>
          <h2>{zodiacReport.daily.title}</h2>
          <p>{zodiacReport.daily.note}</p>
          <dl><div><dt>结构色彩</dt><dd>{zodiacReport.daily.luckyColor}</dd></div><div><dt>适合做的事</dt><dd>{zodiacReport.daily.suitable}</dd></div></dl>
          <button type="button" className="zodiac-energy-share" onClick={() => openPoster([zodiacDailyPoster])}><ImageDown />生成星座能量图</button>
        </section>
      </MobileReveal>

      <section id="share-zodiac" className="share-story-section share-story-section--zodiac">
        <header><small>适合分享的我</small><h2>一张卡，说清一个被理解的瞬间</h2></header>
        <MobileReveal><ShareInsightCard item={zodiacReport.shareInsights[0]} onShare={() => openPoster(zodiacSharePosters, 0)} /></MobileReveal>
        <button type="button" className="share-poster-picker share-poster-picker--zodiac" onClick={() => openPoster(zodiacSharePosters, 0)}>选择其他分享图<ArrowRight /></button>
      </section>

      <section id="reading-zodiac" className="report-reading-section report-reading-section--zodiac">
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

      <MobileSheet open={sheet === "settings"} title="星座报告设置" onClose={() => setSheet(null)}>
        <div className="mobile-settings-list"><button type="button" onClick={() => setSheet("coming")}><span><Sparkles />切换解读偏好</span><ArrowRight /></button><button type="button" onClick={() => setSheet("coming")}><span><MessageCircleMore />选择关注主题</span><ArrowRight /></button></div>
      </MobileSheet>

      <MobileSheet open={sheet === "coming"} title="即将开放" onClose={() => setSheet(null)}>
        <div className="mobile-coming"><Sparkles /><strong>这个板块还在整理中</strong><p>当前开放生辰、星座与紫微，其他体系会在内容和算法准备完整后再上线。</p></div>
      </MobileSheet>
    </MobileShell>
  );
}
