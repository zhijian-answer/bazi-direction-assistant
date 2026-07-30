"use client";

import { ArrowRight, CalendarDays, ImageDown } from "lucide-react";
import Image from "next/image";
import { buildHomeCoverTitle } from "@/lib/mobile/homePresentation";
import type { DailyInsightData } from "@/lib/mobile/types";
import armillaryImage from "../../../public/mobile/xuanshu-armillary-hero.webp";

export function HomeDailyHero({ insight, dateLabel, onShare }: { insight: DailyInsightData; dateLabel: string; onShare: () => void }) {
  const title = buildHomeCoverTitle(insight);

  return (
    <section className="home-v2-hero" aria-labelledby="home-v2-title">
      <Image className="home-v2-hero__image" src={armillaryImage} alt="" aria-hidden="true" priority sizes="430px" />
      <div className="home-v2-hero__wash" aria-hidden="true" />
      <header className="home-v2-hero__meta">
        <span><CalendarDays />{dateLabel} · 今日观察</span>
        <button type="button" onClick={onShare} aria-label="生成今日提醒图" title="生成今日提醒图"><ImageDown /></button>
      </header>
      <div className="home-v2-hero__copy">
        <small>今天的观察</small>
        <h1 id="home-v2-title">
          <span>{title.lead}</span>
          {title.detail || title.emphasis ? <span>{title.detail}<strong>{title.emphasis}</strong></span> : null}
        </h1>
        <p>{insight.summary}</p>
        <div className="home-v2-hero__evidence" aria-label="观察依据">
          <span>当前阶段</span>
          <span>本命结构</span>
          <span>仅供观察</span>
        </div>
      </div>
      <footer className="home-v2-hero__actions">
        <a href="#home-today-focus">查看今天怎么做<ArrowRight /></a>
      </footer>
    </section>
  );
}
