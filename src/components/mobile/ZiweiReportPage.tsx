"use client";

import { AlertCircle, ArrowRight, CheckCircle2, CircleDotDashed, Gauge, HeartHandshake, ImageDown, Settings2, ShieldCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { buildZiweiPosters, buildZiweiQuestions, mobileProfileToZiweiInput } from "@/lib/mobile/ziweiAdapter";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { QuestionInsightData } from "@/lib/mobile/types";
import type { ZiweiCalculationResult } from "@/lib/ziwei/contracts";
import { calculateZiweiInsight } from "@/lib/ziwei/service";
import { trackMobileEvent } from "@/lib/mobile/analytics";
import { useNarrativeCard } from "@/lib/narrative/client";
import type { NarrativeRequest } from "@/lib/narrative/contracts";
import { MobileShell } from "./MobileShell";
import { ReportBrandBar } from "./ReportBrandBar";
import { MobileReveal } from "./Reveal";
import { QuestionInsightSheet } from "./QuestionInsightSheet";
import { QuestionPromptGrid } from "./QuestionPromptGrid";
import { SharePosterSheet } from "./SharePosterSheet";
import { StickySegmentTabs } from "./StickySegmentTabs";
import { ZiweiPalaceMap } from "./ZiweiPalaceMap";
import { useReportPersistence } from "./useReportPersistence";
import { ProfileSwitcherSheet } from "./ProfileSwitcherSheet";
import { ReportDataScope } from "./ReportDataScope";
import { ReportReadingGuide } from "./ReportReadingGuide";
import { ReportDepthPrompt, ReportReadingModeSwitch, type ReportReadingMode } from "./ReportReadingModeSwitch";

const tabs = [
  { id: "bazi", label: "生辰", href: "/m/report/bazi" },
  { id: "zodiac", label: "星座", href: "/m/report/zodiac" },
  { id: "chart", label: "星盘", href: "/m/chart" },
  { id: "ziwei", label: "紫微" },
];

export function ZiweiReportPage() {
  const profile = useMobileProfile();
  const profileKey = JSON.stringify([profile.calendarType, profile.birthDate, profile.birthTime, profile.birthTimeKnown, profile.gender, profile.isLeapMonth]);
  const [calculation, setCalculation] = useState<{ profileKey: string; result: ZiweiCalculationResult } | null>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionInsightData | null>(null);
  const [posterOpen, setPosterOpen] = useState(false);
  const [profileSwitcherOpen, setProfileSwitcherOpen] = useState(false);
  const [readingMode, setReadingMode] = useState<ReportReadingMode>("quick");

  useEffect(() => {
    let active = true;
    calculateZiweiInsight(mobileProfileToZiweiInput(profile)).then((next) => {
      if (active) setCalculation({ profileKey, result: next });
    });
    return () => { active = false; };
  }, [profile, profileKey]);

  useEffect(() => {
    trackMobileEvent("report_view", { reportType: "ziwei", profileKind: profile.isDemo ? "demo" : "local" });
  }, [profile.isDemo]);

  const result = calculation?.profileKey === profileKey ? calculation.result : null;
  const insight = result?.status === "ready" ? result.insight : null;
  const questions = useMemo(() => insight ? buildZiweiQuestions(insight) : [], [insight]);
  const ziweiNarrativeInput = useMemo<NarrativeRequest | null>(() => insight ? ({
    context: "ziwei",
    slot: "hero",
    signals: [
      `ming:${insight.evidence.mingGong || "unknown"}`,
      `shen:${insight.evidence.shenGong || "unknown"}`,
      ...insight.evidence.majorStars.slice(0, 3).map((star) => `star:${star}`),
    ],
    facts: [
      { label: "命宫", value: insight.evidence.mingGong || "未识别" },
      { label: "身宫", value: insight.evidence.shenGong || "未识别" },
      { label: "重点星曜", value: insight.evidence.majorStars.join("、") || "空宫结合对宫观察" },
      { label: "关系表现", value: insight.relationship.summary },
      { label: "稳定条件", value: insight.environment.stableZone.join("；") },
    ],
    fallback: {
      hook: insight.identity.title,
      scene: insight.identity.summary,
      misunderstanding: `关系里出现含糊回应时，你更容易反复确认；这不等于多疑，而是在减少信息空白。`,
      evidenceSummary: `依据：${insight.evidence.mingGong || "命宫待确认"} · ${insight.evidence.shenGong || "身宫待确认"} · ${insight.evidence.majorStars.slice(0, 3).join("、") || "宫位关系"}`,
      action: insight.today.action,
      nextQuestion: questions[0]?.prompt || "最近最值得我投入的领域是什么？",
    },
  }) : null, [insight, questions]);
  const ziweiNarrative = useNarrativeCard(ziweiNarrativeInput);
  const posters = useMemo(() => {
    if (!insight) return [];
    return buildZiweiPosters(insight).map((poster, index) => index === 0 && ziweiNarrative ? {
      ...poster,
      title: ziweiNarrative.hook,
      body: ziweiNarrative.scene,
    } : poster);
  }, [insight, ziweiNarrative]);
  useReportPersistence("ziwei", insight as unknown as Record<string, unknown> | undefined, "iztro-market-v1");

  useEffect(() => {
    if (result?.status === "insufficient_input") trackMobileEvent("insufficient_data_show", { reportType: "ziwei", reasons: result.reasons.join(",") });
  }, [result]);

  return (
    <MobileShell theme="ziwei" active="ziwei">
      <ReportBrandBar profileName={profile.name} onProfileClick={() => setProfileSwitcherOpen(true)} />
      <StickySegmentTabs tabs={tabs} active="ziwei" label="报告类型" />

      <div className="market-report market-report--ziwei" data-reading-mode={readingMode}>
      {!result ? <ZiweiLoading /> : null}
      {result?.status === "insufficient_input" ? <ZiweiUnavailable reasons={result.reasons} /> : null}
      {result?.status === "calculation_error" ? <ZiweiError message={result.message} /> : null}

      {insight ? (
        <>
          <header className="ziwei-report-heading">
            <small>紫微领域报告</small>
            <h1>紫微报告</h1>
            <p>从十二个人生领域观察精力分布、行动重心与恢复方式。</p>
          </header>

          <section id="ziwei-summary" className="ziwei-cover-card">
            <Image className="ziwei-cover-instrument" src="/mobile/style-lab-assets/ziwei-hero-instrument.png" alt="" aria-hidden="true" width={421} height={360} priority sizes="230px" />
            <header><span><CircleDotDashed />命宫 · 身宫 · 十二领域</span><small>依据真实出生时辰</small></header>
            <p className="ziwei-cover-kicker">人生领域观察</p>
            <h2><strong>{ziweiNarrative?.hook || insight.identity.title}</strong></h2>
            <p>{ziweiNarrative?.scene || insight.identity.summary}</p>
            <div>{insight.identity.tags.slice(0, 3).map((tag) => <span key={tag}>{tag}</span>)}</div>
            <footer><small>今天先做这一件</small><strong>{insight.today.keyword}</strong><span>{ziweiNarrative?.action || insight.today.action}</span></footer>
          </section>

          <ReportDataScope
            used={[`${profile.calendarType === "lunar" ? "农历" : "公历"}出生日期`, `出生时间 ${profile.birthTime}`, "排盘性别"]}
            excluded={["出生地点未参与当前紫微排盘", "现实经历与个人选择"]}
            engine={`${insight.evidence.engine} ${insight.evidence.engineVersion}`}
          />
          <ReportReadingModeSwitch mode={readingMode} onChange={setReadingMode} professionalLabel="十二宫与依据" />
          <ReportReadingGuide reportId={`ziwei:${profile.id || "local"}`} sections={[
            { id: "ziwei-summary", label: "总览" },
            { id: "ziwei-overview", label: "领域" },
            { id: "ziwei-life", label: "生活" },
            { id: "ziwei-questions", label: "问题" },
            ...(readingMode === "professional" ? [
              { id: "ziwei-palaces", label: "十二宫" },
              { id: "ziwei-evidence", label: "依据" },
            ] : []),
          ]} />

          <MobileReveal>
            <section id="ziwei-overview" className="ziwei-domain-overview">
              <header className="ziwei-section-heading"><span><CircleDotDashed /></span><div><small>领域总览</small><h2>先看这张盘实际提取出的三组线索</h2></div></header>
              <p>下面内容来自命宫、身宫、关系宫位和当前阶段数据，不使用固定人格模板冒充个人结论。</p>
              <div className="ziwei-domain-brief">
                <div><span><Gauge /></span><small>核心气质</small><strong>{insight.identity.title}</strong></div>
                <div><span><HeartHandshake /></span><small>关系回应</small><strong>{insight.relationship.summary}</strong></div>
                <div><span><ShieldCheck /></span><small>稳定条件</small><strong>{insight.environment.stableZone[0]}</strong></div>
              </div>
            </section>
          </MobileReveal>

          <MobileReveal delay={0.05}>
            <section id="ziwei-palaces" className="ziwei-palace-section report-depth--professional">
              <header className="ziwei-section-heading"><span><CircleDotDashed /></span><div><small>真实盘面数据</small><h2>十二宫结构</h2></div><button type="button" onClick={() => questions[0] && setSelectedQuestion(questions[0])}>查看问题解读<ArrowRight /></button></header>
              <ZiweiPalaceMap mingGong={insight.evidence.mingGong} shenGong={insight.evidence.shenGong} palaces={insight.evidence.palaces} />
              <p className="ziwei-palace-note">宫位中的文字来自当前档案实际排盘；无主星时显示宫位干支，不用固定星曜填充。</p>
            </section>
          </MobileReveal>

          {readingMode === "quick" ? <ReportDepthPrompt title="查看十二宫盘面和命盘证据" note="快速版先保留领域结论与行动建议，需要核对星曜和四化时再展开。" onOpen={() => setReadingMode("professional")} /> : null}

          <MobileReveal delay={0.08}>
            <section className="ziwei-focus-instrument">
              <header className="ziwei-section-heading"><div><small>阅读顺序</small><h2>从今天最相关的部分开始</h2></div><span><Gauge /></span></header>
              <div className="ziwei-focus-tracks">
                <div className="ziwei-focus-track ziwei-focus-track--work"><span>工作主线</span><i /><strong>先守住</strong></div>
                <div className="ziwei-focus-track ziwei-focus-track--relation"><span>关系回应</span><i /><strong>先确认</strong></div>
                <div className="ziwei-focus-track ziwei-focus-track--recovery"><span>恢复方式</span><i /><strong>先回稳</strong></div>
              </div>
            </section>
          </MobileReveal>

          <section id="ziwei-life" className="ziwei-life-grid">
            <MobileReveal><article><header><Gauge />工作主线</header><h2>先把已有积累变成反馈</h2><p>{insight.stage.summary}</p><strong>别急着开新方向，先完成一件能带来反馈的关键任务。</strong></article></MobileReveal>
            <MobileReveal><article><header><HeartHandshake />关系回应</header><h2>先确认事实，再决定投入多少</h2><p>{insight.relationship.summary}</p><strong>提出一个具体问题，观察回应是否持续。</strong></article></MobileReveal>
            <MobileReveal><article><header><ShieldCheck />恢复方式</header><h2>回到能让你稳定发挥的条件</h2><ul>{insight.environment.stableZone.map((item) => <li key={item}>{item}</li>)}</ul></article></MobileReveal>
            <MobileReveal><article><header><AlertCircle />需要减少的消耗</header><h2>不是每件事都要立刻得到答案</h2><ul>{insight.environment.drainZone.map((item) => <li key={item}>{item}</li>)}</ul></article></MobileReveal>
          </section>

          <section id="ziwei-questions" className="ziwei-question-section">
            <QuestionPromptGrid questions={questions} onSelect={setSelectedQuestion} title="现在最想先看懂哪一件事" compact />
          </section>

          <section className="ziwei-share-card">
            <small>保存这一刻的观察</small><h2>把领域重点封存成一张图</h2><p>分享图只保留白话结论、行动建议和必要边界，不展示复杂专业盘。</p>
            <button className="xs-pressable" type="button" onClick={() => setPosterOpen(true)}><ImageDown />生成紫微分享图</button>
          </section>

          <section id="ziwei-evidence" className="ziwei-evidence-card report-depth--professional">
            <header><Sparkles /><div><small>专业依据</small><h2>结论来自哪些结构</h2></div></header>
            <details><summary>查看命盘证据</summary><dl><div><dt>命宫</dt><dd>{insight.evidence.mingGong || "未识别"}</dd></div><div><dt>身宫</dt><dd>{insight.evidence.shenGong || "未识别"}</dd></div><div><dt>重点星曜</dt><dd>{insight.evidence.majorStars.join("、") || "空宫，结合对宫观察"}</dd></div><div><dt>四化</dt><dd>{insight.evidence.mutagens.join("、") || "未提取"}</dd></div><div><dt>计算引擎</dt><dd>{insight.evidence.engine} {insight.evidence.engineVersion} · {insight.evidence.license}</dd></div></dl></details>
          </section>

          <section className="report-boundary"><CheckCircle2 /><p>紫微内容用于传统文化研究、娱乐和自我观察。它描述的是结构倾向，不预测具体事件，也不替代现实信息和专业意见。</p></section>
        </>
      ) : null}
      </div>

      <QuestionInsightSheet key={selectedQuestion?.id || "ziwei-question"} open={Boolean(selectedQuestion)} question={selectedQuestion} questions={questions} onClose={() => setSelectedQuestion(null)} />
      {posters.length ? <SharePosterSheet key={`ziwei-poster-${posterOpen}`} open={posterOpen} onClose={() => setPosterOpen(false)} items={posters} /> : null}
      <ProfileSwitcherSheet open={profileSwitcherOpen} onClose={() => setProfileSwitcherOpen(false)} />
    </MobileShell>
  );
}

function ZiweiLoading() {
  return <section className="ziwei-state"><CircleDotDashed className="is-spinning" /><strong>正在整理紫微领域结构</strong><p>只在本地计算，不调用远程 AI。</p></section>;
}

function ZiweiUnavailable({ reasons }: { reasons: string[] }) {
  const needsTime = reasons.includes("birth_time_unknown") || reasons.includes("invalid_birth_time");
  return <section className="ziwei-state ziwei-state--notice"><AlertCircle /><strong>完整紫微报告还需要补充资料</strong><p>{needsTime ? "紫微十二宫依赖出生时辰，我们不会用中午或随机时间代替。" : "紫微运限方向需要明确排盘所需性别，当前资料不足。"}</p><Link href="/m/create"><Settings2 />补充出生资料<ArrowRight /></Link><Link href="/m/report/bazi" className="is-secondary">先看生辰报告</Link></section>;
}

function ZiweiError({ message }: { message: string }) {
  return <section className="ziwei-state ziwei-state--notice"><AlertCircle /><strong>暂时没有生成成功</strong><p>{message}</p><Link href="/m/create"><Settings2 />检查出生资料<ArrowRight /></Link></section>;
}
