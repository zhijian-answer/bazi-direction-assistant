"use client";

import { ArrowRight, BookOpenText, Check, Clipboard, Download, Link2, MessageCircleQuestion, Network, Sparkles } from "lucide-react";
import { useState } from "react";
import type { BirthProfile, BirthReport } from "@/lib/types";
import { FiveElementsCard } from "./FiveElementsCard";
import { LuckCycleTable } from "./LuckCycleTable";
import { PillarTable } from "./PillarTable";

const chapterLinks = [
  ["report-overview", "总览"],
  ["report-pillars", "四柱"],
  ["report-ten-gods", "十神"],
  ["wuxing", "五行"],
  ["report-relations", "关系"],
  ["luck", "大运流年"],
  ["report-insights", "解读"],
  ["report-actions", "行动"],
] as const;

export function ResultSection({ profile, report, onAsk }: { profile: BirthProfile; report: BirthReport; onAsk: () => void }) {
  const [copied, setCopied] = useState<"result" | "share" | null>(null);
  const chart = profile.chart;
  const relations = chart.relations || [];
  const resultText = `${profile.name}的命盘：${chart.pillars.year} ${chart.pillars.month} ${chart.pillars.day} ${profile.timeUnknown ? "时辰未知" : chart.pillars.time}。日主${chart.dayMaster.stem}${chart.dayMaster.elementLabel}。${report.summary}`;
  const shareText = `我整理了自己的四柱命盘：日主为${chart.dayMaster.stem}${chart.dayMaster.elementLabel}，五行偏强${chart.wuxing.strongest.map((item) => ({ wood: "木", fire: "火", earth: "土", metal: "金", water: "水" })[item]).join("、")}。内容仅供传统文化研究与娱乐参考。`;

  async function copy(kind: "result" | "share") {
    await navigator.clipboard.writeText(kind === "result" ? resultText : shareText);
    setCopied(kind);
    window.setTimeout(() => setCopied(null), 1800);
  }

  return (
    <section id="result" className="report-experience scroll-mt-24">
      <aside className="report-chapter-nav" aria-label="报告章节">
        <div><BookOpenText aria-hidden="true" /><span>报告目录</span></div>
        <nav>{chapterLinks.map(([href, label], index) => <a key={href} href={`#${href}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>)}</nav>
      </aside>

      <div className="report-document">
        <article id="report-overview" className="report-cover-card">
          <div className="report-cover-meta">
            <span>命盘总览 · {profile.calendarType === "lunar" ? "农历" : "阳历"}</span>
            <em>生成于 {new Date(report.generatedAt).toLocaleDateString("zh-CN")}</em>
          </div>
          <div className="report-cover-main">
            <div>
              <small>玄枢结构化命盘报告</small>
              <h2>{profile.name} · 命盘报告</h2>
              <p>{chart.solarText} · {profile.birthPlace} · {profile.timezone === "Asia/Shanghai" || !profile.timezone ? "中国标准时间" : profile.timezone}</p>
            </div>
            <div className="report-cover-pillars">
              {Object.entries(chart.pillars).map(([key, value]) => (
                <div key={key}><small>{{ year: "年", month: "月", day: "日", time: "时" }[key as "year"]}</small><strong>{key === "time" && profile.timeUnknown ? "未知" : value}</strong></div>
              ))}
            </div>
          </div>
          <p className="report-cover-summary">{report.summary}</p>
          <div className="report-highlights">
            {report.highlights.slice(0, 3).map((item, index) => <div key={item}><span>0{index + 1}</span><p>{item}</p></div>)}
          </div>
          <div className="report-actions">
            <button type="button" onClick={() => copy("result")}>{copied === "result" ? <Check aria-hidden="true" /> : <Clipboard aria-hidden="true" />}{copied === "result" ? "已复制" : "复制结果"}</button>
            <button type="button" onClick={() => copy("share")}>{copied === "share" ? <Check aria-hidden="true" /> : <Link2 aria-hidden="true" />}{copied === "share" ? "已生成" : "生成分享文案"}</button>
            <a href={`/api/share-card?profileId=${encodeURIComponent(profile.id)}&type=cover`} target="_blank" rel="noreferrer"><Download aria-hidden="true" />保存报告封面</a>
            <button type="button" onClick={onAsk}><MessageCircleQuestion aria-hidden="true" />基于命盘提问</button>
          </div>
        </article>

        <section id="report-pillars" className="report-chapter-section">
          <ReportChapterHeading number="01" title="四柱八字" description="先看命盘的基础结构，再理解藏干、十神与纳音。" />
          <PillarTable chart={chart} timeUnknown={profile.timeUnknown} />
        </section>

        <section id="report-ten-gods" className="report-chapter-section">
          <ReportChapterHeading number="02" title="十神分析" description="十神描述资源、表达、行动、规则与关系在四柱中的位置。" />
          <div className="report-ten-gods-grid">
            {(["year", "month", "day", "time"] as const).map((position, index) => (
              <article key={position}>
                <div><span>{["年柱", "月柱", "日柱", "时柱"][index]}</span><strong>{position === "time" && profile.timeUnknown ? "参考" : chart.pillars[position]}</strong></div>
                <p><small>天干十神</small><b>{chart.tenGods[position]}</b></p>
                <p><small>藏干十神</small><b>{(chart.hiddenTenGods?.[position] || []).join(" · ") || "暂无"}</b></p>
              </article>
            ))}
          </div>
          <p className="report-ten-gods-note">十神用于理解行为倾向和关系位置，不等同于性格定论。阅读时应结合五行强弱、地支关系与现实经历。</p>
        </section>

        <section className="report-chapter-section">
          <ReportChapterHeading number="03" title="五行与地支关系" description="五行展示能量分布，地支关系展示结构之间的互动。" />
          <div className="report-two-column">
            <FiveElementsCard chart={chart} />
            <section id="report-relations" className="panel report-relations-card">
              <div className="report-card-title"><Network aria-hidden="true" /><div><small>结构关系</small><h3>地支关系</h3></div></div>
              {relations.length > 0 ? (
                <div className="report-relation-list">{relations.map((relation, index) => <div key={`${relation.type}-${relation.branches}-${index}`}><span>{relation.type}</span><strong>{relation.branches}</strong><p>{relation.note}</p></div>)}</div>
              ) : <p className="report-empty-note">四支之间没有形成页面当前识别的明显合、冲、刑、害、破关系。此处只描述结构，不作吉凶判断。</p>}
            </section>
          </div>
        </section>

        <section className="report-chapter-section">
          <ReportChapterHeading number="04" title="大运与流年" description="把十年阶段和近年节奏放在同一条时间线上阅读。" />
          <LuckCycleTable chart={chart} />
        </section>

        <section id="report-insights" className="report-chapter-section">
          <ReportChapterHeading number="05" title="命盘解读" description="用短章节说明性格底色、事业学习、关系沟通与近期节奏。" />
          <div className="report-insight-list">
            {report.sections.map((section, index) => (
              <article key={section.id}>
                <div><span>{String(index + 1).padStart(2, "0")}</span><h3>{section.title}</h3></div>
                <p>{section.body}</p>
                <ul>{section.bullets.map((item) => <li key={item}><Check aria-hidden="true" />{item}</li>)}</ul>
              </article>
            ))}
          </div>
        </section>

        <section id="report-actions" className="report-action-plan">
          <div><span><Sparkles aria-hidden="true" />行动建议</span><h2>把方向变成下一步</h2><p>不必一次解决所有问题。先完成一个可验证的小动作，再根据结果调整。</p></div>
          <ol>{report.actionPlan.map((item, index) => <li key={item}><span>{String(index + 1).padStart(2, "0")}</span><p>{item}</p></li>)}</ol>
          <button type="button" onClick={onAsk}>带着这份报告继续提问 <ArrowRight aria-hidden="true" /></button>
        </section>

        <div className="report-disclaimer">{report.disclaimers.join(" ")}</div>
      </div>
    </section>
  );
}

function ReportChapterHeading({ number, title, description }: { number: string; title: string; description: string }) {
  return <header className="report-chapter-heading"><span>CH {number}</span><div><h2>{title}</h2><p>{description}</p></div></header>;
}
