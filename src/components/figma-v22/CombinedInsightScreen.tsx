import React, { useState, useEffect, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type InsightStep =
  | "question" | "depth" | "confirm" | "progress"
  | "evidence" | "consensus" | "report" | "history";
type DepthLevel = "quick" | "standard" | "deep";
type EvidenceTab = "all" | "bazi" | "ziwei" | "qimen";

// ─── Step definitions per depth (pure data, no JSX) ──────────────────────────
interface ProgStep {
  id: string; label: string; desc: string;
  systemColor: string | null; skipped: boolean;
}

function getDepthSteps(d: DepthLevel): ProgStep[] {
  const base: ProgStep[] = [
    { id: "parse", label: "问题拆解", desc: "理解问题的维度与时间尺度",           systemColor: null,      skipped: false },
    { id: "bazi",  label: "八字证据", desc: "提取命局三柱结构与当前流年流月节律", systemColor: "#E8816A", skipped: false },
  ];
  if (d === "quick") {
    return [...base,
      { id: "action", label: "整合建议", desc: "整合八字有效证据，形成可操作方向", systemColor: null, skipped: false },
    ];
  }
  if (d === "standard") {
    return [...base,
      { id: "ziwei",  label: "紫微证据", desc: "时辰缺失，本次跳过宫位分析",     systemColor: "#C8A040", skipped: true  },
      { id: "merge",  label: "证据整合", desc: "合并有效证据，去除冗余结论",     systemColor: null,      skipped: false },
      { id: "action", label: "行动建议", desc: "整合有效证据，形成可操作方向",   systemColor: null,      skipped: false },
    ];
  }
  return [...base,
    { id: "ziwei",    label: "紫微证据", desc: "时辰缺失，本次跳过宫位分析",   systemColor: "#C8A040", skipped: true  },
    { id: "qimen",    label: "奇门证据", desc: "起局信息未提供，本次跳过",     systemColor: "#7BBDE0", skipped: true  },
    { id: "merge",    label: "证据整合", desc: "合并有效证据，去除冗余结论",   systemColor: null,      skipped: false },
    { id: "conflict", label: "冲突判断", desc: "识别证据间相互矛盾的部分",     systemColor: null,      skipped: false },
    { id: "action",   label: "行动建议", desc: "整合有效证据，形成可操作方向", systemColor: null,      skipped: false },
  ];
}

const PHASE_CHAR_MAP: Record<string, string> = {
  parse: "解", bazi: "命", ziwei: "跳", qimen: "跳",
  merge: "合", conflict: "判", action: "行",
};

// ─── Depth options ─────────────────────────────────────────────────────────────
interface DepthOpt {
  id: DepthLevel; title: string; subtitle: string;
  systems: string[]; costHint: string; timeHint: string; depthHint: string;
  showDemotionNote: boolean;
}
const DEPTH_OPTS: DepthOpt[] = [
  {
    id: "quick", title: "快速观察", subtitle: "用八字结构快速定位当前节律",
    systems: ["八字"], costHint: "预计消耗：低",
    timeHint: "约 3–5 分钟", depthHint: "基础能量参考，适合日常决策",
    showDemotionNote: false,
  },
  {
    id: "standard", title: "标准合参", subtitle: "八字与紫微交叉验证，形成更稳定的结论",
    systems: ["八字", "紫微斗数"], costHint: "预计消耗：中",
    timeHint: "约 8–12 分钟", depthHint: "有较多证据支撑，适合中期规划",
    showDemotionNote: true,
  },
  {
    id: "deep", title: "深度推演", subtitle: "三体系全面覆盖，标注证据边界与冲突",
    systems: ["八字", "紫微斗数", "奇门遁甲"], costHint: "预计消耗：高",
    timeHint: "约 15–20 分钟", depthHint: "最全面，冲突与边界最清晰",
    showDemotionNote: true,
  },
];

// System availability — fixed for this profile (birth date ✓, birth time ✗)
const SYSTEMS_STATUS_LIST = [
  {
    id: "bazi",  name: "八字",
    statusLabel: "部分可用",
    note: "年/月/日三柱可用，时辰缺失，精度略降",
    available: true,
  },
  {
    id: "ziwei", name: "紫微斗数",
    statusLabel: "本次不纳入",
    note: "时辰缺失，无法推算宫位分布，不生成假证据",
    available: false,
  },
  {
    id: "qimen", name: "奇门遁甲",
    statusLabel: "本次不纳入",
    note: "未提供起局时间与地点，本次无法起局",
    available: false,
  },
] as const;

// ─── Evidence data ───────────────────────────────────────────────────────────
// 紫微与奇门本次不纳入，无证据条目
interface EvidenceItem {
  id: string; conclusion: string; basis: string;
  scope: string; strength: string; integrity: string;
}
interface SystemEvidence {
  systemId: string; name: string; color: string; bgColor: string;
  items: EvidenceItem[];
}
const EVIDENCE_DATA: SystemEvidence[] = [
  {
    systemId: "bazi", name: "八字", color: "#E8816A", bgColor: "rgba(232,129,106,0.07)",
    items: [
      {
        id: "bz1",
        conclusion: "当前流年激活伤官，行动力强，但容易在表达上过于直接",
        basis: "甲辰年 · 日柱甲木 · 伤官格激活",
        scope: "2024 全年 · 人际与表达", strength: "强", integrity: "部分（三柱）",
      },
      {
        id: "bz2",
        conclusion: "七月前属于积累阶段，主动开口时机宜谨慎",
        basis: "流月壬申 · 印绶入月令 · 抑制表达",
        scope: "近 30 天 · 沟通与决策", strength: "中", integrity: "部分（三柱）",
      },
      {
        id: "bz3",
        conclusion: "与合作相关的决策，近期信号偏弱",
        basis: "财星陷制 · 官星无力",
        scope: "当前大运周期", strength: "中", integrity: "部分（三柱）",
      },
    ],
  },
];

interface SharedConclusion { id: string; text: string; weight: string; timeScope: string; }
const SHARED_CONCLUSIONS: SharedConclusion[] = [
  { id: "s1", text: "现在不是主动推进的最佳节点，观察比行动更有价值", weight: "八字三柱支持", timeScope: "近 1–3 个月" },
  { id: "s2", text: "内部准备比外部展示更重要，静中有动", weight: "八字当前大运", timeScope: "当前大运" },
];

interface TimelineItem { id: string; period: string; color: string; items: string[]; }
const TIMELINE_ITEMS: TimelineItem[] = [
  { id: "t7",  period: "未来 7 天",  color: "#6BBFA0", items: ["观察你在哪些对话里感到明显不顺", "暂缓不可逆的承诺，先多听"] },
  { id: "t30", period: "未来 30 天", color: "#7BBDE0", items: ["整理一次你真正想推进的事情清单", "关注流月节点变化（约 7 月中旬）"] },
  { id: "t90", period: "未来 90 天", color: "#C0ACDE", items: ["大运节点将在秋季产生变化，届时可以重新评估方向", "持续记录你的决策与实际结果，积累自我校正数据"] },
];

interface VersionEntry {
  id: string; version: string; date: string; dataChanges: string;
  ruleVersion: string; conclusionChange: string; reason: string; isCurrent: boolean;
}
const VERSION_HISTORY: VersionEntry[] = [
  {
    id: "v1", version: "Version 1", date: "今天 · 刚刚",
    dataChanges: "八字年/月/日三柱（时辰暂缺）",
    ruleVersion: "规则库 2.4", conclusionChange: "仅含八字三柱基础观察",
    reason: "时辰未知，紫微与奇门暂不纳入，补充后自动升级", isCurrent: true,
  },
];

// ─── Shared style helpers ──────────────────────────────────────────────────────
const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.74)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.88)",
};

