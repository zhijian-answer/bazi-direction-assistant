"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ElementDatum } from "@/lib/mobile/types";

const tooltipStyle = {
  border: "1px solid rgba(88, 71, 53, 0.12)",
  borderRadius: 8,
  background: "rgba(255, 253, 249, 0.96)",
  color: "#4f4136",
  fontSize: 12,
};

export function FiveElementsChart({ data }: { data: ElementDatum[] }) {
  return (
    <div className="mobile-chart mobile-chart--five" aria-label="五行力量流向图">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
          <XAxis type="number" hide domain={[0, 32]} />
          <YAxis type="category" dataKey="label" width={28} axisLine={false} tickLine={false} tick={{ fill: "#745c49", fontSize: 12 }} />
          <Bar dataKey="value" radius={[8, 8, 8, 8]} isAnimationActive animationDuration={900}>
            {data.map((item) => <Cell key={item.key} fill={item.color} />)}
          </Bar>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${String(value)}%`, "占比"]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function FiveElementsCoverChart({ data }: { data: ElementDatum[] }) {
  return (
    <div className="cover-elements-chart" aria-label="封面五行环形图">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            innerRadius="64%"
            outerRadius="88%"
            paddingAngle={3}
            cornerRadius={7}
            stroke="none"
            isAnimationActive
            animationDuration={1100}
          >
            {data.map((item) => <Cell key={item.key} fill={item.color} />)}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [`${String(value)}%`, "结构占比"]} />
        </PieChart>
      </ResponsiveContainer>
      <div className="cover-elements-center"><small>日主</small><strong>庚</strong><span>阳金</span></div>
    </div>
  );
}

export function TenGodChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <div className="mobile-chart mobile-chart--bars" aria-label="处理人和事的习惯构成图">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 2, right: 16, bottom: 2, left: 2 }}>
          <CartesianGrid horizontal={false} stroke="rgba(120, 89, 61, 0.1)" />
          <XAxis type="number" hide domain={[0, 30]} />
          <YAxis type="category" dataKey="name" width={44} axisLine={false} tickLine={false} tick={{ fill: "#6d5a4d", fontSize: 12 }} />
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
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
          <CartesianGrid vertical={false} stroke="rgba(120, 89, 61, 0.1)" />
          <XAxis dataKey="age" axisLine={false} tickLine={false} tick={{ fill: "#846f5c", fontSize: 10 }} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip contentStyle={tooltipStyle} formatter={(value) => [String(value), "节奏指数"]} />
          <Area type="monotone" dataKey="value" stroke="#a96352" fill="#d9aa92" fillOpacity={0.32} strokeWidth={2} isAnimationActive animationDuration={950} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ZodiacPeakChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  return (
    <div className="mobile-chart mobile-chart--zodiac" aria-label="星座特质亮点图">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id="zodiacEnergy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#7d8fd1" stopOpacity={0.64} />
              <stop offset="54%" stopColor="#c693c4" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#eaf0ff" stopOpacity={0.08} />
            </linearGradient>
          </defs>
          <XAxis dataKey="name" padding={{ left: 18, right: 18 }} axisLine={false} tickLine={false} tick={{ fill: "#66749a", fontSize: 10 }} />
          <YAxis hide domain={[0, 100]} />
          <Tooltip contentStyle={{ ...tooltipStyle, color: "#425176" }} formatter={(value) => [String(value), "特质强度"]} />
          <Area type="monotone" dataKey="value" stroke="#7b8fd0" strokeWidth={11} strokeOpacity={0.13} fill="none" dot={false} isAnimationActive={false} />
          <Area type="monotone" dataKey="value" stroke="#6479bd" strokeWidth={3} fill="url(#zodiacEnergy)" dot={{ r: 5, fill: "#ffffff", stroke: "#6479bd", strokeWidth: 3 }} activeDot={{ r: 7 }} isAnimationActive animationDuration={1100}>
            <LabelList dataKey="value" position="top" fill="#6073aa" fontSize={9} />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
