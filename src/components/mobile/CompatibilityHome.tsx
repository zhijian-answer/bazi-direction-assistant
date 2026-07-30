"use client";

import { ArrowRight, Clock3, HeartHandshake, Orbit, Plus, Sparkles, UsersRound } from "lucide-react";
import Link from "next/link";
import { useCompatibilityHistory } from "@/lib/compatibility/storage";
import { getRelationshipBand, relationshipLabels } from "@/lib/compatibility";
import { useMobileProfile, useMobileProfiles } from "@/lib/mobile/profile";
import { MobileShell } from "./MobileShell";
import { MobileTopBar } from "./MobileTopBar";

export function CompatibilityHome() {
  const activeProfile = useMobileProfile();
  const profiles = useMobileProfiles();
  const history = useCompatibilityHistory();
  return (
    <MobileShell active="tools" theme="home">
      <MobileTopBar title="双人合盘" />
      <main className="compatibility-page">
        <header className="compatibility-hero">
          <small><HeartHandshake />双人关系观察</small>
          <h1>把两个人放回<br /><span>同一组关系结构</span></h1>
          <p>分别从行星相位与生辰可比结构观察连接、差异和沟通方式。结果不判断关系成败。</p>
        </header>
        {activeProfile.isDemo ? <aside className="compatibility-demo-note">示例模式可以走完两种合盘并查看完整结果。示例结果不会保存到历史记录。</aside> : null}
        <section className="compatibility-mode-grid">
          <Link href="/m/compatibility/create?mode=astrology">
            <span><Orbit /></span><small>西方占星</small><h2>星盘合盘</h2><p>观察月亮、金星、火星、水星与土星之间的关系相位。</p><em>开始建立<ArrowRight /></em>
          </Link>
          <Link href="/m/compatibility/create?mode=bazi">
            <span><Sparkles /></span><small>东方命理</small><h2>生辰合盘</h2><p>观察双方日主、日支、五行关系与可比的合冲结构。</p><em>开始建立<ArrowRight /></em>
          </Link>
        </section>
        <section className="compatibility-profile-summary xs-instrument-card">
          <UsersRound /><div><small>当前设备</small><strong>{profiles.length} 份观察档案</strong><p>{profiles.length < 2 ? "建立合盘时可以直接新建对方档案。" : "可以直接从已有档案中选择双方。"}</p></div><Link href="/m/create?mode=new" aria-label="新建档案"><Plus /></Link>
        </section>
        <section className="compatibility-history-preview">
          <header><div><small>最近记录</small><h2>继续上一次关系观察</h2></div><Link href="/m/compatibility/history">全部记录<ArrowRight /></Link></header>
          {history.length ? <div>{history.slice(0, 3).map((item) => <Link href="/m/compatibility/result" key={item.id}><Clock3 /><span><strong>{item.primary.name} × {item.partner.name}</strong><small>{item.mode === "astrology" ? "星盘合盘" : "生辰合盘"} · {relationshipLabels[item.relationshipType]}</small></span><em>{getRelationshipBand(item.overallScore).label}</em></Link>)}</div> : <article className="compatibility-empty"><Clock3 /><strong>还没有合盘记录</strong><p>{activeProfile.isDemo ? "示例结果不会写入历史。创建自己的档案后，关系观察会保存在这台设备。" : "完成第一份合盘后，会在这台设备保存最近 30 条记录。"}</p></article>}
        </section>
      </main>
    </MobileShell>
  );
}
