"use client";

import { ArrowRight, CalendarDays, ImageDown } from "lucide-react";
import Link from "next/link";
import type { DailyInsightData } from "@/lib/mobile/types";

export function TodayStatusCard({ insight, dateLabel, onShare }: { insight: DailyInsightData; dateLabel: string; onShare: () => void }) {
  return (
    <section className="today-status-card">
      <header><span><CalendarDays />{dateLabel} · 今日状态</span><em>{insight.keyword}</em></header>
      <h1>{insight.title}</h1>
      <p>{insight.summary}</p>
      <div className="today-status-tags">{insight.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
      <div className="today-status-do-dont">
        <div><small>适合做什么</small><strong>{insight.suitable}</strong></div>
        <div><small>暂时少做什么</small><strong>{insight.avoid}</strong></div>
      </div>
      <div className="today-status-action"><small>今天的一步</small><strong>{insight.action}</strong></div>
      <footer>
        <Link href="/m/report/bazi">继续看我的报告<ArrowRight /></Link>
        <button type="button" onClick={onShare}><ImageDown />生成今日提醒图</button>
      </footer>
    </section>
  );
}
