import React, { useState } from "react";
import type { Question } from "./QuestionInsightSheet";

// ─── Dual-orbit relationship instrument ──────────────────────────────────────
function DualOrbitInstrument() {
  const W = 354, H = 180;
  const Ax = 82,  Ay = 90;   // 晓媛 center
  const Bx = 272, By = 90;   // 子轩 center
  const Mx = 177, My = 90;   // midpoint

  // Outer shared orbit as a path (ellipse: cx=177, cy=90, rx=132, ry=58)
  const orbitPath = `M 309 90 A 132 58 0 1 0 45 90 A 132 58 0 1 0 309 90`;

  return (
    <div style={{ position: "relative", display: "flex", justifyContent: "center" }}>
      {/* Ambient glow */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%,-50%)",
        width: 320, height: 160,
        background: "radial-gradient(ellipse, rgba(107,191,160,0.12) 0%, rgba(232,129,106,0.10) 50%, transparent 75%)",
        pointerEvents: "none",
      }} />

      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
        <defs>
          {/* Outer orbit path for animateMotion */}
          <path id="comp-orbit" d={orbitPath} />

          <radialGradient id="grad-a" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#D0EAE0" />
            <stop offset="100%" stopColor="#A8D8C4" />
          </radialGradient>
          <radialGradient id="grad-b" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F5C4B8" />
            <stop offset="100%" stopColor="#EDAA96" />
          </radialGradient>
          <radialGradient id="grad-mid" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFF7E6" />
            <stop offset="100%" stopColor="#F6EACC" />
          </radialGradient>
          <filter id="comp-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* ── Outer shared orbit ring ── */}
        <ellipse cx={Mx} cy={My} rx={132} ry={58}
          fill="none" stroke="rgba(180,160,220,0.20)" strokeWidth={1} />
        {/* Tick marks on outer orbit */}
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const rx = 132, ry = 58;
          const x1 = Mx + rx * Math.cos(a);
          const y1 = My + ry * Math.sin(a);
          const x2 = Mx + (rx - 6) * Math.cos(a);
          const y2 = My + (ry - 3) * Math.sin(a);
          return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
            stroke={i % 3 === 0 ? "rgba(180,160,220,0.40)" : "rgba(180,160,220,0.18)"}
            strokeWidth={i % 3 === 0 ? 1.2 : 0.7} />;
        })}

        {/* ── A's inner ring ── */}
        <circle cx={Ax} cy={Ay} r={50}
          fill="none" stroke="rgba(107,191,160,0.22)" strokeWidth={1}
          strokeDasharray="3 5" />

        {/* ── B's inner ring ── */}
        <circle cx={Bx} cy={By} r={50}
          fill="none" stroke="rgba(232,129,106,0.22)" strokeWidth={1}
          strokeDasharray="3 5" />

        {/* ── Connection arcs between the two (overlapping region feel) ── */}
        <path d={`M ${Ax+50} ${Ay} Q ${Mx} ${My-38} ${Bx-50} ${By}`}
          fill="none" stroke="rgba(192,172,222,0.22)" strokeWidth={1.2} />
        <path d={`M ${Ax+50} ${Ay} Q ${Mx} ${My+38} ${Bx-50} ${By}`}
          fill="none" stroke="rgba(192,172,222,0.14)" strokeWidth={0.8} />

        {/* ── A avatar: 晓媛 ── */}
        <circle cx={Ax} cy={Ay} r={34}
          fill="url(#grad-a)" stroke="rgba(107,191,160,0.60)" strokeWidth={1.8}
          filter="url(#comp-glow)" />
        <text x={Ax} y={Ay - 7} textAnchor="middle" dominantBaseline="middle"
          fontSize={18} fontFamily="'Noto Serif SC', serif" fontWeight="700"
          fill="#2D7A5C">木</text>
        <text x={Ax} y={Ay + 11} textAnchor="middle"
          fontSize={10} fontFamily="'Noto Sans SC', sans-serif"
          fill="#3A7A62">晓媛</text>

        {/* ── B avatar: 子轩 ── */}
        <circle cx={Bx} cy={By} r={34}
          fill="url(#grad-b)" stroke="rgba(232,129,106,0.60)" strokeWidth={1.8}
          filter="url(#comp-glow)" />
        <text x={Bx} y={By - 7} textAnchor="middle" dominantBaseline="middle"
          fontSize={18} fontFamily="'Noto Serif SC', serif" fontWeight="700"
          fill="#A04A36">火</text>
        <text x={Bx} y={By + 11} textAnchor="middle"
          fontSize={10} fontFamily="'Noto Sans SC', sans-serif"
          fill="#A04A36">子轩</text>

        {/* ── Central "合" symbol ── */}
        <circle cx={Mx} cy={My} r={20}
          fill="url(#grad-mid)" stroke="rgba(233,201,126,0.65)" strokeWidth={1.8} />
        <text x={Mx} y={My + 0.5} textAnchor="middle" dominantBaseline="middle"
          fontSize={14} fontFamily="'Noto Serif SC', serif" fontWeight="500"
          fill="#8A6820">合</text>

        {/* ── Animated orbital dots ── */}
        {/* Mint dot — clockwise */}
        <circle r={5} fill="#6BBFA0" opacity="0.90" filter="url(#comp-glow)">
          <animateMotion dur="14s" repeatCount="indefinite">
            <mpath href="#comp-orbit" />
          </animateMotion>
        </circle>

        {/* Coral dot — starts at halfway mark, slower */}
        <circle r={4.5} fill="#E8816A" opacity="0.85" filter="url(#comp-glow)">
          <animateMotion dur="19s" repeatCount="indefinite"
            keyPoints="0.5;1;0;0.5" keyTimes="0;0.33;0.66;1" calcMode="linear">
            <mpath href="#comp-orbit" />
          </animateMotion>
        </circle>

        {/* Gold accent dot — very slow */}
        <circle r={3} fill="#E9C97E" opacity="0.70">
          <animateMotion dur="28s" repeatCount="indefinite"
            keyPoints="0.25;1;0;0.25" keyTimes="0;0.25;0.75;1" calcMode="linear">
            <mpath href="#comp-orbit" />
          </animateMotion>
        </circle>
      </svg>
    </div>
  );
}

