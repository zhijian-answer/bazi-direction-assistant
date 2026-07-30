"use client";

import { useMemo } from "react";
import type { ZodiacBodyKey, ZodiacChart, ZodiacSignKey } from "@/lib/zodiac/types";
import { bodyLabels } from "@/lib/zodiac/contentCatalog";

const signs: ZodiacSignKey[] = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];
const signSymbols: Record<ZodiacSignKey, string> = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋", leo: "♌", virgo: "♍",
  libra: "♎", scorpio: "♏", sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};
const bodySymbols: Record<ZodiacBodyKey, string> = {
  sun: "☉", moon: "☽", mercury: "☿", venus: "♀", mars: "♂",
  jupiter: "♃", saturn: "♄", uranus: "♅", neptune: "♆", pluto: "♇",
};
const aspectColors: Record<string, string> = {
  trine: "#7ead98",
  sextile: "#8db8d8",
  conjunction: "#d8aa5d",
  square: "#c45b4c",
  opposition: "#c45b4c",
};

function polar(degree: number, radius: number) {
  const radians = (degree - 90) * Math.PI / 180;
  return {
    x: Number((180 + Math.cos(radians) * radius).toFixed(3)),
    y: Number((180 + Math.sin(radians) * radius).toFixed(3)),
  };
}

function pointDegree(chart: ZodiacChart, key: string) {
  if (key === "ascendant") return chart.ascendant?.degree;
  if (key === "midheaven") return chart.midheaven?.degree;
  return chart.placements[key as ZodiacBodyKey]?.degree;
}

export function AstrologyWheel({ chart, selectedBody, onSelect, mode = "natal" }: { chart: ZodiacChart; selectedBody?: ZodiacBodyKey; onSelect?: (body: ZodiacBodyKey) => void; mode?: "natal" | "sky" }) {
  const hasHouses = chart.houses.length > 0;
  const visibleAspects = useMemo(
    () => chart.aspects.filter((aspect) => !selectedBody || aspect.point1 === selectedBody || aspect.point2 === selectedBody).slice(0, selectedBody ? 16 : 24),
    [chart.aspects, selectedBody],
  );
  return (
    <div className="astrology-wheel-wrap">
      <svg className="astrology-wheel" viewBox="0 0 360 360" role="img" aria-label={mode === "natal" ? hasHouses ? "本命星盘：十二星座、十二宫、行星位置和主要相位" : "部分本命星盘：十二星座、行星位置和主要相位；宫位待补充" : "今日天象：十二星座、行星位置和主要相位"}>
        <circle cx="180" cy="180" r="169" className="astrology-wheel__rim" />
        <circle cx="180" cy="180" r="145" className="astrology-wheel__ring" />
        <circle cx="180" cy="180" r="115" className="astrology-wheel__ring astrology-wheel__ring--inner" />
        {signs.map((sign, index) => {
          const line = polar(index * 30, 169);
          const inner = polar(index * 30, 145);
          const label = polar(index * 30 + 15, 157);
          return <g key={sign}>
            <line x1={inner.x} y1={inner.y} x2={line.x} y2={line.y} className="astrology-wheel__zodiac-line" />
            <text x={label.x} y={label.y} className="astrology-wheel__sign">{signSymbols[sign]}</text>
          </g>;
        })}
        {chart.houses.map((house) => {
          const point = polar(house.cusp, 145);
          const number = polar(house.cusp + 8, 127);
          return <g key={house.id}>
            <line x1="180" y1="180" x2={point.x} y2={point.y} className={house.id === 1 || house.id === 10 ? "astrology-wheel__house-line is-axis" : "astrology-wheel__house-line"} />
            <text x={number.x} y={number.y} className="astrology-wheel__house-number">{house.id}</text>
          </g>;
        })}
        {visibleAspects.map((aspect, index) => {
          const leftDegree = pointDegree(chart, aspect.point1);
          const rightDegree = pointDegree(chart, aspect.point2);
          if (leftDegree === undefined || rightDegree === undefined) return null;
          const left = polar(leftDegree, 96);
          const right = polar(rightDegree, 96);
          return <line key={`${aspect.point1}-${aspect.point2}-${aspect.type}-${index}`} x1={left.x} y1={left.y} x2={right.x} y2={right.y} className="astrology-wheel__aspect" style={{ stroke: aspectColors[aspect.type] || "#8f877a" }} />;
        })}
        {(Object.keys(chart.placements) as ZodiacBodyKey[]).map((body, index) => {
          const placement = chart.placements[body];
          const radius = 105 - (index % 2) * 10;
          const point = polar(placement.degree, radius);
          const selected = selectedBody === body;
          return <g key={body} role="button" tabIndex={0} aria-label={`选择${bodyLabels[body]}`} onClick={() => onSelect?.(body)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") onSelect?.(body); }} className={selected ? "astrology-wheel__planet is-selected" : "astrology-wheel__planet"}>
            <circle cx={point.x} cy={point.y} r={selected ? 12 : 10} />
            <text x={point.x} y={point.y}>{bodySymbols[body]}</text>
          </g>;
        })}
        <circle cx="180" cy="180" r="26" className="astrology-wheel__core" />
        <text x="180" y="176" className="astrology-wheel__brand">玄枢</text>
        <text x="180" y="190" className="astrology-wheel__caption">{mode === "natal" ? "NATAL STRUCTURE" : "CURRENT SKY"}</text>
      </svg>
    </div>
  );
}
