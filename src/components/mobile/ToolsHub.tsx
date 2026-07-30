"use client";

import { ArrowRight, BrainCircuit, CalendarClock, CircleDashed, HeartHandshake, MessageCircleMore, Orbit, Sparkles, TestTube2 } from "lucide-react";
import Link from "next/link";
import { MobileShell } from "./MobileShell";

const plannedTools = [
  { title: "每日塔罗", note: "等待原创牌面与内容规则完成", icon: Sparkles },
  { title: "心理测试", note: "等待原创题库与结果验证", icon: TestTube2 },
  { title: "数字与原型", note: "等待可靠规则来源与授权核对", icon: CircleDashed },
  { title: "关系画像", note: "等待真实生成能力，不用示例冒充结果", icon: BrainCircuit },
] as const;

export function ToolsHub() {
  return <MobileShell active="tools" theme="home"><main className="tools-hub tools-hub--figma">
    <header className="tools-hub__topbar"><strong>玄枢</strong><span>最近使用</span></header>
    <section className="tools-hub__hero"><small>结构工具箱</small><h1>想从哪件事开始？</h1><p>先选问题，再选择适合的观察工具。</p></section>
    <Link className="tools-hub__featured" href="/m/compatibility"><span><small>推荐从这里开始</small><strong>双人合盘</strong><p>用两份档案观察吸引、沟通与冲突来源。</p><em>开始创建<ArrowRight /></em></span><i><HeartHandshake /></i></Link>
    <section className="tools-hub__group"><h2>报告与时间</h2><div className="tools-hub__grid">
      <Link href="/m/chart"><span data-tone="blue"><Orbit /></span><strong>完整星盘</strong><small>本命与行运</small></Link>
      <Link href="/m/report/bazi?tab=flow"><span data-tone="brass"><CalendarClock /></span><strong>流盘</strong><small>阶段与节奏</small></Link>
      <Link href="/m/compatibility/history"><span data-tone="coral"><HeartHandshake /></span><strong>合盘记录</strong><small>关系历史</small></Link>
      <Link href="/m/chat"><span data-tone="jade"><MessageCircleMore /></span><strong>问玄枢</strong><small>从结构找答案</small></Link>
    </div></section>
    <section className="tools-hub__light"><h2>轻量探索</h2>{plannedTools.map((item) => { const Icon = item.icon; return <button type="button" key={item.title} disabled><Icon /><span><strong>{item.title}</strong><small>{item.note}</small></span><em>准备中</em></button>; })}</section>
    <footer className="tools-hub__boundary"><Sparkles />没有可靠规则或授权来源的工具，不会伪装成可用功能。</footer>
  </main></MobileShell>;
}
