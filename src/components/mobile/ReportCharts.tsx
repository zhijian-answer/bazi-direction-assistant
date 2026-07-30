"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ElementDatum } from "@/lib/mobile/types";

const tooltipStyle = {
  border: "1px solid rgba(216, 170, 93, 0.32)",
  borderRadius: 8,
  background: "rgba(5, 12, 13, 0.96)",
  color: "#e9d9b7",
  fontSize: 12,
};

export function FiveElementsChart({ data }: { data: ElementDatum[] }) {
  return (
    <div className="mobile-chart mobile-chart--five" aria-label="五行力量流向图">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <XAxis type="number" hide domain={[0, 32]} />
          <YAxis type="category" dataKey="label" width={28} axisLine={false} tickLine={false} tick={{ fill: "#c8b58f", fontSize: 12 }} />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} isAnimationActive animationDuration={900}>
            {data.map((item) => <Cell key={item.key} fill={item.color} />)}
          </Bar>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${String(value)}%`, "占比"]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FiveElementsCoverChart({ data, dayMaster }: { data: ElementDatum[]; dayMaster: { stem: string; elementLabel: string } }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const segments = data.map((item, index) => {
    const consumed = data.slice(0, index).reduce((sum, entry) => sum + (entry.value / 100) * circumference, 0);
    const length = Math.max(0, (item.value / 100) * circumference - 4.5);
    return { ...item, length, dashOffset: -consumed };
  });

  return (
    <div className="cover-elements-chart" aria-label="封面五行环形图">
      <svg className="cover-elements-orbit" viewBox="0 0 120 120" role="img" aria-hidden="true">
        <circle className="cover-elements-orbit__rail" cx="60" cy="60" r="50" />
        <circle className="cover-elements-orbit__rail cover-elements-orbit__rail--inner" cx="60" cy="60" r="36" />
        {segments.map((item) => <circle key={item.key} className="cover-elements-orbit__segment" cx="60" cy="60" r={radius} pathLength={circumference} stroke={item.color} strokeDasharray={`${item.length} ${circumference - item.length}`} strokeDashoffset={item.dashOffset} />)}
        <path className="cover-elements-orbit__axis" d="M60 6V18M60 102v12M6 60h12M102 60h12" />
      </svg>
      <div className="cover-elements-center"><small>日主</small><strong>{dayMaster.stem}</strong><span>{"甲丙戊庚壬".includes(dayMaster.stem) ? "阳" : "阴"}{dayMaster.elementLabel}</span></div>
    </div>
  );
}

export function TenGodChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <div className="mobile-chart mobile-chart--bars" aria-label="处理人和事的习惯构成图">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <BarChart data={data} layout="vertical" margin={{ top: 2, right: 16, bottom: 2, left: 2 }}>
          <CartesianGrid horizontal={false} stroke="rgba(216, 170, 93, 0.12)" />
          <XAxis type="number" hide domain={[0, 30]} />
          <YAxis type="category" dataKey="name" width={44} axisLine={false} tickLine={false} tick={{ fill: "#c8b58f", fontSize: 12 }} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${String(value)}%`, "占比"]} />
          <Bar dataKey="value" radius={[0, 5, 5, 0]} isAnimationActive animationDuration={850}>
            {data.map((item) => <Cell key={item.name} fill={item.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function LuckTrendChart({ data }: { data: Array<{ age: string; value: number; keyword: string }> }) {
  return (
    <div className="mobile-chart mobile-chart--trend" aria-label="大运趋势图">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} stroke="rgba(216, 170, 93, 0.12)" />
          <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fill: "#b8a789", fontSize: 10 }} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [String(value), "节奏指数"]} />
          <Area type="monotone" dataKey="value" stroke="#c55b47" fill="#b98a4d" fillOpacity={0.2} strokeWidth={2} isAnimationActive animationDuration={950} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ZodiacPeakChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <div className="mobile-chart mobile-chart--zodiac" aria-label="星座特质亮点图">
      <ResponsiveContainer width="100%" height="100%" minWidth={1} minHeight={1}>
        <RadarChart data={data} outerRadius="72%" margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
          <PolarGrid gridType="polygon" stroke="rgba(218, 178, 106, 0.36)" radialLines />
          <PolarAngleAxis dataKey="name" tick={{ fill: "#c7b58f", fontSize: 8 }} tickLine={false} />
          <Radar dataKey="value" stroke="#74a9d2" strokeWidth={2} fill="#4c8fbd" fillOpacity={0.34} isAnimationActive={false} />
          <Tooltip contentStyle={{ ...tooltipStyle, color: "#d8c7a8" }} formatter={(value) => [`${String(value)}%`, "特质强度"]} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
