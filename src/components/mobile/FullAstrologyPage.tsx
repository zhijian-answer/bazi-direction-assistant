"use client";

import { AlertCircle, ArrowRight, CheckCircle2, CircleDotDashed, Info, Orbit, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";
import { buildCurrentTransitChart, buildProfileZodiacChart } from "@/lib/astrology/profileChart";
import { useMobileProfileState } from "@/lib/mobile/profile";
import type { MobileProfile } from "@/lib/mobile/types";
import { bodyLabels, signName } from "@/lib/zodiac/contentCatalog";
import { formatZodiacDegree } from "@/lib/zodiac/format";
import { zodiacBodyKeys } from "@/lib/zodiac";
import type { ZodiacBodyKey, ZodiacChart } from "@/lib/zodiac/types";
import { AstrologyWheel } from "./AstrologyWheel";
import { MobileShell } from "./MobileShell";
import { MobileTopBar } from "./MobileTopBar";
import { ProfileSwitcherSheet } from "./ProfileSwitcherSheet";
import { SharePosterSheet } from "./SharePosterSheet";
import type { SharePosterData } from "@/lib/mobile/types";
import { ReportDataScope } from "./ReportDataScope";
import { ReportReadingGuide } from "./ReportReadingGuide";

const aspectLabels: Record<string, string> = { conjunction: "合相", sextile: "六合相", square: "刑相", trine: "拱相", opposition: "冲相" };
const bodyFocus: Record<ZodiacBodyKey, string> = {
  sun: "主动追求与自我认同", moon: "情绪需要与恢复方式", mercury: "理解信息与表达观点", venus: "价值偏好与亲密方式", mars: "行动节奏与冲突反应",
  jupiter: "扩展机会与成长方式", saturn: "责任边界与长期建设", uranus: "改变惯性与独立需要", neptune: "想象、共情与理想投射", pluto: "深层转变与控制议题",
};

function pointLabel(point: string) {
  if (point === "ascendant") return "上升";
  if (point === "midheaven") return "天顶";
  return bodyLabels[point as ZodiacBodyKey] || point;
}

function ChartDetails({ chart, selected, onSelect }: { chart: ZodiacChart; selected: ZodiacBodyKey; onSelect: (body: ZodiacBodyKey) => void }) {
  const placement = chart.placements[selected];
  const selectedAspects = chart.aspects.filter((item) => item.point1 === selected || item.point2 === selected).slice(0, 6);
  return <>
    <section id="chart-focus" className="full-chart-focus xs-instrument-card">
      <small>当前观察 · {bodyLabels[selected]}</small>
      <h2>{bodyLabels[selected]}落在{signName(placement.sign)}{placement.house ? `第 ${placement.house} 宫` : ""}</h2>
      <p>{bodyFocus[selected]}。这里先显示结构位置与相位依据，不把星体标签直接当作确定性格判断。</p>
      <div><span>{formatZodiacDegree(placement.degree)}</span><span>{placement.retrograde ? "逆行" : "顺行"}</span><span>{selectedAspects.length} 组主要相位</span></div>
    </section>
    <section id="chart-planets" className="full-chart-section">
      <header><small>十颗主要星体</small><h2>先看位置，再读解释</h2></header>
      <div className="full-chart-planet-list">
        {zodiacBodyKeys.map((body) => {
          const item = chart.placements[body];
          return <button type="button" key={body} className={selected === body ? "is-active" : ""} onClick={() => onSelect(body)}>
            <span><b>{bodyLabels[body]}</b><small>{bodyFocus[body]}</small></span>
            <em>{signName(item.sign)} · {formatZodiacDegree(item.degree)}{item.house ? ` · ${item.house} 宫` : ""}</em>
            <ArrowRight />
          </button>;
        })}
      </div>
    </section>
    {chart.houses.length ? <section id="chart-houses" className="full-chart-section">
      <header><small>十二宫</small><h2>生活领域如何分布</h2></header>
      <div className="full-chart-house-grid">{chart.houses.map((house) => <article key={house.id}><span>{String(house.id).padStart(2, "0")}</span><strong>{signName(house.sign)}</strong><small>{formatZodiacDegree(house.cusp)}</small></article>)}</div>
    </section> : null}
    <section id="chart-aspects" className="full-chart-section">
      <header><small>主要相位</small><h2>星体之间如何形成张力与支持</h2></header>
      <div className="full-chart-aspects">{chart.aspects.slice(0, 18).map((aspect, index) => <article key={`${aspect.point1}-${aspect.point2}-${index}`}><CircleDotDashed /><div><strong>{pointLabel(aspect.point1)} · {pointLabel(aspect.point2)}</strong><small>{aspectLabels[aspect.type] || aspect.type} · 容许度 {aspect.orb.toFixed(1)}°</small></div></article>)}</div>
    </section>
  </>;
}

const subscribeToDate = () => () => {};

function currentLocalNoon() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0).toISOString();
}