function PressCard({ children, onClick, style }: {
  children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <div onClick={onClick}
      onPointerDown={() => setPressed(true)} onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        ...glass, borderRadius: 20,
        boxShadow: pressed ? "0 2px 8px rgba(160,130,200,0.08)" : "0 4px 18px rgba(160,130,200,0.11)",
        transform: pressed ? "scale(0.984)" : "scale(1)",
        transition: "transform 0.13s ease, box-shadow 0.13s ease",
        cursor: onClick ? "pointer" : "default", ...style,
      }}>{children}</div>
  );
}

function EvidenceScopeBadge() {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "3px 10px", borderRadius: 20,
      background: "rgba(233,201,126,0.14)", border: "1px solid rgba(233,201,126,0.32)",
      fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
      color: "#A08030", letterSpacing: "0.04em",
    }}>当前仅使用已核对资料</div>
  );
}

function BackBtn({ onBack }: { onBack: () => void }) {
  return (
    <button onClick={onBack} style={{
      width: 34, height: 34, borderRadius: "50%",
      background: "rgba(255,255,255,0.68)",
      backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.88)",
      boxShadow: "0 2px 8px rgba(160,130,200,0.09)",
      cursor: "pointer", fontSize: 15, color: "#8C82A4",
      display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
    }}>←</button>
  );
}

// ─── Tri-orbit instrument (QuestionStep hero) ──────────────────────────────────
function TriOrbitInstrument({ size = 150 }: { size?: number }) {
  const cx = size / 2, cy = size / 2, s = size / 150;
  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      <div style={{
        position: "absolute", inset: -10,
        background: "radial-gradient(ellipse, rgba(107,191,160,0.10) 0%, rgba(232,129,106,0.08) 45%, transparent 70%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="tri-core" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.95" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "orbit-slow 22s linear infinite" }}>
          <circle cx={cx} cy={cy} r={62 * s} fill="none" stroke="rgba(232,129,106,0.28)" strokeWidth={1.3} />
          <circle cx={cx} cy={cy + 62 * s} r={3.5 * s} fill="#E8816A" opacity={0.82} />
        </g>
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "orbit-mid 30s linear infinite reverse" }}>
          <circle cx={cx} cy={cy} r={46 * s} fill="none" stroke="rgba(233,201,126,0.32)" strokeWidth={1.1} />
          <circle cx={cx + 46 * s} cy={cy} r={3 * s} fill="#E9C97E" opacity={0.82} />
        </g>
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "orbit-dot 16s linear infinite" }}>
          <circle cx={cx} cy={cy} r={32 * s} fill="none"
            stroke="rgba(123,189,224,0.35)" strokeWidth={1} strokeDasharray={`${2.5 * s} ${3 * s}`} />
          <circle cx={cx - 32 * s} cy={cy} r={2.5 * s} fill="#7BBDE0" opacity={0.78} />
        </g>
        <circle cx={cx} cy={cy} r={20 * s} fill="url(#tri-core)" />
        <circle cx={cx} cy={cy} r={17 * s}
          fill="rgba(255,255,255,0.90)" stroke="rgba(233,201,126,0.45)" strokeWidth={1.3} />
        <text x={cx} y={cy + 0.5} textAnchor="middle" dominantBaseline="middle"
          fontSize={13 * s} fontFamily="'Noto Serif SC', serif" fontWeight="700" fill="#28253D">合</text>
        <text x={cx + 66 * s} y={cy - 3 * s} textAnchor="start" dominantBaseline="middle"
          fontSize={7 * s} fontFamily="'Noto Sans SC', sans-serif" fill="rgba(232,129,106,0.70)">八字</text>
        <text x={cx - 5 * s} y={cy - 52 * s} textAnchor="middle" dominantBaseline="middle"
          fontSize={7 * s} fontFamily="'Noto Sans SC', sans-serif" fill="rgba(200,160,64,0.70)">紫微</text>
        <text x={cx - 67 * s} y={cy - 3 * s} textAnchor="end" dominantBaseline="middle"
          fontSize={7 * s} fontFamily="'Noto Sans SC', sans-serif" fill="rgba(123,189,224,0.70)">奇门</text>
      </svg>
    </div>
  );
}

// ─── Progress orbit instrument (三轨证据汇聚仪) ────────────────────────────────
// 八字 = coral solid track + animating node (available)
// 紫微 = gray dashed track, no node (skipped)
// 奇门 = gray dashed track, no node (skipped)
function ProgressInstrument({ phaseChar, isDone }: { phaseChar: string; isDone: boolean }) {
  const prefersReducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const size = 182;
  const cx = size / 2, cy = size / 2, s = size / 150;
  return (
    <div style={{ width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <radialGradient id="pi-grad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FAF8F5" stopOpacity="0.96" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <filter id="pi-glow" x="-100%" y="-100%" width="300%" height="300%">
            <feGaussianBlur stdDeviation="3.2" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        </defs>

        {/* Soft ambient halo around coral orbit */}
        <circle cx={cx} cy={cy} r={65 * s} fill="none"
          stroke="rgba(232,129,106,0.08)" strokeWidth={8 * s} />

        {/* Orbit 1 — 八字 (available · solid coral track) */}
        <circle cx={cx} cy={cy} r={62 * s} fill="none"
          stroke="rgba(232,129,106,0.34)" strokeWidth={1.8} />
        <g style={{
          transformOrigin: `${cx}px ${cy}px`,
          animation: prefersReducedMotion ? "none" : "orbit-slow 22s linear infinite",
        }}>
          <circle cx={cx} cy={cy + 62 * s} r={5.5 * s} fill="#E8816A" filter="url(#pi-glow)" />
        </g>

        {/* Orbit 2 — 紫微 (skipped · gray dashed, no node) */}
        <circle cx={cx} cy={cy} r={46 * s} fill="none"
          stroke="rgba(186,178,202,0.32)" strokeWidth={1.3}
          strokeDasharray={`${3.5 * s} ${4.5 * s}`} />

        {/* Orbit 3 — 奇门 (skipped · gray dashed, no node) */}
        <circle cx={cx} cy={cy} r={31 * s} fill="none"
          stroke="rgba(186,178,202,0.22)" strokeWidth={1.0}
          strokeDasharray={`${2.5 * s} ${3.5 * s}`} />

        {/* Center disc */}
        <circle cx={cx} cy={cy} r={23 * s} fill="url(#pi-grad)" />
        <circle cx={cx} cy={cy} r={20 * s}
          fill="rgba(255,255,255,0.94)"
          stroke={isDone ? "rgba(107,191,160,0.50)" : "rgba(232,129,106,0.38)"}
          strokeWidth={1.5} />
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
          fontSize={14 * s} fontFamily="'Noto Serif SC', serif" fontWeight="700"
          fill={isDone ? "#3D9E7E" : "#28253D"}>{phaseChar}</text>
      </svg>
    </div>
  );
}

// ─── Page shell ────────────────────────────────────────────────────────────────
function PageShell({ children, scrollRef }: {
  children: React.ReactNode; scrollRef?: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div ref={scrollRef} style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 44%, #FDF4F1 100%)",
      overflowY: "auto", overflowX: "hidden", scrollbarWidth: "none",
    }}>
      <div style={{ height: 52 }} />
      {children}
      <div style={{ height: 86 }} />
    </div>
  );
}

