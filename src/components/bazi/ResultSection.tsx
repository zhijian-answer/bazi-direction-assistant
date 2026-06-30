"use client";

import { Check, Clipboard, Link2, Network } from "lucide-react";
import { useState } from "react";
import type { BirthProfile, BirthReport } from "@/lib/types";
import { FiveElementsCard } from "./FiveElementsCard";
import { LuckCycleTable } from "./LuckCycleTable";
import { PillarTable } from "./PillarTable";

export function ResultSection({ profile, report, onAsk }: { profile: BirthProfile; report: BirthReport; onAsk: () => void }) {
  const [copied, setCopied] = useState<"result" | "share" | null>(null);
  const chart = profile.chart;
  const relations = chart.relations || [];

  const resultText = `${profile.name}的命盘：${chart.pillars.year} ${chart.pillars.month} ${chart.pillars.day} ${profile.timeUnknown ? "时辰未知" : chart.pillars.time}。日主${chart.dayMaster.stem}${chart.dayMaster.elementLabel}。${report.summary}`;
  const shareText = `我刚整理了自己的四柱命盘：日主为${chart.dayMaster.stem}${chart.dayMaster.elementLabel}，五行偏强${chart.wuxing.strongest.map((item) => ({ wood: "木", fire: "火", earth: "土", metal: "金", water: "水" })[item]).join("、")}。命理内容仅供传统文化研究与娱乐参考。`;

  async function copy(kind: "result" | "share") {
    await navigator.clipboard.writeText(kind === "result" ? resultText : shareText);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <section id="result" className="space-y-4 scroll-mt-24">
      <div className="result-cover panel overflow-hidden p-5 text-white sm:p-7">
        <div className="relative z-10 flex flex-wrap items-start justify-between gap-5">
          <div>
            <div className="text-sm text-white/65">命盘结果 · {profile.calendarType === "lunar" ? "农历" : "阳历"}</div>
            <h2 className="mt-2 font-display text-3xl">{profile.name}的命盘</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">{chart.solarText} · {profile.birthPlace} · {profile.timezone === "Asia/Shanghai" || !profile.timezone ? "中国标准时间" : profile.timezone}</p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(chart.pillars).map(([key, value]) => (
              <div key={key} className="min-w-14 border border-white/15 bg-white/5 px-2 py-2 text-center backdrop-blur-sm">
                <div className="text-[10px] text-white/55">{{ year: "年", month: "月", day: "日", time: "时" }[key as "year"]}</div>
                <div className="mt-1 font-display text-lg">{key === "time" && profile.timeUnknown ? "未知" : value}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 mt-6 max-w-3xl text-sm leading-7 text-white/80">{report.summary}</p>
        <div className="relative z-10 mt-5 flex flex-wrap gap-2">
          <button type="button" onClick={() => copy("result")} className="result-action">{copied === "result" ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}复制结果</button>
          <button type="button" onClick={() => copy("share")} className="result-action">{copied === "share" ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}生成分享文案</button>
          <button type="button" onClick={onAsk} className="result-action">基于命盘提问</button>
        </div>
      </div>

      <PillarTable chart={chart} timeUnknown={profile.timeUnknown} />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)]">
        <FiveElementsCard chart={chart} />
        <section className="panel p-5 sm:p-6">
          <div className="flex items-center gap-2"><Network className="h-4 w-4 text-[var(--cinnabar)]" /><h3 className="font-display text-xl">地支关系</h3></div>
          {relations.length > 0 ? (
            <div className="mt-4 space-y-3">
              {relations.map((relation, index) => (
                <div key={`${relation.type}-${relation.branches}-${index}`} className="border-l-2 border-[var(--gold)] pl-3">
                  <div className="text-sm font-medium"><span className="mr-2 text-[var(--cinnabar)]">{relation.type}</span>{relation.branches}</div>
                  <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{relation.note}</p>
                </div>
              ))}
            </div>
          ) : <p className="mt-4 text-sm leading-6 text-[var(--muted)]">四支之间没有形成页面当前识别的明显合、冲、刑、害、破关系。此项只看结构，不作吉凶判断。</p>}
        </section>
      </div>

      <LuckCycleTable chart={chart} />

      <div className="grid gap-4 md:grid-cols-2">
        {report.sections.map((section) => (
          <article key={section.id} className="panel p-5 sm:p-6">
            <h3 className="font-display text-xl">{section.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">{section.body}</p>
            <ul className="mt-4 space-y-2 text-sm leading-6 text-[var(--muted)]">
              {section.bullets.map((item) => <li key={item} className="flex gap-2"><span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--cinnabar)]" />{item}</li>)}
            </ul>
          </article>
        ))}
      </div>

      <div className="border border-[var(--line)] bg-[var(--soft)] px-4 py-3 text-xs leading-6 text-[var(--muted)]">{report.disclaimers.join(" ")}</div>
    </section>
  );
}