// ─── Dimension card ───────────────────────────────────────────────────────────
function DimensionCard({ name, value, color, bg, border, desc }: {
  name: string; value: number; color: string; bg: string; border: string; desc: string;
}) {
  return (
    <div style={{
      flex: 1, minWidth: 0,
      padding: "14px 14px 14px",
      borderRadius: 18,
      background: bg,
      border: `1px solid ${border}`,
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 13, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D" }}>
          {name}
        </span>
        <span style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color }}>
          {value}
        </span>
      </div>
      {/* Score bar */}
      <div style={{ height: 4, borderRadius: 2, background: "rgba(180,160,220,0.18)", marginBottom: 10, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2, width: `${value}%`,
          background: `linear-gradient(90deg, ${color}CC, ${color}77)`,
        }} />
      </div>
      <p style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.60, margin: 0 }}>
        {desc}
      </p>
    </div>
  );
}

// ─── Needs comparison ─────────────────────────────────────────────────────────
function NeedsSection() {
  const a = ["不被催促的空间", "确定感带来的安全", "深度而非广度的连接"];
  const b = ["被直接回应的感觉", "知道关系是稳固的", "共同行动中的靠近"];
  return (
    <div style={{ display: "flex", gap: 11 }}>
      {[
        { name: "晓媛 需要", items: a, color: "#6BBFA0", bg: "rgba(107,191,160,0.08)", border: "rgba(107,191,160,0.28)" },
        { name: "子轩 需要", items: b, color: "#E8816A", bg: "rgba(232,129,106,0.08)", border: "rgba(232,129,106,0.25)" },
      ].map(col => (
        <div key={col.name} style={{
          flex: 1, borderRadius: 18, overflow: "hidden",
          border: `1px solid ${col.border}`,
          background: col.bg,
        }}>
          <div style={{
            padding: "9px 14px 8px",
            background: `${col.color}12`,
            fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 500, color: col.color, letterSpacing: "0.03em",
          }}>{col.name}</div>
          <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
            {col.items.map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                <div style={{
                  width: 5, height: 5, borderRadius: "50%",
                  background: col.color, marginTop: 5.5, flexShrink: 0,
                }} />
                <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.55 }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Save card button ─────────────────────────────────────────────────────────
function SaveCardButton() {
  const [saved, setSaved] = useState(false);
  return (
    <button
      onClick={() => setSaved(s => !s)}
      style={{
        width: "100%", padding: "15px 20px",
        borderRadius: 18,
        border: saved ? "1.5px solid rgba(107,191,160,0.55)" : "1.5px solid rgba(233,201,126,0.50)",
        background: saved
          ? "linear-gradient(135deg, rgba(107,191,160,0.14), rgba(255,255,255,0.80))"
          : "linear-gradient(135deg, rgba(233,201,126,0.18), rgba(255,255,255,0.82))",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        boxShadow: "0 4px 18px rgba(160,130,200,0.10)",
        transition: "all 0.25s ease",
      }}>
      <div style={{
        width: 32, height: 32, borderRadius: 10,
        background: saved
          ? "linear-gradient(135deg, #6BBFA0, #4EA888)"
          : "linear-gradient(135deg, #E9C97E, #D4A054)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
        flexShrink: 0,
      }}>
        {saved ? "✓" : "⊙"}
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{ fontSize: 14, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D" }}>
          {saved ? "已保存到关系卡" : "保存这张关系卡"}
        </div>
        <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginTop: 2 }}>
          {saved ? "可在「我的」中随时查看" : "随时回来看看，记录你们的变化"}
        </div>
      </div>
    </button>
  );
}

// ─── Compatibility sheet questions ───────────────────────────────────────────
const COMP_SHEET_QUESTIONS: Question[] = [
  {
    id: "comp-1",
    source: "来自关系合盘 · 仅供自我观察",
    title: "你们上一次真正地聊，是为了解决问题，还是为了让对方感受到你？",
    answer: "两件事都重要，但很多人分不清自己当时在做哪一件。「解决问题」需要逻辑和方案；「让对方感受到你」需要的是在场和真实。两件事混在一起，往往两件都做得不够。",
    observations: [
      "留意你们聊一件具体的事时，谁更早把话题导向「那怎么办」——那个人通常更倾向问题解决模式",
      "观察在哪些对话里你会感觉「被听见了」，以及那种感觉是怎么来的",
      "注意对话结束之后的感受——是轻了，还是还有一些什么没说完",
    ],
    action: "下一次和对方聊之前，先问自己一句：「我现在想要的是什么——被理解，还是找到方案？」然后把这句话说出来。",
    boundary: "以上内容来自合盘结构的参考解读，用于辅助自我观察，不代表对这段关系的任何判断或预测。",
  },
  {
    id: "comp-2",
    source: "来自关系合盘 · 仅供自我观察",
    title: "当你需要一点空间的时候，你通常会直接说出来吗？",
    answer: "大多数人不会。不说的理由通常是「说了对方会不开心」或「我自己也说不清楚需要多少空间」。但不说出来的代价，往往是对方只看到你「变冷了」，而不知道为什么。",
    observations: [
      "留意你在需要空间时会用什么方式表达——变得更安静、更忙，还是直接消失一段时间",
      "观察对方是否能感知到你的变化，以及他的反应是什么",
      "注意你「回来」之后，是不是从没有聊过你去了哪里、你需要什么",
    ],
    action: "下次感觉需要独处的时候，试着说一句：「我需要一些时间自己待着，不是因为你，是我需要充个电。」",
    boundary: "以上内容来自合盘结构的参考解读，用于辅助自我观察，不代表对这段关系的任何判断或预测。",
  },
  {
    id: "comp-3",
    source: "来自关系合盘 · 仅供自我观察",
    title: "你们之间有什么事情，一直都没有说清楚？",
    answer: "大多数关系里都有这样的事。它通常不是一个很大的矛盾，而是一种悬着的感觉——双方都知道，但都在等一个「更合适的时机」。那个时机，往往需要一方主动创造。",
    observations: [
      "留意你想到那件事时，内心的第一个感觉是什么——是烦、是担心，还是一种说不清楚的沉",
      "观察你们上次接近谈到那件事时，是什么让对话转向了别处",
      "注意你现在回避那件事的理由，和三个月前的理由，是否一样",
    ],
    action: "不需要现在就谈。但今天可以先问自己：「如果我们把这件事说清楚了，我最担心的是什么？」把那个答案写下来。",
    boundary: "以上内容来自合盘结构的参考解读，用于辅助自我观察，不代表对这段关系的任何判断或预测。",
  },
];

// ─── CompatibilityScreen ──────────────────────────────────────────────────────
export default function CompatibilityScreen({
  onBack,
  onOpenSheet,
  onSharePoster,
}: {
  onBack: () => void;
  onOpenSheet: (questions: Question[], index: number) => void;
  onSharePoster?: () => void;
}) {
  const dimensions = [
    {
      name: "吸引力",     value: 88,
      color: "#E8816A",  bg: "rgba(232,129,106,0.07)", border: "rgba(232,129,106,0.22)",
      desc: "你们之间有一种不需要解释的磁场，初见时就已经感觉到了。",
    },
    {
      name: "情绪回应",   value: 72,
      color: "#C0ACDE",  bg: "rgba(192,172,222,0.09)", border: "rgba(192,172,222,0.28)",
      desc: "情绪风格有所不同，但都在努力感受和理解对方。",
    },
    {
      name: "沟通方式",   value: 65,
      color: "#7BBDE0",  bg: "rgba(123,189,224,0.08)", border: "rgba(123,189,224,0.25)",
      desc: "一个偏内省，一个偏直接。拉开距离时容易各自消化，而不是说出来。",
    },
    {
      name: "生活节奏",   value: 58,
      color: "#6BBFA0",  bg: "rgba(107,191,160,0.08)", border: "rgba(107,191,160,0.25)",
      desc: "对节奏和空间的需求有差异，需要主动聊清楚，而不是等对方去适应。",
    },
  ];

  const questions = [
    { q: "你们上一次真正地聊，是为了解决问题，还是为了让对方感受到你？", accent: "#6BBFA0" },
    { q: "当你需要一点空间的时候，你通常会直接说出来吗？",               accent: "#7BBDE0" },
    { q: "你们之间有什么事情，一直都没有说清楚？",                        accent: "#C0ACDE" },
  ];

  return (
    <>
      {/* Page background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 44%, #FDF4F1 100%)",
        zIndex: 0,
      }} />

      {/* Scrollable content */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 86,
        overflowY: "auto", overflowX: "hidden", zIndex: 1, scrollbarWidth: "none",
      }}>
        <div style={{ height: 52 }} />

        {/* ── Header ── */}
        <div style={{ padding: "0 20px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            {/* Back */}
            <button onClick={onBack} style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.70)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.90)",
              boxShadow: "0 2px 8px rgba(160,130,200,0.12)",
              cursor: "pointer", fontSize: 16, color: "#6B607E",
              display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
            }}>←</button>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", lineHeight: 1 }}>
                两人合盘
              </div>
              <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginTop: 3 }}>
                晓媛 × 子轩 · 互补型关系
              </div>
            </div>

            {/* Relationship score badge */}
            <div style={{
              padding: "5px 13px 5px 10px", borderRadius: 20,
              background: "rgba(233,201,126,0.16)", border: "1px solid rgba(233,201,126,0.45)",
              display: "flex", alignItems: "center", gap: 6,
            }}>
              <div style={{
                width: 20, height: 20, borderRadius: 6,
                background: "linear-gradient(135deg, #E9C97E, #D4A054)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#fff", fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
              }}>合</div>
              <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#8A6820" }}>
                78
              </span>
            </div>
          </div>

          {/* ── Profile chips row ── */}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {[
              { name: "晓媛", element: "木", color: "#6BBFA0", sub: "癸水日主" },
              { name: "子轩", element: "火", color: "#E8816A", sub: "丙火日主" },
            ].map((p, i) => (
              <React.Fragment key={p.name}>
                <div style={{
                  flex: 1, display: "flex", alignItems: "center", gap: 9,
                  padding: "8px 14px 8px 8px", borderRadius: 20,
                  background: `${p.color}10`, border: `1px solid ${p.color}35`,
                }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: "50%",
                    background: `linear-gradient(135deg, ${p.color}CC, ${p.color}66)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, color: "#fff", fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                    flexShrink: 0,
                  }}>{p.element}</div>
                  <div>
                    <div style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#28253D" }}>{p.name}</div>
                    <div style={{ fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8" }}>{p.sub}</div>
                  </div>
                </div>
                {i === 0 && (
                  <div style={{ fontSize: 15, color: "#C0ACDE", fontFamily: "'Noto Serif SC', serif", flexShrink: 0 }}>×</div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 1. Dual-orbit instrument */}
          <div style={{
            borderRadius: 26,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.90)",
            boxShadow: "0 6px 28px rgba(160,130,200,0.13)",
            padding: "20px 0 16px",
            overflow: "hidden",
          }}>
            <DualOrbitInstrument />

            {/* Relationship summary below the instrument */}
            <div style={{ padding: "16px 22px 4px" }}>
              <div style={{
                fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                color: "#28253D", lineHeight: 1.50, marginBottom: 10,
              }}>
                不用解释太多就能懂彼此<br />但各自的节奏差异需要被看见
              </div>
              <div style={{
                fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#4A4168", lineHeight: 1.70,
              }}>
                你们之间有一种安静的默契，在压力小的时候几乎不需要协商。但当各自的节奏需求被激活，摩擦往往来得比预期快一些。这不是问题，而是这段关系正在变得更真实的信号。
              </div>
              {/* Supporting score line */}
              <div style={{
                marginTop: 14, paddingTop: 12,
                borderTop: "1px solid rgba(180,160,210,0.14)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{
                  padding: "3px 11px", borderRadius: 20,
                  background: "rgba(233,201,126,0.14)", border: "1px solid rgba(233,201,126,0.35)",
                  fontSize: 11, color: "#8A6820", fontFamily: "'Noto Sans SC', sans-serif",
                }}>关系指数 78</div>
                <span style={{ fontSize: 11.5, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif" }}>
                  互补型 · 高吸引 · 节奏差异明显
                </span>
              </div>
            </div>
          </div>

          {/* 2. Four dimensions — 2×2 grid */}
          <div>
            <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 10, paddingLeft: 2, letterSpacing: "0.04em" }}>
              四个维度
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", gap: 10 }}>
                <DimensionCard {...dimensions[0]} />
                <DimensionCard {...dimensions[1]} />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <DimensionCard {...dimensions[2]} />
                <DimensionCard {...dimensions[3]} />
              </div>
            </div>
          </div>

          {/* 3. 最珍贵的默契 */}
          <div style={{
            padding: "18px 20px",
            borderRadius: 20,
            background: "linear-gradient(140deg, rgba(107,191,160,0.12) 0%, rgba(255,255,255,0.80) 100%)",
            border: "1px solid rgba(107,191,160,0.32)",
            boxShadow: "0 4px 18px rgba(107,191,160,0.10)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: "linear-gradient(135deg, #D0EAE0, #6BBFA0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, boxShadow: "0 2px 8px rgba(107,191,160,0.25)",
              }}>◈</div>
              <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#3A7A62", letterSpacing: "0.05em" }}>
                最珍贵的默契
              </span>
            </div>
            <div style={{
              fontSize: 15.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
              color: "#28253D", lineHeight: 1.55, marginBottom: 10,
            }}>
              你们都能感受到对方什么时候不在状态
            </div>
            <p style={{
              fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#4A4168", lineHeight: 1.68, margin: 0,
            }}>
              不需要说出来，对方就已经知道了。这种安静里的理解，是这段关系里最值得珍惜的东西。不要把它当作理所当然。
            </p>
          </div>

          {/* 4. 最容易误解彼此的地方 */}
          <div style={{
            padding: "18px 20px",
            borderRadius: 20,
            background: "linear-gradient(140deg, rgba(192,172,222,0.12) 0%, rgba(255,255,255,0.80) 100%)",
            border: "1px solid rgba(192,172,222,0.30)",
            boxShadow: "0 4px 18px rgba(192,172,222,0.10)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 11 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: "linear-gradient(135deg, #E8E0F4, #C0ACDE)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, boxShadow: "0 2px 8px rgba(192,172,222,0.25)",
              }}>◎</div>
              <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#6B4EA8", letterSpacing: "0.05em" }}>
                最容易误解彼此的地方
              </span>
            </div>
            <div style={{
              fontSize: 15.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
              color: "#28253D", lineHeight: 1.55, marginBottom: 10,
            }}>
              沉默 vs. 直接——两种方式撞在一起
            </div>
            <p style={{
              fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#4A4168", lineHeight: 1.68, margin: 0,
            }}>
              晓媛的沉默有时是在消化和思考，子轩的直接有时是在表达关心。当两种方式相遇，很容易被解读为回避或强势。说清楚自己的节奏，比猜测对方的意图更有效。
            </p>
          </div>

          {/* 5. Needs comparison */}
          <div>
            <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 10, paddingLeft: 2, letterSpacing: "0.04em" }}>
              各自的需要
            </div>
            <NeedsSection />
          </div>

          {/* 6. 当前阶段 */}
          <div style={{
            padding: "16px 20px",
            borderRadius: 18,
            background: "rgba(255,255,255,0.68)",
            backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.88)",
            boxShadow: "0 4px 18px rgba(160,130,200,0.10)",
          }}>
            <div style={{ fontSize: 10.5, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 9, letterSpacing: "0.07em" }}>
              当前阶段
            </div>
            <div style={{
              fontSize: 15.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
              color: "#28253D", lineHeight: 1.50, marginBottom: 9,
            }}>
              从相互吸引走向相互了解
            </div>
            <p style={{
              fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#4A4168", lineHeight: 1.68, margin: 0,
            }}>
              这是最需要耐心的阶段，也是最值得投入的阶段。你们已经知道对方是谁，现在要学的是——在日常的摩擦里，怎么继续选择对方。
            </p>
          </div>

          {/* 7. Questions */}
          <div>
            <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 10, paddingLeft: 2, letterSpacing: "0.04em" }}>
              可以一起想想
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {questions.map((item, i) => (
                <button
                  key={item.q.slice(0, 12)}
                  onClick={() => onOpenSheet(COMP_SHEET_QUESTIONS, i)}
                  style={{
                    padding: "13px 16px", borderRadius: 15,
                    border: `1px solid ${item.accent}28`,
                    background: `${item.accent}0A`,
                    display: "flex", alignItems: "center", gap: 12,
                    cursor: "pointer", textAlign: "left", width: "100%",
                    transition: "transform 0.13s ease",
                  }}
                  onPointerDown={e => (e.currentTarget.style.transform = "scale(0.98)")}
                  onPointerUp={e   => (e.currentTarget.style.transform = "scale(1)")}
                  onPointerLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  <div style={{
                    width: 24, height: 24, borderRadius: 7, flexShrink: 0,
                    background: `${item.accent}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
                    color: item.accent, fontWeight: 700,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.55, flex: 1 }}>
                    {item.q}
                  </span>
                  <span style={{ fontSize: 11, color: item.accent, flexShrink: 0 }}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* 8. Save + share */}
          <SaveCardButton />
          {onSharePoster && (
            <button onClick={onSharePoster} style={{
              width: "100%", marginTop: 10, padding: "14px 20px",
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(107,191,160,0.20), rgba(255,255,255,0.85))",
              border: "1.5px solid rgba(107,191,160,0.35)",
              backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
            }}>
              <span style={{ fontSize: 15, color: "#6BBFA0" }}>⊙</span>
              <span style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D" }}>
                生成合盘分享卡
              </span>
            </button>
          )}

          <div style={{ height: 8 }} />
        </div>
      </div>
    </>
  );
}
