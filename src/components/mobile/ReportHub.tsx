"use client";

import { ArrowRight, CalendarRange, CircleDotDashed, Clock3, Orbit, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMobileProfile } from "@/lib/mobile/profile";
import { getReportCapability, type ReportCapabilityType } from "@/lib/mobile/profileCapabilities";
import { MobileShell } from "./MobileShell";

const reports = [
  { title: "生辰报告", eyebrow: "四柱 · 五行 · 十神", note: "看行动方式、环境适配与阶段节奏", href: "/m/report/bazi", icon: CalendarRange, tone: "brass", capability: "bazi" },
  { title: "星座人格", eyebrow: "太阳 · 月亮 · 上升", note: "先读组合结论，再展开星体解释", href: "/m/report/zodiac", icon: Sparkles, tone: "blue", capability: "zodiac" },
  { title: "完整星盘", eyebrow: "十星 · 十二宫 · 相位", note: "在一张真实 SVG 盘面里查看完整结构", href: "/m/chart", icon: Orbit, tone: "blue", capability: "chart" },
  { title: "紫微领域", eyebrow: "十二宫 · 领域主线", note: "看精力更容易投向哪些生活领域", href: "/m/report/ziwei", icon: CircleDotDashed, tone: "jade", capability: "ziwei" },
  { title: "流盘节奏", eyebrow: "大运 · 流年 · 流月", note: "看当前阶段与近期行动重点", href: "/m/report/bazi?tab=flow", icon: Clock3, tone: "brass", capability: "flow" },
] as const;

export function ReportHub() {
  const profile = useMobileProfile();
  const primaryReports = reports.filter((item) => item.capability === "bazi" || item.capability === "zodiac" || item.capability === "ziwei");
  const secondaryReports = reports.filter((item) => item.capability === "chart" || item.capability === "flow");

  return <MobileShell active="report" theme="home"><main className="report-hub report-hub--figma">
    <header className="report-hub__topbar"><strong>玄枢</strong><span>当前档案 · {profile.name}</span></header>
    <section className="report-hub__intro"><small>我的结构报告</small><h1>从不同体系，<br />看见同一个自己</h1><p>三种观察方式，共用一份出生档案。先读结论，再查看依据。</p></section>
    <section className="report-hub__focus"><small>今日先看</small><h2>你如何做决定</h2><p>从生辰的行动方式进入，再对照星座与紫微。</p></section>
    <section className="report-hub__primary" aria-label="核心报告">
      {primaryReports.map((item) => {
        const Icon = item.icon;
        const status = getReportCapability(profile, item.capability satisfies ReportCapabilityType);
        return <Link href={item.href} key={item.title} data-tone={item.tone} data-availability={status.availability}>
          <span className="report-hub__symbol"><Icon /></span>
          <span className="report-hub__copy"><small>{item.eyebrow}</small><strong>{item.title.replace("报告", "").replace("人格", "")}</strong><em>{item.note}</em></span>
          <span className="report-hub__status" title={status.reason}>{status.label}</span>
          <ArrowRight />
        </Link>;
      })}
    </section>
    <section className="report-hub__secondary" aria-label="更多报告">
      {secondaryReports.map((item) => { const Icon = item.icon; return <Link href={item.href} key={item.title}><Icon /><span><strong>{item.title}</strong><small>{item.note}</small></span><ArrowRight /></Link>; })}
    </section>
    <footer className="report-hub__boundary"><Orbit />所有结论都能回到结构依据，不以单一分数替代完整观察。</footer>
  </main></MobileShell>;
}
