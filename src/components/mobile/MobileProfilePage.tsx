"use client";

import { CalendarRange, ChevronRight, CircleHelp, FileText, LockKeyhole, Pencil, UserRound } from "lucide-react";
import Link from "next/link";
import { useMobileProfile } from "@/lib/mobile/profile";
import { MobileShell } from "./MobileShell";

export function MobileProfilePage() {
  const profile = useMobileProfile();

  return (
    <MobileShell active="profile" theme="home">
      <header className="profile-page-header">
        <small>我的</small>
        <h1>把自己的报告留在这里</h1>
      </header>
      <section className="profile-account-card">
        <span>{profile.name.slice(0, 1) || "自"}</span>
        <div><strong>{profile.name || "自己"}</strong><small>免费使用中 · 已创建 1 个档案</small></div>
        <Link href="/m/create" aria-label="编辑出生档案"><Pencil /></Link>
      </section>
      <section className="profile-data-card">
        <header><CalendarRange /><strong>出生档案</strong></header>
        <dl>
          <div><dt>日历</dt><dd>{profile.calendarType === "lunar" ? "农历" : "公历"}</dd></div>
          <div><dt>出生时间</dt><dd>{profile.birthDate || "1990-06-18"} {profile.birthTime || "09:30"}</dd></div>
          <div><dt>出生地点</dt><dd>{profile.birthPlace || "广东省广州市"}</dd></div>
        </dl>
      </section>
      <nav className="profile-menu" aria-label="个人设置">
        <Link href="/m/report/bazi"><span><FileText />我的生辰报告</span><ChevronRight /></Link>
        <Link href="/m/report/zodiac"><span><UserRound />我的星座报告</span><ChevronRight /></Link>
        <Link href="/privacy"><span><LockKeyhole />隐私说明</span><ChevronRight /></Link>
        <Link href="/about"><span><CircleHelp />关于玄枢</span><ChevronRight /></Link>
      </nav>
      <section className="profile-boundary">
        <strong>使用边界</strong>
        <p>玄枢提供传统文化、娱乐与自我探索内容。遇到健康、法律、投资或重大人生决定，请结合现实信息和专业意见。</p>
      </section>
    </MobileShell>
  );
}
