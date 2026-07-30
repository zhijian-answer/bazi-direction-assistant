"use client";

import { CheckCircle2, ChevronDown, Database, ShieldCheck } from "lucide-react";

export function ReportDataScope({
  used,
  excluded,
  engine,
  title = "这份报告用了哪些资料",
}: {
  used: string[];
  excluded: string[];
  engine: string;
  title?: string;
}) {
  return (
    <section className="report-data-scope">
      <details>
        <summary>
          <Database />
          <span><strong>{title}</strong><small>{used.slice(0, 3).join(" · ")}</small></span>
          <ChevronDown />
        </summary>
        <div className="report-data-scope__body">
          <article><CheckCircle2 /><div><small>已参与计算</small><p>{used.join("、")}</p></div></article>
          <article><ShieldCheck /><div><small>未参与或尚未使用</small><p>{excluded.length ? excluded.join("、") : "当前没有缺失的必要资料"}</p></div></article>
          <footer>计算来源：{engine}</footer>
        </div>
      </details>
    </section>
  );
}
