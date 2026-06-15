import { elementLabels } from "./bazi";
import { buildBirthReport } from "./report";
import type { BirthProfile, ElementKey } from "./types";

export type ShareCardType = "cover" | "wuxing";

const elementColors: Record<ElementKey, string> = {
  wood: "#2d6b4f",
  fire: "#a5533c",
  earth: "#8a6f3c",
  metal: "#667178",
  water: "#2d6b6f",
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function lines(text: string, maxLength: number, maxLines = 3) {
  const result: string[] = [];
  let current = "";
  for (const char of text) {
    if ((current + char).length > maxLength) {
      result.push(current);
      current = char;
    } else {
      current += char;
    }
    if (result.length >= maxLines) {
      break;
    }
  }
  if (current && result.length < maxLines) {
    result.push(current);
  }
  return result;
}

function textBlock(text: string, x: number, y: number, maxLength: number, maxLines: number, className: string, lineHeight = 34) {
  return lines(text, maxLength, maxLines)
    .map((line, index) => `<text x="${x}" y="${y + index * lineHeight}" class="${className}">${escapeXml(line)}</text>`)
    .join("");
}

function pillars(profile: BirthProfile) {
  return Object.entries(profile.chart.pillars)
    .map(([key, value], index) => {
      const names: Record<string, string> = { year: "年柱", month: "月柱", day: "日柱", time: "时柱" };
      const x = 84 + index * 138;
      return `
        <rect x="${x}" y="520" width="112" height="136" rx="16" fill="#fbfbf8" stroke="#d8d3c6"/>
        <text x="${x + 56}" y="558" class="caption" text-anchor="middle">${names[key]}</text>
        <text x="${x + 56}" y="608" class="pillar" text-anchor="middle">${escapeXml(value)}</text>
        <text x="${x + 56}" y="638" class="tiny" text-anchor="middle">${escapeXml(profile.chart.nayin[key as keyof typeof profile.chart.nayin])}</text>
      `;
    })
    .join("");
}

function coverCard(profile: BirthProfile) {
  const report = buildBirthReport(profile);
  const strongest = profile.chart.wuxing.strongest.map((item) => elementLabels[item]).join("、");
  const weakest = profile.chart.wuxing.weakest.map((item) => elementLabels[item]).join("、");

  return `
    <rect width="720" height="960" fill="#f6f7f2"/>
    <rect x="40" y="40" width="640" height="880" rx="28" fill="#ffffff" stroke="#d8d3c6"/>
    <rect x="40" y="40" width="640" height="260" rx="28" fill="#233338"/>
    <text x="82" y="112" class="eyebrow">八字方向助手 · 报告封面</text>
    <text x="82" y="172" class="title">${escapeXml(profile.name)}</text>
    <text x="82" y="222" class="subtitle">${escapeXml(profile.chart.solarText)} · ${escapeXml(profile.birthPlace)}</text>
    ${textBlock(report.summary, 82, 358, 24, 3, "body")}
    <text x="82" y="470" class="section">四柱命盘</text>
    ${pillars(profile)}
    <text x="82" y="724" class="section">能量提示</text>
    <rect x="82" y="752" width="556" height="96" rx="16" fill="#fbfbf8" stroke="#e4ded2"/>
    <text x="112" y="790" class="body">偏明显：${escapeXml(strongest || "不明显")}</text>
    <text x="112" y="828" class="body">待补足：${escapeXml(weakest || "不明显")}</text>
    <text x="82" y="884" class="tiny">文化娱乐与自我探索参考，不替代专业建议</text>
  `;
}

function wuxingCard(profile: BirthProfile) {
  const entries = Object.entries(profile.chart.wuxing.balance) as Array<[ElementKey, number]>;
  const max = Math.max(...entries.map(([, value]) => value), 1);
  const bars = entries
    .map(([key, value], index) => {
      const y = 292 + index * 92;
      const width = Math.max(28, (value / max) * 420);
      return `
        <text x="92" y="${y + 14}" class="section">${elementLabels[key]}</text>
        <rect x="150" y="${y - 10}" width="430" height="26" rx="13" fill="#eef1ec"/>
        <rect x="150" y="${y - 10}" width="${width}" height="26" rx="13" fill="${elementColors[key]}"/>
        <text x="608" y="${y + 14}" class="body" text-anchor="end">${value}</text>
      `;
    })
    .join("");

  return `
    <rect width="720" height="960" fill="#f6f7f2"/>
    <rect x="40" y="40" width="640" height="880" rx="28" fill="#ffffff" stroke="#d8d3c6"/>
    <text x="82" y="116" class="eyebrowDark">五行能量图</text>
    <text x="82" y="178" class="titleDark">${escapeXml(profile.name)}</text>
    <text x="82" y="224" class="subtitleDark">日主 ${escapeXml(profile.chart.dayMaster.stem)}${escapeXml(profile.chart.dayMaster.elementLabel)} · ${escapeXml(profile.chart.pillars.day)}日</text>
    <rect x="82" y="258" width="556" height="500" rx="20" fill="#fbfbf8" stroke="#e4ded2"/>
    ${bars}
    <text x="82" y="820" class="body">${escapeXml(`适合围绕${profile.chart.dayMaster.elementLabel}的节奏，先把现实中的下一步做清楚。`)}</text>
    <text x="82" y="884" class="tiny">八字方向助手 · 免费文化参考</text>
  `;
}

export function buildShareCardSvg(profile: BirthProfile, type: ShareCardType) {
  const body = type === "wuxing" ? wuxingCard(profile) : coverCard(profile);
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="720" height="960" viewBox="0 0 720 960">
  <style>
    .eyebrow { fill: #d5b8a8; font: 500 22px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .eyebrowDark { fill: #a5533c; font: 500 22px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .title { fill: #ffffff; font: 700 52px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .titleDark { fill: #23231f; font: 700 52px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .subtitle { fill: #eef3ef; font: 400 24px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .subtitleDark { fill: #68645d; font: 400 24px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .section { fill: #23231f; font: 700 24px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .body { fill: #4f4a43; font: 400 24px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .caption { fill: #756f67; font: 400 18px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .pillar { fill: #23231f; font: 700 34px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
    .tiny { fill: #756f67; font: 400 18px "Microsoft YaHei", "PingFang SC", Arial, sans-serif; }
  </style>
  ${body}
</svg>`;
}