export function FullAstrologyPage({ initialMode = "natal", transitSeed }: { initialMode?: "natal" | "transit"; transitSeed: string }) {
  const { profile, hasProfile } = useMobileProfileState();
  if (!hasProfile || !profile.birthDate) {
    return (
      <MobileShell active="report" theme="zodiac">
        <main className="full-chart-page">
          <section className="full-chart-warning" style={{ marginTop: 72 }}>
            <AlertCircle />
            <div>
              <strong>先建立出生档案</strong>
              <p>完整星盘至少需要出生日期。出生时间或地点暂时不确定时，我们只展示能够可靠计算的部分，不会代填默认资料。</p>
              <Link href="/m/create">创建我的档案<ArrowRight /></Link>
            </div>
          </section>
        </main>
      </MobileShell>
    );
  }
  return <FullAstrologyContent initialMode={initialMode} transitSeed={transitSeed} profile={profile} />;
}

function FullAstrologyContent({ initialMode, transitSeed, profile }: {
  initialMode: "natal" | "transit";
  transitSeed: string;
  profile: MobileProfile;
}) {
  const natal = useMemo(() => buildProfileZodiacChart(profile), [profile]);
  const transitTimestamp = useSyncExternalStore(subscribeToDate, currentLocalNoon, () => transitSeed);
  const transit = useMemo(() => buildCurrentTransitChart(profile, new Date(transitTimestamp)), [profile, transitTimestamp]);
  const [mode, setMode] = useState<"natal" | "transit">(initialMode);
  const [selected, setSelected] = useState<ZodiacBodyKey>("sun");
  const [profileOpen, setProfileOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const chart = mode === "natal" ? natal.chart : transit;
  const selectedPlacement = chart.placements[selected];
  const poster: SharePosterData = {
    id: `full-chart-${profile.id || "local"}-${mode}-${selected}`,
    category: "zodiac",
    eyebrow: mode === "natal" ? "我的完整星盘" : "今日天象观察",
    title: `${bodyLabels[selected]}落在${signName(selectedPlacement.sign)}${selectedPlacement.house ? `第 ${selectedPlacement.house} 宫` : ""}`,
    body: `${bodyFocus[selected]}。这张卡保留当前选中的结构位置，不把星体标签当作确定性格判断。`,
    tags: [formatZodiacDegree(selectedPlacement.degree), selectedPlacement.retrograde ? "逆行" : "顺行", `${chart.aspects.filter((item) => item.point1 === selected || item.point2 === selected).length} 组主要相位`],
    footer: "玄枢 · 完整星盘结构观察",
    tone: "sky",
  };
  const scope = mode === "natal" ? {
    used: ["公历出生日期", profile.birthTimeKnown && profile.birthTime ? `出生时间 ${profile.birthTime}` : "不依赖时辰的星体位置", natal.hasLocation ? `出生地点 ${natal.locationLabel}` : "不使用个人宫位"],
    excluded: [!profile.birthTimeKnown || !profile.birthTime ? "上升、天顶与宫位" : "", !natal.hasLocation ? "地点相关宫位计算" : "", "现实经历与个人选择"].filter(Boolean),
  } : {
    used: ["当天日期", "热带黄道星体位置"],
    excluded: ["个人出生资料", "个人宫位", "个人行运叠盘"],
  };
  return (
    <MobileShell active="report" theme="zodiac">
      <MobileTopBar title={profile.name} onProfileClick={() => setProfileOpen(true)} onShare={() => setShareOpen(true)} />
      <main className="full-chart-page">
        <header id="chart-summary" className="full-chart-hero">
          <small><Orbit />完整星盘</small>
          <h1>把星体、宫位与相位<br /><span>放回同一张结构图</span></h1>
          <p>不只看太阳、月亮和上升。先保留完整盘面，再选择你真正想理解的部分。</p>
          <nav aria-label="星盘类型"><button type="button" className={mode === "natal" ? "is-active" : ""} onClick={() => setMode("natal")}>本命盘</button><button type="button" className={mode === "transit" ? "is-active" : ""} onClick={() => setMode("transit")}>今日天象</button></nav>
        </header>
        {mode === "natal" && natal.warnings.length ? <section className="full-chart-warning"><AlertCircle /><div><strong>当前为部分星盘</strong>{natal.warnings.map((item) => <p key={item}>{item}</p>)}<Link href="/m/create">补充资料<ArrowRight /></Link></div></section> : null}
        <ReportDataScope used={scope.used} excluded={scope.excluded} engine={`${chart.engine}@${chart.engineVersion}`} title={mode === "natal" ? "本命盘使用了哪些资料" : "今日天象使用了哪些资料"} />
        <ReportReadingGuide reportId={`chart:${profile.id || "local"}:${mode}`} sections={[
          { id: "chart-summary", label: "说明" },
          { id: "chart-wheel", label: "盘面" },
          { id: "chart-planets", label: "星体" },
          ...(chart.houses.length ? [{ id: "chart-houses", label: "宫位" }] : []),
          { id: "chart-aspects", label: "相位" },
        ]} />
        <section id="chart-wheel" className="full-chart-instrument xs-instrument-card">
          <header><span><Sparkles />{mode === "natal" ? `${profile.name}的本命结构` : "今日天象位置"}</span><small>{chart.engine} · {chart.engineVersion}</small></header>
          <AstrologyWheel chart={chart} selectedBody={selected} onSelect={setSelected} mode={mode === "natal" ? "natal" : "sky"} />
          <footer>{mode === "natal" ? <><span>{chart.ascendant ? `上升 ${signName(chart.ascendant.sign)}` : "上升待补充"}</span><span>{chart.midheaven ? `天顶 ${signName(chart.midheaven.sign)}` : "天顶待补充"}</span></> : <><span>今日天象不使用个人宫位</span><span>不是个人行运叠盘</span></>}</footer>
        </section>
        <ChartDetails chart={chart} selected={selected} onSelect={setSelected} />
        <section className="full-chart-next xs-instrument-card"><Info /><div><strong>想把两个人放在同一张结构里？</strong><p>进入合盘后，可分别查看星盘关系与生辰关系；关系区间只作为阅读导航。</p><Link href="/m/compatibility/create?mode=astrology">开始星盘合盘<ArrowRight /></Link></div></section>
        <footer className="full-chart-boundary"><CheckCircle2 /><p>采用热带黄道、整宫制展示。内容用于占星结构研究与自我观察，不替代现实沟通与重大决定。</p><button type="button" onClick={() => setShareOpen(true)}><Share2 />生成当前星体分享图</button></footer>
      </main>
      <ProfileSwitcherSheet open={profileOpen} onClose={() => setProfileOpen(false)} />
      <SharePosterSheet open={shareOpen} onClose={() => setShareOpen(false)} items={[poster]} />
    </MobileShell>
  );
}
