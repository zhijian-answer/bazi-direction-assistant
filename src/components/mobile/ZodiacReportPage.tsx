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
import { Fragment, useState } from "react";
import { mockZodiacReport } from "@/lib/mobile/mockZodiacReport";
import { insightDataAdapter } from "@/lib/mobile/insightDataAdapter";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
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

const domainTabs = [
  { id: "sandbox", label: "沙盘", disabled: true },
  { id: "zodiac", label: "星座" },
  { id: "bazi", label: "生辰", href: "/m/report/bazi" },
  { id: "stars", label: "星宿", disabled: true },
  { id: "ziwei", label: "紫微", disabled: true },
  { id: "zhengyu", label: "政余", disabled: true },
];

const coreIcons = [Sun, Moon, Sunrise];
const traitIcons = [Eye, Waves, HeartHandshake, Heart, MessagesSquare, CircleAlert];
const zodiacQuestions = insightDataAdapter.getQuestions("zodiac");
const whyConfiguration: QuestionInsightData = {
  id: "zodiac-configuration",
  context: "zodiac",
  prompt: "为什么我会同时想得快，又需要落得稳？",
  shortLabel: "为什么会这样",
  source: "来自太阳双子、月亮白羊与上升金牛的组合观察",
  interpretation: "太阳双子让你快速接收信息，月亮白羊推动即时回应，上升金牛则需要稳定和可控。它们不是互相矛盾，而是在不同阶段接力。",
  observation: "你通常先被新鲜感启动，再靠清楚节奏把事情做完。只有变化没有落点，会让你很快失去状态。",
  action: "给新想法一个具体完成标准，让速度和稳定各自发挥作用。",
  tone: "sky",
};

const zodiacSharePosters: SharePosterData[] = mockZodiacReport.shareInsights.map((item) => ({
  id: `zodiac-${item.id}`,
  category: "zodiac",
  eyebrow: item.eyebrow,
  title: item.title,
  body: item.body,
  tags: ["太阳双子", "月亮白羊", "上升金牛"],
  footer: item.footer,
  tone: item.tone,
}));

const zodiacDailyPoster: SharePosterData = {
  id: "zodiac-energy-today",
  category: "zodiac",
  eyebrow: "今日星座能量",
  title: mockZodiacReport.daily.title,
  body: mockZodiacReport.daily.note,
  tags: ["好奇心 96", "稳定感 86", "行动力 74"],
  footer: "太阳双子 · 月亮白羊 · 上升金牛",
  tone: "sky",
};

