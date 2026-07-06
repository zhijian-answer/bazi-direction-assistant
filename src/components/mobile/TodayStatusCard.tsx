"use client";

import { ArrowRight, CalendarDays, Compass, Focus, ImageDown, MessageCircleMore, Route, ScanLine } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { DailyInsightData } from "@/lib/mobile/types";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";

export function TodayStatusCard({ insight, dateLabel, onShare }: { insight: DailyInsightData; dateLabel: string; onShare: () => void }) {
  const coverTitleById: Record<string, { lead: string; emphasis: string }> = {
    clarify: { lead: "今天不必急着推进，", emphasis: "先把最重要的事说清楚" },
    respond: { lead: "今天别让想法停在心里，", emphasis: "先把关键的话说出来" },
    steady: { lead: "今天不必开启太多，", emphasis: "先守住已有节奏" },
    recover: { lead: "今天不用勉强加速，", emphasis: "先把注意力收回来" },
    observe: { lead: "今天先别急着定义，", emphasis: "看清对方真正做了什么" },
  };
  const coverTitle = coverTitleById[insight.id] ?? { lead: insight.title, emphasis: "" };
  const tagIcons = [MessageCircleMore, Route, ScanLine];
  const suitable = insight.suitable.split("、").slice(0, 2);
  const avoid = insight.avoid.split("、");

  return (
    <section className="today-status-card">
      <div className="today-status-card__hero">
        <Image className="today-status-card__instrument" src={armillaryImage} alt="" aria-hidden="true" priority sizes="320px" />
        <header><span><CalendarDays />{dateLabel} · 今日观察</span><em>{insight.keyword}</em></header>
        <h1>{coverTitle.lead}{coverTitle.emphasis ? <strong>{coverTitle.emphasis}</strong> : null}</h1>
        <p>{insight.summary}</p>
        <div className="today-status-tags">
          {insight.tags.map((tag, index) => {
            const TagIcon = tagIcons[index] ?? Focus;
            return <span key={tag}><TagIcon />{tag}</span>;
          })}
        </div>
      </div>
      <div className="today-status-dashboard">
        <div><small>适合做什么</small>{suitable.map((item) => <span key={item}>{item}</span>)}</div>
        <div><small>暂时少做什么</small>{avoid.map((item) => <span key={item}>{item}</span>)}</div>
        <div className="today-status-action"><small>今天的一步</small><strong>{insight.action}</strong><i aria-hidden="true"><Focus /></i></div>
      </div>
      <footer>
        <Link className="xs-pressable" href="/m/report/bazi"><Compass />继续看我的报告<ArrowRight /></Link>
        <button className="xs-pressable" type="button" onClick={onShare}><ImageDown />生成今日提醒图</button>
      </footer>
    </section>
  );
}
