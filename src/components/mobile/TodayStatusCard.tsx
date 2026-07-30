"use client";

import { ArrowRight, CalendarDays, Compass, Focus, ImageDown, MessageCircleMore, Route, ScanLine } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { buildHomeCoverTitle } from "@/lib/mobile/homePresentation";
import type { DailyInsightData } from "@/lib/mobile/types";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";

export function TodayStatusCard({ insight, dateLabel, onShare }: { insight: DailyInsightData; dateLabel: string; onShare: () => void }) {
  const coverTitle = buildHomeCoverTitle(insight);
  const tagIcons = [MessageCircleMore, Route, ScanLine];
  const suitable = insight.suitable.split("、").slice(0, 2);
  const avoid = insight.avoid.split("、");

  return (
    <section className="today-status-card">
      <div className="today-status-card__hero">
        <Image className="today-status-card__instrument" src={armillaryImage} alt="" aria-hidden="true" priority sizes="320px" />
        <span className="today-status-card__scope today-status-card__scope--one" aria-hidden="true" />
        <span className="today-status-card__scope today-status-card__scope--two" aria-hidden="true" />
        <span className="today-status-card__node today-status-card__node--one" aria-hidden="true" />
        <span className="today-status-card__node today-status-card__node--two" aria-hidden="true" />
        <header><span><CalendarDays />{dateLabel} · 今日观察</span><em>{insight.keyword}</em></header>
        <h1><span>{coverTitle.lead}</span>{coverTitle.detail || coverTitle.emphasis ? <span className="today-status-card__title-detail">{coverTitle.detail}<strong>{coverTitle.emphasis}</strong></span> : null}</h1>
        <p>{insight.summary}</p>
        <div className="today-status-tags">
          {insight.tags.map((tag, index) => {
            const TagIcon = tagIcons[index] ?? Focus;
            return <span key={tag}><TagIcon />{tag}</span>;
          })}
        </div>
      </div>
      <div className="today-status-dashboard">
        <div><small>适合做什么</small><strong>适合</strong>{suitable.map((item) => <span key={item}>{item}</span>)}</div>
        <div><small>暂时少做什么</small><strong>少做</strong>{avoid.map((item) => <span key={item}>{item}</span>)}</div>
        <div className="today-status-action"><small>今天的一步</small><strong>{insight.action}</strong><i aria-hidden="true"><Focus /></i></div>
      </div>
      <footer>
        <Link className="xs-pressable" href="/m/report/bazi"><Compass />继续看我的报告<ArrowRight /></Link>
        <button className="xs-pressable" type="button" onClick={onShare}><ImageDown />生成今日提醒图</button>
      </footer>
    </section>
  );
}