export function ZodiacReportPage() {
  const profile = useMobileProfile();
  const [sheet, setSheet] = useState<"coming" | "settings" | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterItems, setPosterItems] = useState<SharePosterData[]>(zodiacSharePosters);
  const [posterIndex, setPosterIndex] = useState(0);

  function openPoster(items: SharePosterData[], index = 0) {
    setPosterItems(items);
    setPosterIndex(index);
    setPosterOpen(true);
  }

  function customPoster(title: string, body: string, tone: SharePosterData["tone"] = "violet"): SharePosterData {
    return { id: `zodiac-${title}`, category: "zodiac", eyebrow: "我的星座人格", title, body, tags: ["太阳双子", "月亮白羊", "上升金牛"], footer: "让命理，被科学看见", tone };
  }

  function handleDomain(id: string) {
    if (id !== "zodiac") setSheet("coming");
  }

  return (
    <MobileShell active="zodiac" theme="zodiac">
      <MobileTopBar title={profile.name} onShare={() => openPoster(zodiacSharePosters, 1)} onSettings={() => setSheet("settings")} />
      <StickySegmentTabs tabs={domainTabs} active="zodiac" onChange={handleDomain} label="报告类型" />

      <section className="zodiac-cover-intro">
        <div><small>你的星座人格封面</small><span>结构化观察</span></div>
        <h1>{mockZodiacReport.identity.title}</h1>
        <p>{mockZodiacReport.identity.subtitle}</p>
        <div className="zodiac-orbit-mark" aria-hidden="true"><Orbit /><span>双子</span></div>
      </section>

      <MobileReveal>
        <section className="zodiac-highlight-card">
          <header><div><Sparkles /><span>{mockZodiacReport.highlight.title}</span></div><button type="button" onClick={() => setSelectedQuestion(whyConfiguration)}>为什么<ArrowRight /></button></header>
          <h2>{mockZodiacReport.highlight.statistic}</h2>
          <p>{mockZodiacReport.highlight.note}</p>
          <ZodiacPeakChart data={mockZodiacReport.peaks} />
          <div className="zodiac-highlight-meta">{mockZodiacReport.peaks.map((item) => <span key={item.name}><i style={{ backgroundColor: item.color }} />{item.name}<strong>{item.value}</strong></span>)}</div>
          <footer><span>太阳负责好奇</span><span>月亮负责回应</span><span>上升负责稳定</span></footer>
        </section>
      </MobileReveal>

      <div id="relationships"><QuestionPromptGrid questions={zodiacQuestions} onSelect={setSelectedQuestion} title="关系里，你最想先看懂哪一件事" compact /></div>

      <section className="zodiac-core-grid">
        {mockZodiacReport.core.map((item, index) => {
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
          {mockZodiacReport.traits.map((item, index) => {
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
          <h2>{mockZodiacReport.daily.title}</h2>
          <p>{mockZodiacReport.daily.note}</p>
          <dl><div><dt>幸运颜色</dt><dd>{mockZodiacReport.daily.luckyColor}</dd></div><div><dt>适合做的事</dt><dd>{mockZodiacReport.daily.suitable}</dd></div></dl>
          <button type="button" className="zodiac-energy-share" onClick={() => openPoster([zodiacDailyPoster])}><ImageDown />生成星座能量图</button>
        </section>
      </MobileReveal>

      <section id="share-zodiac" className="share-story-section share-story-section--zodiac">
        <header><small>适合分享的我</small><h2>一张卡，说清一个被理解的瞬间</h2></header>
        <MobileReveal><ShareInsightCard item={mockZodiacReport.shareInsights[0]} onShare={() => openPoster(zodiacSharePosters, 0)} /></MobileReveal>
        <button type="button" className="share-poster-picker share-poster-picker--zodiac" onClick={() => openPoster(zodiacSharePosters, 0)}>选择其他分享图<ArrowRight /></button>
      </section>

      <section id="reading-zodiac" className="report-reading-section report-reading-section--zodiac">
        <header><small>星座解读</small><h2>从一句解释开始，慢慢看懂自己</h2></header>
        {mockZodiacReport.readings.map((item, index) => {
          const reminder = mockZodiacReport.readingReminders.find((entry) => entry.after === index);
          return <Fragment key={item.id}><MobileReveal><ExpandableTextCard item={item} tone="zodiac" /></MobileReveal>{reminder ? <ReadingReminderCard title={reminder.title} note={reminder.note} /> : null}</Fragment>;
        })}
      </section>

      <section className="report-boundary report-boundary--zodiac"><CheckCircle2 /><p>星座内容用于娱乐与自我观察，不定义性格，也不替代现实沟通、专业判断与个人选择。</p></section>

      <QuestionInsightSheet key={selectedQuestion?.id ?? "zodiac-question"} open={Boolean(selectedQuestion)} question={selectedQuestion} questions={selectedQuestion?.id === whyConfiguration.id ? [whyConfiguration, ...zodiacQuestions] : zodiacQuestions} onClose={() => setSelectedQuestion(null)} />
      <SharePosterSheet key={`zodiac-poster-${posterOpen}-${posterItems[0]?.id}-${posterIndex}`} open={posterOpen} onClose={() => setPosterOpen(false)} items={posterItems} initialIndex={posterIndex} />

      <MobileSheet open={sheet === "settings"} title="星座报告设置" onClose={() => setSheet(null)}>
        <div className="mobile-settings-list"><button type="button" onClick={() => setSheet("coming")}><span><Sparkles />切换解读偏好</span><ArrowRight /></button><button type="button" onClick={() => setSheet("coming")}><span><MessageCircleMore />选择关注主题</span><ArrowRight /></button></div>
      </MobileSheet>

      <MobileSheet open={sheet === "coming"} title="即将开放" onClose={() => setSheet(null)}>
        <div className="mobile-coming"><Sparkles /><strong>这个板块还在整理中</strong><p>本期只开放生辰和星座，避免用空页面打断体验。</p></div>
      </MobileSheet>
    </MobileShell>
  );
}
