"use client";

import { ArrowRight, CalendarDays, Compass, Focus, ImageDown, MessageCircleMore, Route, ScanLine } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import type { DailyInsightData } from "@/lib/mobile/types";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";

function splitCoverTitle(title: string) {
  const punctuationIndex = title.search(/[，；：]/);
  if (punctuationIndex > 1 && punctuationIndex < title.length - 2) {
    const secondLine = title.slice(punctuationIndex + 1);
    const emphasisLength = secondLine.length >= 7 ? 4 : Math.max(2, Math.ceil(secondLine.length / 3));
    return {
      lead: title.slice(0, punctuationIndex + 1),
      detail: secondLine.slice(0, -emphasisLength),
      emphasis: secondLine.slice(-emphasisLength),
    };
  }
  return { lead: title, detail: "", emphasis: "" };
}

function buildCoverTitle(insight: DailyInsightData) {
  const coverTitleById: Record<string, { lead: string; detail: string; emphasis: string }> = {
    clarify: { lead: "今天不必急着推进，", detail: "先把最重要的事", emphasis: "说清楚" },
    respond: { lead: "今天别让想法停在心里，", detail: "先把关键的话", emphasis: "说出来" },
    steady: { lead: "今天不必开启太多，", detail: "先守住已有", emphasis: "节奏" },
    recover: { lead: "今天不用勉强加速，", detail: "先把注意力", emphasis: "收回来" },
    observe: { lead: "今天先别急着定义，", detail: "看清对方真正", emphasis: "做了什么" },
  };
  const coverTitleByTitle: Record<string, { lead: string; detail: string; emphasis: string }> = {
    "同频力量变强，更适合把主线做完整": { lead: "今天先别分散精力，", detail: "把一条主线", emphasis: "做完整" },
    "外部支持更明显，先接住已有资源": { lead: "今天不用独自硬扛，", detail: "先接住", emphasis: "已有资源" },
    "表达与输出增加，也要守住完成边界": { lead: "今天可以多表达，", detail: "但要守住", emphasis: "完成边界" },
    "取舍任务比继续加码更重要": { lead: "今天不是继续加码，", detail: "而是先把", emphasis: "边界定清" },
    "外部要求变多，先降低并行任务": { lead: "今天先别硬接太多，", detail: "把并行任务", emphasis: "降下来" },
  };

  return coverTitleById[insight.id] ?? coverTitleByTitle[insight.title] ?? splitCoverTitle(insight.title);
}

export function TodayStatusCard({ insight, dateLabel, onShare }: { insight: DailyInsightData; dateLabel: string; onShare: () => void }) {
  const coverTitle = buildCoverTitle(insight);
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
