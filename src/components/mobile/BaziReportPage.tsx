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
  Settings2,
  Sparkles,
  WalletCards,
} from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { mockBaziReport } from "@/lib/mobile/mockBaziReport";
import { insightDataAdapter } from "@/lib/mobile/insightDataAdapter";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { ContinueExploring } from "./ContinueExploring";
import { ExpandableTextCard } from "./ExpandableTextCard";
import { MobileSheet } from "./MobileSheet";
import { MobileShell } from "./MobileShell";
import { MobileTopBar } from "./MobileTopBar";
import { MobileReveal } from "./Reveal";
import { QuestionInsightSheet } from "./QuestionInsightSheet";
import { FiveElementsChart, FiveElementsCoverChart, LuckTrendChart, TenGodChart } from "./ReportCharts";
import { ShareInsightCard } from "./ShareInsightCard";
import { SharePosterSheet } from "./SharePosterSheet";
import { StickySegmentTabs } from "./StickySegmentTabs";

type BaziTab = "bazi" | "flow";

const tabs = [
  { id: "match", label: "合盘", disabled: true },
  { id: "bazi", label: "生辰" },
  { id: "flow", label: "流盘" },
];

const conclusionIcons = [BriefcaseBusiness, HeartHandshake, WalletCards];

const baziQuestions = insightDataAdapter.getQuestions("bazi");
const baziPosters: SharePosterData[] = mockBaziReport.shareInsights.map((item) => ({
  id: `bazi-${item.id}`,
  category: "personality",
  eyebrow: item.eyebrow,
  title: item.title,
  body: item.body,
  tags: mockBaziReport.identity.tags,
  footer: item.footer,
  tone: item.tone,
}));

