"use client";

import { AlertCircle, ArrowRight, CheckCircle2, ChevronDown, FileQuestion, HeartHandshake, Info, Share2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { getRelationshipBand, relationshipLabels } from "@/lib/compatibility";
import { useLatestCompatibilityReport } from "@/lib/compatibility/storage";
import type { CompatibilityReport } from "@/lib/compatibility";
import type { QuestionInsightData, SharePosterData } from "@/lib/mobile/types";
import { MobileShell } from "./MobileShell";
import { MobileTopBar } from "./MobileTopBar";
import { QuestionInsightSheet } from "./QuestionInsightSheet";
import { SharePosterSheet } from "./SharePosterSheet";
import { ReportDataScope } from "./ReportDataScope";
import { ReportReadingGuide } from "./ReportReadingGuide";

function questionsFor(report: CompatibilityReport): QuestionInsightData[] {
  const lowest = [...report.dimensions].sort((a, b) => a.score - b.score)[0];
  const strongest = [...report.dimensions].sort((a, b) => b.score - a.score)[0];
  return [
    { id: "compatibility-needs", context: "compatibility", prompt: "我们最需要说清楚什么？", shortLabel: "最该说清什么", source: `来自${lowest.label}的相对差异`, interpretation: lowest.summary, observation: lowest.evidence.join("；") || "当前没有形成强相位或明显合冲，现实互动更重要。", action: "选一件最近反复出现的小事，把事实、感受和请求分开说。", tone: "warm" },
    { id: "compatibility-strength", context: "compatibility", prompt: "这段关系最值得保留的是什么？", shortLabel: "最值得保留", source: `来自${strongest.label}的明显连接`, interpretation: strongest.summary, observation: strongest.evidence.join("；") || "这部分更容易通过共同经历建立默契。", action: "把一次有效的相处经验说出来，并约定下次继续怎么做。", tone: "sage" },
    { id: "compatibility-conflict", context: "compatibility", prompt: "发生冲突时应该先做什么？", shortLabel: "冲突时先做什么", source: "来自五个关系维度的综合观察", interpretation: "先停下对动机的猜测，确认双方看到的事实是否相同。", observation: "关系结构只能提示高频惯性，不能替代当下真实情况。", action: "先用一句话复述对方的意思，确认无误后再表达自己的需要。", tone: "coral" },
  ];
}

export function CompatibilityResultPage() {
  const report = useLatestCompatibilityReport();
  const [question, setQuestion] = useState<QuestionInsightData | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const questions = useMemo(() => report ? questionsFor(report) : [], [report]);
  const overallBand = report ? getRelationshipBand(report.overallScore) : null;
  const isDemoReport = Boolean(report?.primary.isDemo || report?.partner.isDemo);
  const poster: SharePosterData | null = report && overallBand ? { id: report.id, category: "question", eyebrow: `${report.mode === "astrology" ? "星盘" : "生辰"}合盘 · ${relationshipLabels[report.relationshipType]}`, title: `${report.primary.name} × ${report.partner.name}`, body: report.summary, tags: [...report.dimensions].sort((a, b) => b.score - a.score).slice(0, 3).map((item) => `${item.label} · ${getRelationshipBand(item.score).label}`), footer: "关系结构用于自我观察，不代表关系结局", tone: "ink" } : null;
  if (!report) return <MobileShell active="tools" theme="home"><MobileTopBar title="合盘结果" /><main className="compatibility-page"><section className="compatibility-empty compatibility-empty--page"><FileQuestion /><strong>还没有可以显示的合盘</strong><p>先选择两份档案并完成一次合盘。</p><Link href="/m/compatibility/create">开始合盘<ArrowRight /></Link></section></main></MobileShell>;
  return <MobileShell active="tools" theme="home">
    <MobileTopBar title={`${report.primary.name} × ${report.partner.name}`} onShare={() => setShareOpen(true)} />
    <main className="compatibility-page compatibility-result">
      <header id="compatibility-summary" className="compatibility-result-cover">
        <small><HeartHandshake />{report.mode === "astrology" ? "星盘关系结构" : "生辰关系结构"}</small>
        <h1>{report.primary.name}<span>×</span>{report.partner.name}</h1>
        <p>{report.summary}</p>
        <div className="compatibility-result-band"><strong>{overallBand?.label}</strong><span>整体关系节奏<small>{overallBand?.note}</small></span></div>
        <footer><span>{relationshipLabels[report.relationshipType]}</span><span>{report.engine.name}</span><span>{new Date(report.createdAt).toLocaleDateString("zh-CN")}</span></footer>
      </header>
      {isDemoReport ? <aside className="compatibility-demo-note">这是示例关系报告，可以完整浏览和生成分享图，但不会保存到你的历史记录。</aside> : null}
      {report.warnings.length ? <section className="compatibility-warnings"><AlertCircle /><div><strong>本报告存在资料边界</strong>{report.warnings.map((item) => <p key={item}>{item}</p>)}</div></section> : null}
      <ReportDataScope
        used={[`${report.primary.name}与${report.partner.name}的出生日期`, report.primary.birthTimeKnown && report.partner.birthTimeKnown ? "双方出生时间" : "仅使用双方现有时辰资料", report.mode === "astrology" ? "双方星体、相位与可用宫位" : "双方四柱、五行与合冲关系"]}
        excluded={[report.mode === "bazi" ? "出生地点未参与当前生辰合盘" : "", "聊天记录、现实经历与对方真实意愿", "关系结果与未来事件预测"].filter(Boolean)}
        engine={`${report.engine.name} ${report.engine.version}`}
        title="这份合盘比较了哪些资料"
      />
      <ReportReadingGuide reportId={`compatibility:${report.id}`} sections={[
        { id: "compatibility-summary", label: "总览" },
        { id: "compatibility-dimensions", label: "维度" },
        { id: "compatibility-report", label: "长报告" },
        { id: "compatibility-questions", label: "问题" },
      ]} />
      <section id="compatibility-dimensions" className="compatibility-dimensions"><header><small>五个关系维度</small><h2>先看相处区间，再读具体依据</h2></header><div>{report.dimensions.map((item) => { const band = getRelationshipBand(item.score); return <article key={item.id}><div><strong>{item.label}</strong><span>{band.label}</span></div><i aria-label={`${item.label}：${band.label}`}><b style={{ width: `${item.score}%` }} /></i><p>{item.summary}</p>{item.evidence.length ? <details><summary>查看结构依据<ChevronDown /></summary>{item.evidence.map((evidence) => <small key={evidence}>{evidence}</small>)}</details> : null}</article>; })}</div></section>
      <section id="compatibility-report" className="compatibility-sections"><header><small>关系长报告</small><h2>从连接、摩擦到可以怎么做</h2></header>{report.sections.map((section, index) => <article key={section.id} className="xs-instrument-card"><small>0{index + 1}</small><h3>{section.title}</h3><strong>{section.conclusion}</strong><p>{section.observation}</p><div><CheckCircle2 /><span>{section.action}</span></div>{section.evidence.length ? <details><summary>结构依据<ChevronDown /></summary>{section.evidence.map((item) => <em key={item}>{item}</em>)}</details> : null}</article>)}</section>
      <section id="compatibility-questions" className="compatibility-questions"><header><small>继续观察</small><h2>把区间变成一个能沟通的问题</h2></header><div>{questions.map((item) => <button type="button" key={item.id} onClick={() => setQuestion(item)}><FileQuestion /><span>{item.prompt}</span><ArrowRight /></button>)}</div></section>
      <section className="compatibility-actions xs-instrument-card"><Info /><div><strong>{isDemoReport ? "先保存一张示例分享图" : "把这份关系观察保存下来"}</strong><p>{isDemoReport ? "创建自己的档案后，新合盘才会进入历史记录。" : "分享图不会显示完整出生资料，只保留双方称呼与结构摘要。"}</p><button type="button" onClick={() => setShareOpen(true)}><Share2 />生成关系分享图</button>{isDemoReport ? <Link href="/m/create?mode=new">创建我的档案<ArrowRight /></Link> : <Link href="/m/compatibility/history">查看历史记录<ArrowRight /></Link>}</div></section>
      <footer className="compatibility-boundary">合盘用于传统文化研究、娱乐与关系观察，不用于判断复合、忠诚、婚姻成败或替代现实沟通。</footer>
    </main>
    <QuestionInsightSheet open={Boolean(question)} question={question} questions={questions} onClose={() => setQuestion(null)} />
    {poster ? <SharePosterSheet open={shareOpen} onClose={() => setShareOpen(false)} items={[poster]} /> : null}
  </MobileShell>;
}
