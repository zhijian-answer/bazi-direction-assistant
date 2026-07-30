"use client";

import { ArrowRight, Clock3, FileQuestion, Trash2 } from "lucide-react";
import Link from "next/link";
import { deleteCompatibilityReport, saveCompatibilityReport, useCompatibilityHistory } from "@/lib/compatibility/storage";
import type { CompatibilityReport } from "@/lib/compatibility";
import { getRelationshipBand, relationshipLabels } from "@/lib/compatibility";
import { MobileShell } from "./MobileShell";
import { MobileTopBar } from "./MobileTopBar";

export function CompatibilityHistoryPage() {
  const items = useCompatibilityHistory();
  function open(item: CompatibilityReport) { saveCompatibilityReport(item); }
  function remove(id: string) { deleteCompatibilityReport(id); }
  return <MobileShell active="tools" theme="home"><MobileTopBar title="合盘记录" /><main className="compatibility-page compatibility-history"><header className="compatibility-hero compatibility-hero--compact"><small><Clock3 />本地历史</small><h1>每一次关系观察，<br /><span>都保留当时的依据</span></h1><p>当前设备最多保留 30 条。删除后无法恢复。</p></header>{items.length ? <div className="compatibility-history-list">{items.map((item) => <article key={item.id}><div><small>{item.mode === "astrology" ? "星盘合盘" : "生辰合盘"} · {relationshipLabels[item.relationshipType]}</small><h2>{item.primary.name} × {item.partner.name}</h2><p>{new Date(item.createdAt).toLocaleString("zh-CN")}</p></div><strong>{getRelationshipBand(item.overallScore).label}</strong><Link href="/m/compatibility/result" onClick={() => open(item)}>查看<ArrowRight /></Link><button type="button" onClick={() => remove(item.id)} aria-label={`删除${item.primary.name}与${item.partner.name}的记录`}><Trash2 /></button></article>)}</div> : <section className="compatibility-empty compatibility-empty--page"><FileQuestion /><strong>还没有历史记录</strong><p>完成一次星盘或生辰合盘后会出现在这里。</p><Link href="/m/compatibility/create">开始合盘<ArrowRight /></Link></section>}</main></MobileShell>;
}