export function BaziReportPage({ initialTab = "bazi" }: { initialTab?: BaziTab }) {
  const [tab, setTab] = useState<BaziTab>(initialTab);
  const profile = useMobileProfile();
  const [sheet, setSheet] = useState<"settings" | "coming" | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterIndex, setPosterIndex] = useState(0);

  function openPoster(index = 0) {
    setPosterIndex(index);
    setPosterOpen(true);
  }

  function handleTab(id: string) {
    if (id === "match") return setSheet("coming");
    if (id === "bazi" || id === "flow") setTab(id);
  }

  return (
    <MobileShell active="bazi" theme="bazi">
      <MobileTopBar title={profile.name} onShare={() => openPoster(0)} onSettings={() => setSheet("settings")} />
      <StickySegmentTabs tabs={tabs} active={tab} onChange={handleTab} label="生辰报告分类" />

      {tab === "bazi" ? (
        <>
          <section className="bazi-cover-card">
            <header><span><Fingerprint />玄枢 · 生辰人格封面</span><small>庚午日 · 结构化观察</small></header>
            <h1>{mockBaziReport.identity.title}</h1>
            <p className="bazi-cover-lead">{mockBaziReport.identity.subtitle}</p>
            <div className="bazi-cover-visual">
              <FiveElementsCoverChart data={mockBaziReport.elements} />
              <div className="bazi-cover-reading">
                <small>核心结构</small>
                <strong>先确认，再持续</strong>
                <p>你会先确认边界和标准，目标清楚后执行并不慢。</p>
              </div>
            </div>
            <div className="bazi-cover-tags">{mockBaziReport.identity.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
            <div className="bazi-cover-basis">{mockBaziReport.identity.basis}</div>
            <footer><span>让命理，被科学看见</span><small>结构不是结论，理解才是开始</small></footer>
          </section>

          <section className="bazi-today-action">
            <small>这对今天意味着什么</small>
            <h2>先完成一件边界清楚的小事</h2>
            <p>把最想推进的事情缩小到 30 分钟内能完成的一步。完成以后，再决定是否加速。</p>
            <button type="button" onClick={() => openPoster(2)}><ImageDown />生成今日提醒图</button>
          </section>

          <ContinueExploring question={baziQuestions[0]} onSelect={setSelectedQuestion} label="先从环境问题继续" />

          <section id="share-bazi" className="share-story-section share-story-section--bazi share-story-section--after-cover">
            <header><small>一句话人格卡</small><h2>先保存最像你的这一句</h2></header>
            <MobileReveal><ShareInsightCard item={mockBaziReport.shareInsights[0]} onShare={() => openPoster(0)} /></MobileReveal>
            <button type="button" className="share-poster-picker" onClick={() => openPoster(0)}>选择其他分享图<ArrowRight /></button>
          </section>

          <MobileReveal>
            <section className="bazi-structure-card">
              <div className="bazi-structure-kicker"><Gauge /><span>格局与喜用 · 白话结论</span></div>
              <h2>{mockBaziReport.identity.pattern}</h2>
              <p>{mockBaziReport.identity.patternEvidence}</p>
              <p>{mockBaziReport.identity.patternScene}</p>
              <div className="bazi-structure-boundary">{mockBaziReport.identity.patternBoundary}</div>
              <footer><span>支撑重点</span><strong>土 · 金</strong><small>稳定 · 规则 · 可积累</small></footer>
            </section>
          </MobileReveal>

          <MobileReveal>
            <section id="five-elements" className="bazi-section-card">
              <header className="report-section-heading">
                <div><small>力量去向</small><h2>你的力量通常会流向哪里</h2></div>
                <span>火最先被看见</span>
              </header>
              <p className="element-flow-intro">数字不是好坏评分，而是在提醒你：表达和行动更容易先出现，稳定与判断则决定能不能持续。</p>
              <FiveElementsChart data={mockBaziReport.elements} />
              <div className="element-legend">
                {mockBaziReport.elements.map((item) => (
                  <div key={item.key}><i style={{ backgroundColor: item.color }} /><span>{item.label} {item.value}%</span><small>{item.meaning}</small></div>
                ))}
              </div>
            </section>
          </MobileReveal>

          <ContinueExploring question={baziQuestions[1]} onSelect={setSelectedQuestion} label="看见关系里的真实需要" />

          <section className="bazi-conclusion-stack">
            {mockBaziReport.lightConclusions.map((item, index) => {
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
              <LuckTrendChart data={mockBaziReport.luckTrend} />
              <div className="luck-keywords">{mockBaziReport.luckTrend.map((item) => <span key={item.age}>{item.age}<strong>{item.keyword}</strong></span>)}</div>
              <p className="report-caption">趋势用来观察阶段节奏，不代表某一年一定好或坏。</p>
            </section>
          </MobileReveal>

          <ContinueExploring question={baziQuestions[2]} onSelect={setSelectedQuestion} label="把趋势落到一个具体选择" />

          <MobileReveal>
            <section className="bazi-section-card">
              <header className="report-section-heading"><div><small>行为结构</small><h2>你处理人和事的习惯</h2></div><Sparkles /></header>
              <div className="ten-god-top-three">
                {mockBaziReport.tenGods.slice(0, 3).map((item, index) => <article key={item.name}><small>TOP {index + 1}</small><strong>{item.name}</strong><span>{item.value}%</span><p>{item.note}</p></article>)}
              </div>
              <TenGodChart data={mockBaziReport.tenGods} />
              <div className="ten-god-notes">
                {mockBaziReport.tenGods.slice(3).map((item) => <p key={item.name}><strong>{item.name}</strong><span>{item.note}</span></p>)}
              </div>
            </section>
          </MobileReveal>

          <ContinueExploring question={baziQuestions[3]} onSelect={setSelectedQuestion} label="识别最容易消耗你的部分" />

          <section id="reading-bazi" className="report-reading-section">
            <header><small>基础解读</small><h2>先理解术语，再看它与你的关系</h2></header>
            {mockBaziReport.readings.map((item) => <MobileReveal key={item.id}><ExpandableTextCard item={item} /></MobileReveal>)}
          </section>

          <MobileReveal>
            <section id="professional-chart" className="professional-table-section">
              <header><div><small>专业命盘</small><h2>四柱结构明细</h2></div><span>左右滑动查看</span></header>
              <details className="professional-table-help"><summary>怎么看这张表</summary><p>先看日柱，它更接近你处理事情的惯用方式；再看月柱，理解你进入环境后的适应节奏。神煞只作传统文化娱乐参考，不作为判断依据。</p></details>
              <div className="professional-table-scroll" tabIndex={0} aria-label="可横向滚动的四柱命盘表">
                <table>
                  <thead><tr>{mockBaziReport.pillars.headers.map((header) => <th key={header}>{header}</th>)}</tr></thead>
                  <tbody>{mockBaziReport.pillars.rows.map((row) => <tr key={row[0]} className={row[0] === "神煞" ? "is-reference-row" : ""}>{row.map((cell, index) => index === 0 ? <th key={cell}>{cell}{cell === "神煞" ? <small>娱乐参考</small> : null}</th> : <td key={`${row[0]}-${index}`}>{cell}</td>)}</tr>)}</tbody>
                </table>
              </div>
            </section>
          </MobileReveal>

          <section className="report-boundary"><CheckCircle2 /><p>这份报告用于传统文化研究、娱乐和自我探索。涉及健康、法律、投资或重大人生决定时，请结合现实信息与专业意见。</p></section>
        </>
      ) : (
        <FlowPanel onAsk={() => setSelectedQuestion(baziQuestions[2])} />
      )}

      <QuestionInsightSheet key={selectedQuestion?.id ?? "bazi-question"} open={Boolean(selectedQuestion)} question={selectedQuestion} questions={baziQuestions} onClose={() => setSelectedQuestion(null)} />
      <SharePosterSheet key={`bazi-poster-${posterOpen}-${posterIndex}`} open={posterOpen} onClose={() => setPosterOpen(false)} items={baziPosters} initialIndex={posterIndex} />

      <MobileSheet open={sheet === "settings"} title="报告设置" onClose={() => setSheet(null)}>
        <div className="mobile-settings-list">
          <Link href="/m/create"><span><Settings2 />修改出生资料</span><ArrowRight /></Link>
          <button type="button" onClick={() => setSheet("coming")}><span><Sparkles />切换解读偏好</span><ArrowRight /></button>
        </div>
      </MobileSheet>

      <MobileSheet open={sheet === "coming"} title="即将开放" onClose={() => setSheet(null)}>
        <div className="mobile-coming"><Sparkles /><strong>这个功能还在整理中</strong><p>本期先把生辰和星座报告做好，不展示不能使用的假功能。</p></div>
      </MobileSheet>
    </MobileShell>
  );
}

function FlowPanel({ onAsk }: { onAsk: () => void }) {
  const months = [
    { month: "四月", stem: "癸巳", theme: "收拢", note: "把分散任务合并成一条主线" },
    { month: "五月", stem: "甲午", theme: "表达", note: "适合沟通、展示和确认合作" },
    { month: "六月", stem: "乙未", theme: "稳住", note: "先完成已有承诺，再接新任务" },
    { month: "七月", stem: "丙申", theme: "取舍", note: "减少低回报消耗，保留精力" },
  ];
  return (
    <section className="flow-page">
      <header className="flow-hero"><small>2026 年 · 当前节奏</small><h1>先稳住主线，再选择性加速</h1><p>流盘用于观察阶段变化。它更像一张节奏地图，不是对具体事件的保证。</p></header>
      <section className="flow-matrix-section">
        <header><h2>当前盘面</h2><span>2026 年 7 月</span></header>
        <div className="flow-matrix">
          {mockBaziReport.flowColumns.map((item, index) => <div key={item.label} className={index === 2 ? "is-current" : ""}><small>{item.label}</small><strong>{item.value}</strong><span>{item.note}</span></div>)}
        </div>
      </section>
      <section className="flow-focus-card">
        <small>当前流年 · 丙午</small><h2>行动感变强，也更需要控制节奏</h2><p>适合把已经想清楚的事情推进一步。遇到信息不足或情绪过热时，先留出一天复盘。</p>
        <div><span>适合推进<strong>沟通、公开表达、项目收尾</strong></span><span>需要留意<strong>同时答应太多事情</strong></span></div>
      </section>
      <section className="flow-months"><header><small>近四个月</small><h2>每个月的关注重点</h2></header>{months.map((item, index) => <MobileReveal key={item.month} delay={index * 0.04}><article className={index === 2 ? "is-current" : ""}><div><small>{item.month}</small><strong>{item.stem}</strong></div><span>{item.theme}</span><p>{item.note}</p></article></MobileReveal>)}</section>
      <motion.button type="button" className="flow-ask-button" onClick={onAsk} whileTap={{ scale: 0.98 }}><Sparkles />今年适合主动还是稳住？<ArrowRight /></motion.button>
      <section className="report-boundary"><CheckCircle2 /><p>阶段提示仅供文化娱乐和自我探索，不应作为投资、健康、法律或职业决定的唯一依据。</p></section>
    </section>
  );
}
