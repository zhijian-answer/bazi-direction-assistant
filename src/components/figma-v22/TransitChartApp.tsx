"use client";

import { ChevronLeft, ChevronRight, CircleAlert, RotateCcw, Share2 } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { buildCurrentTransitChart, buildProfileZodiacChart } from "@/lib/astrology/profileChart";
import { useMobileProfileState } from "@/lib/mobile/profile";
import { useReportNarrative } from "@/lib/narrative/reportClient";
import type { ReportNarrativeRequest } from "@/lib/narrative/reportContracts";
import { bodyLabels, signName } from "@/lib/zodiac/contentCatalog";
import { formatZodiacDegree } from "@/lib/zodiac/format";
import type { ZodiacBodyKey, ZodiacChart } from "@/lib/zodiac/types";
import { Card, NatalChartWheel, Segment } from "./NatalChartScreen";
import type { FigmaNatalPlanet, FigmaNatalViewModel } from "./viewModels";

const bodyOrder: ZodiacBodyKey[] = ["sun", "moon", "mercury", "venus", "mars", "jupiter", "saturn", "uranus", "neptune", "pluto"];
const colors = ["#E8816A", "#7BBDE0", "#6BBFA0", "#E9C97E", "#F08E78", "#88CCA8", "#C0ACDE", "#8C82A4", "#7A9CC6", "#9A7B8F"];
const aspectNames: Record<string, string> = { conjunction: "合相", sextile: "六合", square: "四分", trine: "三合", opposition: "对冲" };

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function dayKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function toPlanets(chart: ZodiacChart): FigmaNatalPlanet[] {
  return bodyOrder.map((body, index) => {
    const placement = chart.placements[body];
    return {
      key: body,
      label: bodyLabels[body].slice(0, 1),
      color: colors[index],
      sign: signName(placement.sign),
      house: placement.house,
      name: bodyLabels[body],
      degree: formatZodiacDegree(placement.degree),
      angle: placement.degree,
      description: `${bodyLabels[body]}目前位于${signName(placement.sign)}，可以把它理解为当下共同氛围的一部分。`,
    };
  });
}

function toAspects(chart: ZodiacChart): FigmaNatalViewModel["aspects"] {
  return chart.aspects
    .filter((item) => bodyOrder.includes(item.point1 as ZodiacBodyKey) && bodyOrder.includes(item.point2 as ZodiacBodyKey))
    .slice(0, 14)
    .map((item) => ({
      point1: item.point1 as ZodiacBodyKey,
      point2: item.point2 as ZodiacBodyKey,
      title: `${bodyLabels[item.point1 as ZodiacBodyKey]} · ${bodyLabels[item.point2 as ZodiacBodyKey]}`,
      type: item.type,
      orb: `${item.orb.toFixed(1)}°`,
    }));
}

function formatDay(date: Date) {
  return new Intl.DateTimeFormat("zh-CN", { month: "long", day: "numeric", weekday: "short" }).format(date);
}

const screenStyle: React.CSSProperties = {
  minHeight: "100dvh",
  background: "linear-gradient(168deg, #EBF5FF 0%, #F0F9F5 50%, #FDF4F1 100%)",
  color: "#28253D",
  fontFamily: "'Noto Sans SC', sans-serif",
};