// ─── Step 1: Question ─────────────────────────────────────────────────────────
function QuestionStep({ onBack, question, setQuestion, onNext, scrollRef }: {
  onBack: () => void; question: string; setQuestion: (q: string) => void;
  onNext: () => void; scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const EXAMPLES = ["现在适合换工作吗", "这段关系还值得继续吗", "年内创业时机怎么看", "为什么最近做什么都不顺"];
  const canProceed = question.trim().length >= 6;
  return (
    <PageShell scrollRef={scrollRef}>
      <div style={{ padding: "0 22px 20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
          <BackBtn onBack={onBack} />
          <div style={{ fontSize: 22, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", letterSpacing: "0.04em" }}>
            高阶合参
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginLeft: 44, marginBottom: 20 }}>
          多体系交叉验证 · 结论边界清晰
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <TriOrbitInstrument size={140} />
        </div>

        <div style={{ fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", lineHeight: 1.5, marginBottom: 8, textAlign: "center" }}>
          一件事，先把依据看清楚
        </div>
        <div style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#7B6E90", lineHeight: 1.68, marginBottom: 24, textAlign: "center" }}>
          用八字、紫微、奇门三个角度各自形成证据，<br />再合并、标注分歧，给你一个说得清来源的结论
        </div>

        {/* Profile chip — 出生日期完整，时辰未填写 */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 18 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: "linear-gradient(135deg, #6BBFA0CC, #6BBFA066)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, color: "#fff", fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
          }}>木</div>
          <span style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168" }}>晓媛的档案</span>
          <span style={{ fontSize: 11, color: "#B0A4C6" }}>· 出生日期完整，时辰未填写</span>
        </div>

        <PressCard style={{ padding: 0, marginBottom: 14 }}>
          <textarea
            value={question} onChange={e => setQuestion(e.target.value)}
            placeholder="写下你现在最想搞清楚的一件事，越具体越好"
            rows={4}
            style={{
              width: "100%", border: "none", background: "transparent",
              padding: "16px 18px", borderRadius: 20,
              fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#28253D", outline: "none", resize: "none",
              lineHeight: 1.65, boxSizing: "border-box",
            }}
          />
        </PressCard>

        <div style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 10 }}>
          快速选择示例：
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
          {EXAMPLES.map(ex => (
            <button key={ex} onClick={() => setQuestion(ex)} style={{
              padding: "6px 14px", borderRadius: 20,
              background: question === ex ? "rgba(107,191,160,0.14)" : "rgba(255,255,255,0.68)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: question === ex ? "1.5px solid rgba(107,191,160,0.40)" : "1px solid rgba(255,255,255,0.88)",
              fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
              color: question === ex ? "#3D9E7E" : "#7B6E90",
              cursor: "pointer", transition: "all 0.16s ease",
            }}>{ex}</button>
          ))}
        </div>

        <div style={{
          padding: "12px 16px", borderRadius: 16,
          background: "rgba(255,255,255,0.52)", border: "1px solid rgba(192,172,222,0.20)",
          fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#8878A0", lineHeight: 1.65, marginBottom: 28,
        }}>
          以下内容来自传统文化结构化观察，不作为重大决策的唯一依据。结论有边界，使用时请保留自己的判断。
        </div>

        <button onClick={onNext} disabled={!canProceed} style={{
          width: "100%", padding: "15px 24px", borderRadius: 18,
          background: canProceed ? "linear-gradient(135deg, #6BBFA0, #7BBDE0)" : "rgba(192,172,222,0.28)",
          border: "none", cursor: canProceed ? "pointer" : "not-allowed",
          fontSize: 15.5, fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 500, color: canProceed ? "#fff" : "#B0A4C6",
          boxShadow: canProceed ? "0 4px 18px rgba(107,191,160,0.30)" : "none",
          transition: "all 0.20s ease",
        }}>开始梳理</button>
      </div>
    </PageShell>
  );
}

// ─── Step 2: Depth ─────────────────────────────────────────────────────────────
function DepthStep({ onBack, depth, setDepth, onNext, scrollRef }: {
  onBack: () => void; depth: DepthLevel; setDepth: (d: DepthLevel) => void;
  onNext: () => void; scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <PageShell scrollRef={scrollRef}>
      <div style={{ padding: "0 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <BackBtn onBack={onBack} />
          <div style={{ fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D" }}>
            选择分析深度
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginLeft: 44, marginBottom: 24 }}>
          深度越高，覆盖体系越多，边界也更清晰
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 28 }}>
          {DEPTH_OPTS.map(opt => {
            const isSelected = depth === opt.id;
            const stepCount = getDepthSteps(opt.id).length;
            return (
              <div key={opt.id} onClick={() => setDepth(opt.id)} style={{
                ...glass, borderRadius: 20, padding: "18px 20px",
                border: isSelected ? "1.5px solid rgba(107,191,160,0.50)" : "1px solid rgba(255,255,255,0.88)",
                background: isSelected ? "rgba(107,191,160,0.08)" : "rgba(255,255,255,0.74)",
                boxShadow: isSelected ? "0 4px 18px rgba(107,191,160,0.14)" : "0 3px 14px rgba(160,130,200,0.09)",
                cursor: "pointer", transition: "all 0.18s ease",
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 16, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", marginBottom: 3 }}>
                      {opt.title}
                    </div>
                    <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#7B6E90" }}>
                      {opt.subtitle}
                    </div>
                  </div>
                  <div style={{
                    width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                    border: isSelected ? "2px solid #6BBFA0" : "2px solid rgba(192,172,222,0.40)",
                    background: isSelected ? "#6BBFA0" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center", marginTop: 2,
                  }}>
                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                  </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                  {opt.systems.map(sys => (
                    <span key={sys} style={{
                      padding: "3px 10px", borderRadius: 16,
                      fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
                      background: "rgba(192,172,222,0.14)", color: "#6B607E",
                      border: "1px solid rgba(192,172,222,0.22)",
                    }}>{sys}</span>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: opt.showDemotionNote ? 10 : 0 }}>
                  <span style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8" }}>共 {stepCount} 步</span>
                  <span style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8" }}>{opt.timeHint}</span>
                  <span style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8" }}>{opt.costHint}</span>
                </div>

                {opt.showDemotionNote && (
                  <div style={{
                    marginTop: 2, padding: "7px 10px", borderRadius: 10,
                    background: "rgba(233,201,126,0.10)", border: "1px solid rgba(233,201,126,0.22)",
                    fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#8A7240", lineHeight: 1.55,
                  }}>
                    会先检查资料，可用体系不足时自动降级，不生成假证据
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button onClick={onNext} style={{
          width: "100%", padding: "15px 24px", borderRadius: 18,
          background: "linear-gradient(135deg, #6BBFA0, #7BBDE0)",
          border: "none", cursor: "pointer",
          fontSize: 15.5, fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 500, color: "#fff",
          boxShadow: "0 4px 18px rgba(107,191,160,0.30)",
        }}>确定深度，继续</button>
      </div>
    </PageShell>
  );
}

// ─── Step 3: Confirm ──────────────────────────────────────────────────────────
function ConfirmStep({ onBack, question, depth, onNext, scrollRef }: {
  onBack: () => void; question: string; depth: DepthLevel;
  onNext: () => void; scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const steps = getDepthSteps(depth);
  return (
    <PageShell scrollRef={scrollRef}>
      <div style={{ padding: "0 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <BackBtn onBack={onBack} />
          <div style={{ fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D" }}>
            分析前确认
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginLeft: 44, marginBottom: 20 }}>
          开始前确认问题和可用资料
        </div>

        <PressCard style={{ padding: "16px 18px", marginBottom: 14 }}>
          <div style={{ fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 6 }}>你的问题</div>
          <div style={{ fontSize: 15, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", lineHeight: 1.55 }}>
            {question || "（未填写，将使用今日综合观察）"}
          </div>
        </PressCard>

        {/* System status — consistent with actual data availability */}
        <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#9088A8", marginBottom: 10 }}>
          体系可用情况
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
          {SYSTEMS_STATUS_LIST.map(sys => (
            <div key={sys.id} style={{
              display: "flex", alignItems: "flex-start", gap: 12, padding: "12px 16px",
              borderRadius: 16, background: "rgba(255,255,255,0.60)", border: "1px solid rgba(255,255,255,0.85)",
            }}>
              <div style={{
                width: 24, height: 24, borderRadius: "50%", flexShrink: 0, marginTop: 1,
                background: sys.available ? "rgba(232,129,106,0.12)" : "rgba(192,172,222,0.10)",
                border: `1.5px solid ${sys.available ? "#E8816A66" : "rgba(192,172,222,0.30)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: sys.available ? "#E8816A" : "#B0A4C6", fontWeight: 700,
              }}>{sys.available ? "~" : "—"}</div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D" }}>
                    {sys.name}
                  </span>
                  <span style={{
                    padding: "1px 7px", borderRadius: 10,
                    fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
                    color: sys.available ? "#C07040" : "#9088A8",
                    background: sys.available ? "rgba(232,129,106,0.09)" : "rgba(192,172,222,0.10)",
                    border: `1px solid ${sys.available ? "rgba(232,129,106,0.22)" : "rgba(192,172,222,0.22)"}`,
                  }}>{sys.statusLabel}</span>
                </div>
                <div style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#8878A0", lineHeight: 1.5 }}>
                  {sys.note}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Impact note */}
        <div style={{
          padding: "12px 16px", borderRadius: 16,
          background: "rgba(233,201,126,0.10)", border: "1px solid rgba(233,201,126,0.25)",
          marginBottom: 18,
        }}>
          <div style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#A08030", marginBottom: 5, fontWeight: 500 }}>
            时辰缺失的影响
          </div>
          <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#7B6C48", lineHeight: 1.65 }}>
            时辰缺失时，紫微斗数无法生成宫位分布，奇门也无法起局。本次仅使用八字三柱，结论范围相应缩小，不会随机填充时辰来补全证据。补充时辰后，两个体系自动纳入，置信等级同步提升。
          </div>
        </div>

        {/* Step list */}
        <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#9088A8", marginBottom: 10 }}>
          本次分析步骤 · {steps.length} 步
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 28 }}>
          {steps.map((ps, i) => (
            <div key={ps.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%", flexShrink: 0,
                background: ps.skipped ? "rgba(186,178,202,0.10)" : (ps.systemColor ? `${ps.systemColor}18` : "rgba(192,172,222,0.12)"),
                border: `1.5px solid ${ps.skipped ? "rgba(186,178,202,0.28)" : (ps.systemColor || "rgba(192,172,222,0.30)")}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: ps.skipped ? "#B0A4C6" : (ps.systemColor || "#9088A8"), fontWeight: 500,
              }}>{ps.skipped ? "—" : i + 1}</div>
              <span style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: ps.skipped ? "#B0A4C6" : "#4A4168" }}>
                {ps.label}
              </span>
              {ps.skipped && (
                <span style={{
                  fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif", color: "#B0A4C6",
                  padding: "1px 6px", borderRadius: 8,
                  background: "rgba(186,178,202,0.10)", border: "1px solid rgba(186,178,202,0.22)",
                }}>跳过</span>
              )}
            </div>
          ))}
        </div>

        <button onClick={onNext} style={{
          width: "100%", padding: "15px 24px", borderRadius: 18,
          background: "linear-gradient(135deg, #E8816A, #E9A87E)",
          border: "none", cursor: "pointer",
          fontSize: 15.5, fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 500, color: "#fff",
          boxShadow: "0 4px 18px rgba(232,129,106,0.28)",
        }}>确认开始</button>
      </div>
    </PageShell>
  );
}

// ─── Step 4: Progress (三轨证据汇聚仪) ────────────────────────────────────────
function ProgressStep({ onNext, depth, progressIdx, scrollRef }: {
  onNext: () => void; depth: DepthLevel; progressIdx: number;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const steps = getDepthSteps(depth);
  const isDone = progressIdx >= steps.length;
  const currentStepId = isDone ? "done" : (steps[progressIdx]?.id ?? "");
  const phaseChar = isDone ? "成" : (PHASE_CHAR_MAP[currentStepId] ?? "合");

  return (
    <PageShell scrollRef={scrollRef}>
      <div style={{ padding: "0 22px 24px" }}>

        {/* ── Top half: instrument + titles ── */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
          <ProgressInstrument phaseChar={phaseChar} isDone={isDone} />

          {/* Legend: track status */}
          <div style={{ display: "flex", gap: 14, marginTop: 10, marginBottom: 10 }}>
            {[
              { label: "八字 可用", dashed: false, color: "#E8816A" },
              { label: "紫微 跳过", dashed: true,  color: "rgba(186,178,202,0.60)" },
              { label: "奇门 跳过", dashed: true,  color: "rgba(186,178,202,0.48)" },
            ].map(item => (
              <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <svg width="14" height="6" style={{ flexShrink: 0 }}>
                  {item.dashed
                    ? <line x1="0" y1="3" x2="14" y2="3" stroke={item.color} strokeWidth="1.5" strokeDasharray="3 3" />
                    : <line x1="0" y1="3" x2="14" y2="3" stroke={item.color} strokeWidth="2" />
                  }
                </svg>
                <span style={{ fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: item.dashed ? "#B0A4C6" : "#7B6E90" }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 19, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", marginBottom: 4 }}>
              {isDone ? "可用证据已整理完成" : "推演进行中"}
            </div>
            <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", lineHeight: 1.55 }}>
              {isDone
                ? "本次使用八字三柱，紫微与奇门等待补充资料"
                : `第 ${Math.min(progressIdx + 1, steps.length)} / ${steps.length} 步 · ${DEPTH_OPTS.find(d => d.id === depth)!.title}`}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(192,172,222,0.18)", marginBottom: 18 }} />

        {/* ── Bottom half: compact step list ── */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          {steps.map((ps, i) => {
            const isHandled = i < progressIdx;
            const isActive = i === progressIdx && !isDone;
            const isFuture = i > progressIdx;

            const nodeColor =
              ps.skipped ? "rgba(186,178,202,0.18)"
              : isHandled ? "#6BBFA0"
              : isActive ? (ps.systemColor || "#7BBDE0")
              : "rgba(192,172,222,0.14)";
            const nodeBorder =
              ps.skipped ? "rgba(186,178,202,0.28)"
              : isHandled ? "#6BBFA0"
              : isActive ? (ps.systemColor || "#7BBDE0")
              : "rgba(192,172,222,0.28)";
            const nodeTextColor = (isHandled || isActive) && !ps.skipped ? "#fff" : "#B0A4C6";
            const nodeChar = ps.skipped ? "—" : (isHandled ? "✓" : String(i + 1));

            return (
              <div key={ps.id} style={{ display: "flex", gap: 13 }}>
                {/* Node + connector */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 26 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                    background: nodeColor,
                    border: `2px solid ${nodeBorder}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 10, color: nodeTextColor, fontWeight: 700,
                    animation: isActive && !ps.skipped ? "pulse-dot 2s ease-in-out infinite" : "none",
                    boxShadow: isActive && !ps.skipped ? `0 0 10px ${ps.systemColor || "#7BBDE0"}44` : "none",
                    transition: "all 0.4s ease",
                  }}>{nodeChar}</div>
                  {i < steps.length - 1 && (
                    <div style={{
                      width: 2, flexGrow: 1, minHeight: 14,
                      background: isHandled && !ps.skipped ? "rgba(107,191,160,0.35)" : "rgba(192,172,222,0.16)",
                      margin: "2px 0", transition: "background 0.4s ease",
                    }} />
                  )}
                </div>

                {/* Content */}
                <div style={{
                  flex: 1, paddingBottom: i < steps.length - 1 ? 10 : 0,
                  opacity: isFuture ? 0.42 : 1, transition: "opacity 0.4s ease",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
                    <span style={{
                      fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                      fontWeight: isActive ? 600 : 500,
                      color: ps.skipped && isHandled ? "#B0A4C6" : "#28253D",
                    }}>{ps.label}</span>
                    {ps.skipped && (isHandled || isActive) && (
                      <span style={{
                        fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif", color: "#B0A4C6",
                        padding: "1px 7px", borderRadius: 9,
                        background: "rgba(186,178,202,0.10)", border: "1px solid rgba(186,178,202,0.22)",
                      }}>跳过 · 资料不足</span>
                    )}
                  </div>
                  {!ps.skipped && (
                    <div style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", lineHeight: 1.45 }}>
                      {isHandled ? "已完成" : ps.desc}
                    </div>
                  )}
                  {isActive && !ps.skipped && (
                    <div style={{ marginTop: 5 }}>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(192,172,222,0.18)", overflow: "hidden", width: 100 }}>
                        <div style={{
                          height: "100%", borderRadius: 2,
                          background: `linear-gradient(90deg, ${ps.systemColor || "#7BBDE0"}, ${ps.systemColor || "#7BBDE0"}88)`,
                          animation: "track-fill 1.4s ease-in-out infinite",
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {isDone && (
          <div style={{ marginTop: 28 }}>
            <button onClick={onNext} style={{
              width: "100%", padding: "15px 24px", borderRadius: 18,
              background: "linear-gradient(135deg, #6BBFA0, #7BBDE0)",
              border: "none", cursor: "pointer",
              fontSize: 15.5, fontFamily: "'Noto Sans SC', sans-serif",
              fontWeight: 500, color: "#fff",
              boxShadow: "0 4px 18px rgba(107,191,160,0.30)",
            }}>查看分析矩阵 →</button>
          </div>
        )}
        <style>{`
          @keyframes track-fill {
            0%   { width: 0%; opacity: 1; }
            70%  { width: 95%; opacity: 1; }
            100% { width: 100%; opacity: 0.4; }
          }
        `}</style>
      </div>
    </PageShell>
  );
}

// ─── Step 5: Evidence matrix ──────────────────────────────────────────────────
function EvidenceStep({ onBack, onNext, expandedId, setExpandedId, evidenceTab, setEvidenceTab, scrollRef }: {
  onBack: () => void; onNext: () => void;
  expandedId: string | null; setExpandedId: (id: string | null) => void;
  evidenceTab: EvidenceTab; setEvidenceTab: (t: EvidenceTab) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const TABS: { id: EvidenceTab; label: string }[] = [
    { id: "all",   label: "全部" },
    { id: "bazi",  label: "八字" },
    { id: "ziwei", label: "紫微" },
    { id: "qimen", label: "奇门" },
  ];

  const visibleSystems = evidenceTab === "all"
    ? EVIDENCE_DATA
    : EVIDENCE_DATA.filter(s => s.systemId === evidenceTab);

  // Empty state content for unavailable systems
  const unavailableInfo: Record<string, { title: string; reason: string; missing: string; howTo: string; color: string; bg: string }> = {
    ziwei: {
      title: "紫微斗数", color: "#C8A040", bg: "rgba(233,201,126,0.07)",
      reason: "时辰缺失，本次不纳入完整紫微证据",
      missing: "出生时辰（子 / 丑 / 寅 … 亥，精确到两小时以内）",
      howTo: "在档案页补充出生时辰，下次合参自动纳入紫微宫位分析",
    },
    qimen: {
      title: "奇门遁甲", color: "#5A9EC8", bg: "rgba(123,189,224,0.07)",
      reason: "未提供起局时间与地点，本次未起局",
      missing: "起局日期、时辰与所在地点",
      howTo: "在合参时选择「提供起局信息」，或由系统使用当前时间与位置起局",
    },
  };

  const showUnavailable = (evidenceTab === "ziwei" || evidenceTab === "qimen") && visibleSystems.length === 0;
  const unavail = showUnavailable ? unavailableInfo[evidenceTab] : null;

  return (
    <PageShell scrollRef={scrollRef}>
      <div style={{ padding: "0 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <BackBtn onBack={onBack} />
          <div style={{ fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D" }}>
            体系证据矩阵
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginLeft: 44, marginBottom: 12 }}>
          当前可用体系的独立证据
        </div>
        <div style={{ marginBottom: 18 }}><EvidenceScopeBadge /></div>

        {/* Status note on "all" tab */}
        {evidenceTab === "all" && (
          <div style={{
            padding: "9px 14px", borderRadius: 12, marginBottom: 14,
            background: "rgba(233,201,126,0.08)", border: "1px solid rgba(233,201,126,0.22)",
            fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#8A7240", lineHeight: 1.55,
          }}>
            当前仅含八字三柱证据。紫微与奇门等待资料补充后自动纳入。
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, overflowX: "auto", scrollbarWidth: "none" }}>
          {TABS.map(tab => {
            const isActive = evidenceTab === tab.id;
            const isUnavailTab = tab.id === "ziwei" || tab.id === "qimen";
            return (
              <button key={tab.id} onClick={() => setEvidenceTab(tab.id)} style={{
                padding: "6px 16px", borderRadius: 20, flexShrink: 0,
                background: isActive ? "rgba(107,191,160,0.14)" : "rgba(255,255,255,0.62)",
                backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                border: isActive ? "1.5px solid rgba(107,191,160,0.40)" : "1px solid rgba(255,255,255,0.88)",
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: isActive ? 500 : 400,
                color: isActive ? "#3D9E7E" : (isUnavailTab ? "#B0A4C6" : "#9088A8"),
                cursor: "pointer", transition: "all 0.16s ease",
              }}>{tab.label}</button>
            );
          })}
        </div>

        {/* Unavailable system empty state */}
        {showUnavailable && unavail && (
          <div style={{
            borderRadius: 20, padding: "28px 22px",
            background: unavail.bg, border: `1px solid ${unavail.color}22`,
            textAlign: "center",
          }}>
            <div style={{ fontSize: 15, fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: "#28253D", marginBottom: 6 }}>
              {unavail.title}
            </div>
            <div style={{
              display: "inline-block", padding: "2px 10px", borderRadius: 12, marginBottom: 16,
              fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#9088A8", background: "rgba(186,178,202,0.12)", border: "1px solid rgba(186,178,202,0.22)",
            }}>本次未纳入</div>
            <div style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#5A5076", lineHeight: 1.65, marginBottom: 18 }}>
              {unavail.reason}
            </div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 5, fontWeight: 500 }}>
                缺少什么
              </div>
              <div style={{
                padding: "9px 12px", borderRadius: 12, marginBottom: 12,
                background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.88)",
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.60,
              }}>{unavail.missing}</div>
              <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 5, fontWeight: 500 }}>
                如何补充
              </div>
              <div style={{
                padding: "9px 12px", borderRadius: 12,
                background: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.88)",
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.60,
              }}>{unavail.howTo}</div>
            </div>
          </div>
        )}

        {/* Evidence cards */}
        {!showUnavailable && (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {visibleSystems.map(sys => (
              <div key={sys.systemId}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <div style={{ width: 4, height: 16, borderRadius: 2, background: sys.color }} />
                  <span style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: "#28253D" }}>
                    {sys.name}
                  </span>
                  <span style={{
                    padding: "2px 8px", borderRadius: 12, fontSize: 10,
                    fontFamily: "'Noto Sans SC', sans-serif",
                    color: sys.color, background: `${sys.color}16`, border: `1px solid ${sys.color}28`,
                  }}>{sys.items.length} 条证据</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {sys.items.map(item => {
                    const isExpanded = expandedId === item.id;
                    return (
                      <div key={item.id} style={{
                        borderRadius: 18, overflow: "hidden",
                        background: sys.bgColor, border: `1px solid ${sys.color}22`,
                        transition: "all 0.2s ease",
                      }}>
                        <div style={{ padding: "14px 16px" }}>
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                            <div style={{ fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#28253D", lineHeight: 1.58, flex: 1 }}>
                              {item.conclusion}
                            </div>
                            <span style={{
                              padding: "2px 7px", borderRadius: 10, flexShrink: 0,
                              fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
                              color: item.strength === "强" ? sys.color : "#9088A8",
                              background: item.strength === "强" ? `${sys.color}14` : "rgba(192,172,222,0.12)",
                              border: `1px solid ${item.strength === "强" ? sys.color + "28" : "rgba(192,172,222,0.22)"}`,
                            }}>{item.strength}</span>
                          </div>
                          <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                            <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", background: "rgba(255,255,255,0.60)" }}>
                              资料{item.integrity}
                            </span>
                            <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", background: "rgba(255,255,255,0.60)" }}>
                              {item.scope}
                            </span>
                          </div>
                          <button onClick={() => setExpandedId(isExpanded ? null : item.id)} style={{
                            marginTop: 10, background: "none", border: "none",
                            cursor: "pointer", fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
                            color: sys.color, padding: 0,
                          }}>
                            {isExpanded ? "收起依据 ↑" : "展开专业依据 ↓"}
                          </button>
                        </div>
                        {isExpanded && (
                          <div style={{
                            padding: "12px 16px 14px",
                            borderTop: `1px solid ${sys.color}18`,
                            background: "rgba(255,255,255,0.45)",
                          }}>
                            <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 4 }}>专业依据</div>
                            <div style={{ fontSize: 12.5, fontFamily: "'Noto Serif SC', serif", color: "#4A4168", lineHeight: 1.65 }}>
                              {item.basis}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ marginTop: 28 }}>
          <button onClick={onNext} style={{
            width: "100%", padding: "15px 24px", borderRadius: 18,
            background: "linear-gradient(135deg, #6BBFA0, #7BBDE0)",
            border: "none", cursor: "pointer",
            fontSize: 15.5, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 500, color: "#fff",
            boxShadow: "0 4px 18px rgba(107,191,160,0.30)",
          }}>查看当前可见方向 →</button>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Step 6: Consensus ────────────────────────────────────────────────────────
// 仅基于八字三柱，无跨体系共同结论，无跨体系冲突
function ConsensusStep({ onBack, onNext, scrollRef }: {
  onBack: () => void; onNext: () => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <PageShell scrollRef={scrollRef}>
      <div style={{ padding: "0 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <BackBtn onBack={onBack} />
          <div style={{ fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D" }}>
            当前可见方向
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginLeft: 44, marginBottom: 12 }}>
          基于可用证据整合
        </div>
        <div style={{ marginBottom: 16 }}><EvidenceScopeBadge /></div>

        {/* Insufficient cross-system consensus note */}
        <div style={{
          padding: "12px 16px", borderRadius: 16, marginBottom: 20,
          background: "rgba(186,178,202,0.10)", border: "1px solid rgba(186,178,202,0.25)",
          fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#7B6E90", lineHeight: 1.65,
        }}>
          当前仅有八字三柱证据，尚不足以形成跨体系共同结论。以下方向来自八字观察，补充时辰后紫微与奇门纳入，可进行更完整的体系对照。
        </div>

        {/* Visible directions */}
        <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#9088A8", marginBottom: 10 }}>
          可见方向
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
          {SHARED_CONCLUSIONS.map(sc => (
            <PressCard key={sc.id} style={{ padding: "16px 18px" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: "#6BBFA0", marginTop: 5, flexShrink: 0,
                  boxShadow: "0 0 6px rgba(107,191,160,0.50)",
                }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif", color: "#28253D", lineHeight: 1.62, marginBottom: 6 }}>
                    {sc.text}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 10,
                      fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
                      color: "#7B8E80", background: "rgba(107,191,160,0.09)",
                    }}>{sc.weight}</span>
                    <span style={{
                      padding: "2px 8px", borderRadius: 10,
                      fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
                      color: "#9088A8", background: "rgba(192,172,222,0.10)",
                    }}>{sc.timeScope}</span>
                  </div>
                </div>
              </div>
            </PressCard>
          ))}
        </div>

        {/* What's missing */}
        <div style={{
          padding: "14px 16px", borderRadius: 16,
          background: "rgba(255,255,255,0.52)", border: "1px solid rgba(192,172,222,0.18)",
          fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#8878A0", lineHeight: 1.68,
        }}>
          补充出生时辰后，紫微斗数的宫位结构与奇门遁甲的局格将作为独立证据纳入，届时可查看体系间的验证与分歧。
        </div>

        <div style={{ marginTop: 24 }}>
          <button onClick={onNext} style={{
            width: "100%", padding: "15px 24px", borderRadius: 18,
            background: "linear-gradient(135deg, #E8816A, #E9A87E)",
            border: "none", cursor: "pointer",
            fontSize: 15.5, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 500, color: "#fff",
            boxShadow: "0 4px 18px rgba(232,129,106,0.28)",
          }}>查看最终行动报告 →</button>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Step 7: Final report ─────────────────────────────────────────────────────
function ReportStep({ onBack, onViewHistory, question, saved, setSaved, scrollRef }: {
  onBack: () => void; onViewHistory: () => void;
  question: string; saved: boolean; setSaved: (v: boolean) => void;
  scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <PageShell scrollRef={scrollRef}>
      <div style={{ padding: "0 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <BackBtn onBack={onBack} />
          <div style={{ fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D" }}>
            行动报告
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginLeft: 44, marginBottom: 16 }}>
          高阶合参 · Version 1 · 仅含八字三柱
        </div>
        <div style={{ marginBottom: 20 }}><EvidenceScopeBadge /></div>

        {question.trim().length > 0 && (
          <>
            <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 6 }}>你的问题</div>
            <div style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", color: "#4A4168", marginBottom: 18, lineHeight: 1.55 }}>
              {question}
            </div>
          </>
        )}

        {/* Hero conclusion */}
        <PressCard style={{
          padding: "20px 20px 18px",
          background: "linear-gradient(145deg, rgba(255,255,255,0.88), rgba(238,233,248,0.80))",
          borderRadius: 24, marginBottom: 16,
        }}>
          <div style={{ fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 8, letterSpacing: "0.06em" }}>
            核心结论
          </div>
          <div style={{ fontSize: 18, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", lineHeight: 1.55, marginBottom: 12 }}>
            现在是积累期，不是爆发期。守住当前节奏，等秋季节点出现再做决定。
          </div>
          {/* Confidence — limited, honest */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{
              padding: "3px 10px", borderRadius: 12,
              fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#A08030", background: "rgba(233,201,126,0.14)",
              border: "1px solid rgba(233,201,126,0.32)",
            }}>置信等级：有限</span>
            <span style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#B0A4C6", lineHeight: 1.45 }}>
              仅含八字三柱，补充时辰后可提升
            </span>
          </div>
        </PressCard>

        {/* Action cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {[
            { id: "do",      color: "#6BBFA0", label: "现在适合", items: ["在熟悉的关系里主动表达", "梳理你真正想推进的事项清单", "保持现有工作节奏，不大幅调整"] },
            { id: "less",    color: "#E8816A", label: "暂时少做", items: ["主动签约或做不可逆的承诺", "在新关系里快速建立深度信任", "把外部反馈当做自己状态的唯一标准"] },
            { id: "confirm", color: "#7BBDE0", label: "继续确认", items: ["自己对「换工作」的真实驱动是什么", "这个方向是理性判断还是当前压力驱动"] },
          ].map(card => (
            <div key={card.id} style={{
              borderRadius: 18, padding: "14px 16px",
              background: `${card.color}08`, border: `1px solid ${card.color}22`,
            }}>
              <div style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: card.color, fontWeight: 500, marginBottom: 10 }}>
                {card.label}
              </div>
              {card.items.map((item, ii) => (
                <div key={`${card.id}-${ii}`} style={{ display: "flex", gap: 8, alignItems: "flex-start", marginBottom: ii < card.items.length - 1 ? 7 : 0 }}>
                  <div style={{ width: 4, height: 4, borderRadius: "50%", background: card.color, marginTop: 7, flexShrink: 0 }} />
                  <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.60 }}>{item}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#9088A8", marginBottom: 10 }}>
          观察时间轴
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {TIMELINE_ITEMS.map(tl => (
            <div key={tl.id} style={{
              borderRadius: 16, padding: "12px 16px",
              background: "rgba(255,255,255,0.58)", border: "1px solid rgba(255,255,255,0.85)",
              display: "flex", gap: 12,
            }}>
              <div style={{
                padding: "3px 10px", borderRadius: 12, flexShrink: 0, alignSelf: "flex-start",
                background: `${tl.color}14`, border: `1px solid ${tl.color}28`,
                fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: tl.color, fontWeight: 500,
              }}>{tl.period}</div>
              <div>
                {tl.items.map((item, ii) => (
                  <div key={`${tl.id}-${ii}`} style={{
                    fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#5A5076",
                    lineHeight: 1.65, marginBottom: ii < tl.items.length - 1 ? 3 : 0,
                  }}>{item}</div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: "12px 16px", borderRadius: 16,
          background: "rgba(255,255,255,0.45)", border: "1px solid rgba(192,172,222,0.18)",
          fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#8878A0", lineHeight: 1.65, marginBottom: 24,
        }}>
          以上内容来自传统文化结构化观察，不保证准确，不作为重大决策的依据。结论已标注资料边界，请保留自己的判断。
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <button onClick={() => setSaved(!saved)} style={{
            width: "100%", padding: "14px 24px", borderRadius: 18,
            background: saved ? "rgba(107,191,160,0.16)" : "linear-gradient(135deg, #6BBFA0, #7BBDE0)",
            border: saved ? "1.5px solid rgba(107,191,160,0.40)" : "none",
            cursor: "pointer",
            fontSize: 15, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 500, color: saved ? "#3D9E7E" : "#fff",
            boxShadow: saved ? "none" : "0 4px 18px rgba(107,191,160,0.30)",
            transition: "all 0.20s ease",
          }}>{saved ? "✓ 已保存报告" : "保存报告"}</button>
          <button onClick={onViewHistory} style={{
            width: "100%", padding: "13px 24px", borderRadius: 18,
            background: "rgba(255,255,255,0.68)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(192,172,222,0.28)",
            cursor: "pointer",
            fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 400, color: "#6B607E",
          }}>查看版本历史</button>
        </div>
      </div>
    </PageShell>
  );
}

// ─── Step 8: Version history ──────────────────────────────────────────────────
function HistoryStep({ onBack, scrollRef }: {
  onBack: () => void; scrollRef: React.RefObject<HTMLDivElement | null>;
}) {
  const [compareMode, setCompareMode] = useState(false);
  const [selectedVersions, setSelectedVersions] = useState<string[]>(["v1"]);

  function toggleVersion(id: string) {
    if (selectedVersions.includes(id)) {
      setSelectedVersions(v => v.filter(x => x !== id));
    } else if (selectedVersions.length < 2) {
      setSelectedVersions(v => [...v, id]);
    }
  }

  return (
    <PageShell scrollRef={scrollRef}>
      <div style={{ padding: "0 22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <BackBtn onBack={onBack} />
          <div style={{ fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D" }}>
            报告版本历史
          </div>
        </div>
        <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginLeft: 44, marginBottom: 20 }}>
          对照不同资料范围下的分析变化
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
          <button onClick={() => { setCompareMode(!compareMode); setSelectedVersions(["v1"]); }} style={{
            padding: "6px 14px", borderRadius: 20,
            background: compareMode ? "rgba(123,189,224,0.14)" : "rgba(255,255,255,0.68)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: compareMode ? "1.5px solid rgba(123,189,224,0.40)" : "1px solid rgba(255,255,255,0.88)",
            fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
            color: compareMode ? "#5A9EC8" : "#7B6E90", cursor: "pointer",
          }}>
            {compareMode ? "取消比较" : "比较两个版本"}
          </button>
        </div>

        {compareMode && (
          <div style={{
            padding: "10px 14px", borderRadius: 14,
            background: "rgba(123,189,224,0.08)", border: "1px solid rgba(123,189,224,0.20)",
            fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#5A9EC8", marginBottom: 14,
          }}>
            已选 {selectedVersions.length}/2 个版本。选择两个版本后可对比结论变化。
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {VERSION_HISTORY.map(v => {
            const isSelected = selectedVersions.includes(v.id);
            return (
              <div key={v.id} onClick={() => compareMode && toggleVersion(v.id)} style={{
                borderRadius: 20, overflow: "hidden", ...glass,
                border: v.isCurrent
                  ? "1.5px solid rgba(107,191,160,0.45)"
                  : compareMode && isSelected
                    ? "1.5px solid rgba(123,189,224,0.50)"
                    : "1px solid rgba(255,255,255,0.88)",
                boxShadow: v.isCurrent ? "0 4px 18px rgba(107,191,160,0.12)" : "0 3px 14px rgba(160,130,200,0.09)",
                cursor: compareMode ? "pointer" : "default",
                transition: "all 0.18s ease",
              }}>
                <div style={{ padding: "16px 18px" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 10 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 15, fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: "#28253D" }}>
                          {v.version}
                        </span>
                        {v.isCurrent && (
                          <span style={{
                            padding: "2px 8px", borderRadius: 10,
                            fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
                            color: "#6BBFA0", background: "rgba(107,191,160,0.12)",
                            border: "1px solid rgba(107,191,160,0.25)",
                          }}>当前</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#B0A4C6" }}>
                        {v.date} · {v.ruleVersion}
                      </div>
                    </div>
                    {compareMode && (
                      <div style={{
                        width: 22, height: 22, borderRadius: "50%",
                        border: isSelected ? "2px solid #7BBDE0" : "2px solid rgba(192,172,222,0.35)",
                        background: isSelected ? "#7BBDE0" : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />}
                      </div>
                    )}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {[
                      { label: "资料变化", value: v.dataChanges },
                      { label: "结论变化", value: v.conclusionChange },
                      { label: "更新原因", value: v.reason },
                    ].map(row => (
                      <div key={row.label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#B0A4C6", flexShrink: 0, marginTop: 1, minWidth: 44 }}>
                          {row.label}
                        </span>
                        <span style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.55 }}>
                          {row.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{
          marginTop: 20, padding: "12px 16px", borderRadius: 16,
          background: "rgba(255,255,255,0.45)", border: "1px solid rgba(192,172,222,0.16)",
          fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#8878A0", lineHeight: 1.65,
        }}>
          每个版本独立保存，不会被新版本覆盖。你可以随时回来查看更早的解读，了解结论是怎么演变的。
        </div>
      </div>
    </PageShell>
  );
}

// ─── Main orchestrator ─────────────────────────────────────────────────────────
interface CombinedInsightProps {
  onBack: () => void;
}

export default function CombinedInsightScreen({ onBack }: CombinedInsightProps) {
  const [step, setStep] = useState<InsightStep>("question");
  const [question, setQuestion] = useState("");
  const [depth, setDepth] = useState<DepthLevel>("standard");
  const [progressIdx, setProgressIdx] = useState(0);
  const [expandedEvId, setExpandedEvId] = useState<string | null>(null);
  const [evidenceTab, setEvidenceTab] = useState<EvidenceTab>("all");
  const [reportSaved, setReportSaved] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [step]);

  // Auto-advance progress; skipped steps advance in 200ms, real steps in 1400ms
  const steps = getDepthSteps(depth);
  const totalProgSteps = steps.length;
  const currentProgStep = steps[progressIdx];

  useEffect(() => {
    if (step !== "progress" || progressIdx >= totalProgSteps) return;
    const delay = currentProgStep?.skipped ? 200 : 1400;
    const timer = setTimeout(() => setProgressIdx(i => i + 1), delay);
    return () => clearTimeout(timer);
  }, [step, progressIdx, totalProgSteps, currentProgStep]);

  function startProgress() {
    setProgressIdx(0);
    setStep("progress");
  }

  const stepBack: Record<InsightStep, () => void> = {
    question:  onBack,
    depth:     () => setStep("question"),
    confirm:   () => setStep("depth"),
    progress:  () => setStep("confirm"),
    evidence:  () => setStep("progress"),
    consensus: () => setStep("evidence"),
    report:    () => setStep("consensus"),
    history:   () => setStep("report"),
  };

  return (
    <>
      {step === "question"  && <QuestionStep onBack={stepBack.question} question={question} setQuestion={setQuestion} onNext={() => setStep("depth")} scrollRef={scrollRef} />}
      {step === "depth"     && <DepthStep onBack={stepBack.depth} depth={depth} setDepth={setDepth} onNext={() => setStep("confirm")} scrollRef={scrollRef} />}
      {step === "confirm"   && <ConfirmStep onBack={stepBack.confirm} question={question} depth={depth} onNext={startProgress} scrollRef={scrollRef} />}
      {step === "progress"  && <ProgressStep onNext={() => setStep("evidence")} depth={depth} progressIdx={progressIdx} scrollRef={scrollRef} />}
      {step === "evidence"  && <EvidenceStep onBack={stepBack.evidence} onNext={() => setStep("consensus")} expandedId={expandedEvId} setExpandedId={setExpandedEvId} evidenceTab={evidenceTab} setEvidenceTab={setEvidenceTab} scrollRef={scrollRef} />}
      {step === "consensus" && <ConsensusStep onBack={stepBack.consensus} onNext={() => setStep("report")} scrollRef={scrollRef} />}
      {step === "report"    && <ReportStep onBack={stepBack.report} onViewHistory={() => setStep("history")} question={question} saved={reportSaved} setSaved={setReportSaved} scrollRef={scrollRef} />}
      {step === "history"   && <HistoryStep onBack={stepBack.history} scrollRef={scrollRef} />}
    </>
  );
}