export default function TransitChartApp() {
  const { profile, hasProfile } = useMobileProfileState();
  const [date, setDate] = useState(() => new Date());
  const [tab, setTab] = useState(0);
  const [selected, setSelected] = useState<ZodiacBodyKey>("sun");

  const natal = useMemo(() => hasProfile && profile.birthDate ? buildProfileZodiacChart(profile) : null, [hasProfile, profile]);
  const transit = useMemo(() => hasProfile ? buildCurrentTransitChart(profile, new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12)) : null, [date, hasProfile, profile]);
  const planets = useMemo(() => transit ? toPlanets(transit) : [], [transit]);
  const aspects = useMemo(() => transit ? toAspects(transit) : [], [transit]);

  const request = useMemo<ReportNarrativeRequest | null>(() => {
    if (!transit || !natal) return null;
    const selectedTransit = transit.placements[selected];
    const selectedNatal = natal.chart.placements[selected];
    const fallback = {
      title: "今天更适合先观察，再决定要不要推进。",
      summary: "天象描述的是当下共同氛围。把它和你的本命位置放在一起看，可以帮助你留意情绪、沟通和行动节奏，但不会替你决定具体结果。",
      action: "选一件今天能够确认的小事，先看现实反馈，再决定下一步。",
      shareLine: "先看清正在发生什么，再决定要不要向前。",
      questions: ["今天最值得留意什么？", "哪些情绪不必马上回应？", "现在适合推进还是等待？"],
      sections: [
        { id: "observe", title: "可以观察什么", body: "留意今天哪些事情反复占据你的注意力，以及它们是否真的需要立刻处理。" },
        { id: "pace", title: "近期节奏", body: "先完成手边已经开始的事情，再给新的决定留一点空间。" },
      ],
    };
    return {
      context: "zodiac",
      reportKey: `${profile.id || profile.birthDate}:transit:${dayKey(date)}:${selected}`,
      facts: [
        { label: "观察日期", value: dayKey(date) },
        { label: "当前星体", value: `${bodyLabels[selected]}位于${signName(selectedTransit.sign)} ${formatZodiacDegree(selectedTransit.degree)}` },
        { label: "本命位置", value: `${bodyLabels[selected]}位于${signName(selectedNatal.sign)} ${formatZodiacDegree(selectedNatal.degree)}` },
        ...aspects.slice(0, 6).map((item) => ({ label: "当前相位", value: `${item.title} ${aspectNames[item.type] || item.type}，容许度${item.orb}` })),
      ],
      fallback,
    };
  }, [aspects, date, natal, profile.birthDate, profile.id, selected, transit]);
  const narrative = useReportNarrative(request);
  const copy = narrative?.bundle;

  if (!hasProfile || !profile.birthDate) {
    return (
      <main style={{ ...screenStyle, display: "grid", placeItems: "center", padding: 24 }}>
        <Card style={{ maxWidth: 390, padding: 24, textAlign: "center" }}>
          <CircleAlert size={28} color="#E8816A" />
          <h1 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 22 }}>先留下出生日期，才能继续看</h1>
          <p style={{ color: "#6D6880", lineHeight: 1.8 }}>本命位置需要出生资料。时间不确定也可以先填写，玄枢会明确标注哪些内容暂时不能确认。</p>
          <Link href="/m/create" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", padding: "0 18px", borderRadius: 14, background: "#9A7BB8", color: "#fff", textDecoration: "none" }}>补充出生资料</Link>
        </Card>
      </main>
    );
  }

  if (!transit || !natal || !copy) return null;
  const activePlanet = planets.find((item) => item.key === selected) || planets[0];
  const natalPlacement = natal.chart.placements[selected];

  return (
    <main style={screenStyle}>
      <header style={{ position: "sticky", top: 0, zIndex: 5, padding: "48px 18px 12px", background: "rgba(235,245,255,.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(123,189,224,.18)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
          <Link href="/m/tools" aria-label="返回工具" style={{ width: 44, height: 44, display: "grid", placeItems: "center", borderRadius: 22, background: "rgba(255,255,255,.85)", color: "#6D6880", textDecoration: "none" }}><ChevronLeft /></Link>
          <div style={{ flex: 1 }}><strong style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 18 }}>当前行运</strong><div style={{ color: "#8A8499", fontSize: 11 }}>{profile.name} · 本命与当下对照</div></div>
          <button type="button" aria-label="分享当前行运" style={{ width: 44, height: 44, border: 0, borderRadius: 22, background: "rgba(255,255,255,.85)", color: "#9A7BB8" }}><Share2 size={18} /></button>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "44px 1fr 44px", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <button type="button" aria-label="前一天" onClick={() => setDate((value) => addDays(value, -1))} style={{ height: 44, border: 0, borderRadius: 14, background: "rgba(255,255,255,.72)", color: "#7BBDE0" }}><ChevronLeft /></button>
          <button type="button" onClick={() => setDate(new Date())} style={{ height: 44, border: 0, borderRadius: 14, background: "rgba(255,255,255,.82)", color: "#39354C", fontWeight: 600 }}>{formatDay(date)}</button>
          <button type="button" aria-label="后一天" onClick={() => setDate((value) => addDays(value, 1))} style={{ height: 44, border: 0, borderRadius: 14, background: "rgba(255,255,255,.72)", color: "#7BBDE0" }}><ChevronRight /></button>
        </div>
        <Segment tabs={["概览", "行星", "相位", "依据"]} active={tab} onChange={setTab} />
      </header>

      <div style={{ maxWidth: 430, margin: "0 auto", padding: "16px 16px 110px" }}>
        {tab === 0 && <>
          <Card style={{ padding: "18px 16px", marginBottom: 14 }}>
            <div style={{ color: "#9A7BB8", fontSize: 11, marginBottom: 8 }}>今天的重点</div>
            <h1 style={{ margin: 0, fontFamily: "'Noto Serif SC', serif", fontSize: 23, lineHeight: 1.45 }}>{copy.title}</h1>
            <p style={{ margin: "10px 0 0", color: "#666078", fontSize: 14, lineHeight: 1.8 }}>{copy.summary}</p>
          </Card>
          <Card style={{ overflow: "hidden", marginBottom: 14 }}>
            <div style={{ padding: "12px 16px 0", display: "flex", justifyContent: "space-between", color: "#807990", fontSize: 11 }}><span>当天星体位置</span><span>点击下方行星查看</span></div>
            <div style={{ display: "grid", placeItems: "center", overflow: "hidden" }}><NatalChartWheel planets={planets} aspects={aspects} /></div>
          </Card>
          <Card style={{ padding: 18, marginBottom: 14 }}>
            <div style={{ color: "#E8816A", fontSize: 11 }}>今天可以怎么做</div>
            <h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 18, lineHeight: 1.6 }}>{copy.action}</h2>
            <button type="button" onClick={() => setDate(new Date())} style={{ minHeight: 44, display: "flex", alignItems: "center", gap: 8, border: 0, background: "transparent", color: "#9A7BB8", padding: 0 }}><RotateCcw size={16} />回到今天</button>
          </Card>
          {copy.sections.map((section) => <Card key={section.id} style={{ padding: 18, marginBottom: 12 }}><strong style={{ fontFamily: "'Noto Serif SC', serif" }}>{section.title}</strong><p style={{ color: "#6D6880", lineHeight: 1.8, fontSize: 13 }}>{section.body}</p></Card>)}
        </>}

        {tab === 1 && <div style={{ display: "grid", gap: 10 }}>
          {planets.map((planet) => <button type="button" key={planet.key} onClick={() => setSelected(planet.key)} style={{ minHeight: 72, display: "grid", gridTemplateColumns: "42px 1fr auto", alignItems: "center", gap: 10, padding: 12, borderRadius: 18, border: selected === planet.key ? "1px solid rgba(154,123,184,.5)" : "1px solid rgba(255,255,255,.9)", background: "rgba(255,255,255,.72)", textAlign: "left", color: "#39354C" }}><span style={{ width: 38, height: 38, display: "grid", placeItems: "center", borderRadius: 19, background: `${planet.color}22`, color: planet.color, fontWeight: 700 }}>{planet.label}</span><span><strong>{planet.name}进入{planet.sign}</strong><small style={{ display: "block", color: "#8A8499", marginTop: 4 }}>本命{bodyLabels[planet.key]}在{signName(natal.chart.placements[planet.key].sign)}</small></span><small>{planet.degree}</small></button>)}
          <Card style={{ padding: 18 }}><div style={{ color: activePlanet.color, fontSize: 11 }}>正在看 · {activePlanet.name}</div><h2 style={{ fontFamily: "'Noto Serif SC', serif", fontSize: 19 }}>{activePlanet.name}进入{activePlanet.sign}</h2><p style={{ color: "#666078", lineHeight: 1.8 }}>你的本命{activePlanet.name}位于{signName(natalPlacement.sign)}。这两层信息需要结合真实经历观察，不能只凭一个星体位置判断具体事件。</p></Card>
        </div>}

        {tab === 2 && <div style={{ display: "grid", gap: 10 }}>
          {aspects.length ? aspects.map((aspect) => <Card key={`${aspect.point1}-${aspect.point2}-${aspect.type}`} style={{ padding: 16 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}><strong>{aspect.title}</strong><span style={{ color: "#9A7BB8", fontSize: 12 }}>{aspectNames[aspect.type] || aspect.type}</span></div><p style={{ marginBottom: 0, color: "#777087", fontSize: 13 }}>容许度 {aspect.orb}。相位表示两种倾向在同一时期如何配合或拉扯，需要结合当下情境理解。</p></Card>) : <Card style={{ padding: 24, textAlign: "center" }}>这一天没有需要特别展开的主要相位。</Card>}
        </div>}

        {tab === 3 && <>
          <Card style={{ padding: 18, marginBottom: 12 }}><strong>这份内容用了什么</strong><p style={{ color: "#6D6880", lineHeight: 1.8 }}>使用 {formatDay(date)} 的真实星体位置，并与{profile.name}的本命星体位置对照。出生时辰或地点不足时，不会猜测上升与宫位。</p></Card>
          <Card style={{ padding: 18 }}><strong>资料边界</strong><p style={{ color: "#6D6880", lineHeight: 1.8 }}>行运是观察时间节奏的一种方式，不是对具体事件的保证，也不替代医疗、法律、财务或关系中的现实判断。</p></Card>
        </>}
      </div>
    </main>
  );
}
