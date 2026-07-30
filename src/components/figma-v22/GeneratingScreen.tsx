import { useState, useEffect } from "react";

// ── Precision instrument SVG ──────────────────────────────────────────────────
function PrecisionInstrument({ stage }: { stage: number }) {
  const CX = 110, CY = 110;
  const R = [88, 68, 50, 34, 18];
  // Ring colors per stage
  const activeRing = stage; // 0=outer, 1=mid-outer, 2=mid
  const ringColors = R.map((_, i) => {
    if (i === activeRing) return "#E8816A";
    if (i < activeRing)   return "#6BBFA0";
    return "rgba(192,172,222,0.28)";
  });

  const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];

  return (
    <svg width={220} height={220} viewBox="0 0 220 220" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="gi-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(192,172,222,0.22)" />
          <stop offset="100%" stopColor="rgba(192,172,222,0)" />
        </radialGradient>
        <radialGradient id="gi-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <stop offset="100%" stopColor="#F4F0FF" stopOpacity="0.75" />
        </radialGradient>
      </defs>

      {/* Ambient fill */}
      <circle cx={CX} cy={CY} r={R[0] + 20} fill="url(#gi-glow)" />

      {/* Concentric rings */}
      {R.map((r, i) => (
        <circle key={i} cx={CX} cy={CY} r={r}
          fill="none"
          stroke={ringColors[i]}
          strokeWidth={i === activeRing ? 1.8 : 1}
          strokeDasharray={i % 2 === 1 ? "5 4" : undefined}
          opacity={i === activeRing ? 1 : 0.70}
        />
      ))}

      {/* 12-branch markers on outermost ring */}
      {branches.map((b, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const dotR = R[0] - 5;
        const isCard = [0, 3, 6, 9].includes(i);
        return (
          <g key={b}>
            <circle
              cx={CX + dotR * Math.cos(a)} cy={CY + dotR * Math.sin(a)}
              r={isCard ? 3 : 1.8}
              fill={isCard && stage >= 0 ? "#E8816A" : "rgba(192,172,222,0.50)"} />
            {isCard && (
              <text
                x={CX + (R[0] + 12) * Math.cos(a)} y={CY + (R[0] + 12) * Math.sin(a)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={9.5} fontFamily="'Noto Serif SC', serif"
                fill="rgba(107,96,136,0.55)">{b}</text>
            )}
          </g>
        );
      })}

      {/* Spoke cross on inner rings */}
      {[0, 45, 90, 135].map(deg => {
        const a = deg * Math.PI / 180;
        return (
          <line key={deg}
            x1={CX + R[2] * Math.cos(a)} y1={CY + R[2] * Math.sin(a)}
            x2={CX - R[2] * Math.cos(a)} y2={CY - R[2] * Math.sin(a)}
            stroke="rgba(233,201,126,0.28)" strokeWidth={0.8} />
        );
      })}

      {/* Center disc */}
      <circle cx={CX} cy={CY} r={R[4]}
        fill="url(#gi-center)"
        stroke={stage >= 2 ? "#E8816A" : "rgba(233,201,126,0.45)"}
        strokeWidth={1.4} />

      {/* Stage-keyed center mark */}
      {stage < 2 ? (
        <circle cx={CX} cy={CY} r={4}
          fill={stage === 0 ? "rgba(107,191,160,0.55)" : "#E9C97E"} />
      ) : (
        <text x={CX} y={CY + 1}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={14} fontFamily="'Noto Serif SC', serif" fontWeight={700}
          fill="rgba(40,37,61,0.72)">✓</text>
      )}
    </svg>
  );
}

// ── Stages ────────────────────────────────────────────────────────────────────
const STAGES = [
  { zh: "正在整理出生时间", sub: "校正历法与太阳时偏差" },
  { zh: "正在建立结构关系", sub: "提取天干地支与宫位格局" },
  { zh: "正在转换成容易理解的内容", sub: "生成行为观察与生活节律分析" },
];

// ── GeneratingScreen ──────────────────────────────────────────────────────────
interface GeneratingProps {
  profileName: string;
  onComplete: () => void;
}

export default function GeneratingScreen({ profileName, onComplete }: GeneratingProps) {
  const [stage, setStage] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1400);
    const t2 = setTimeout(() => setStage(2), 2800);
    const t3 = setTimeout(() => setDone(true), 4200);
    const t4 = setTimeout(() => onComplete(), 4800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [onComplete]);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 50%, #FDF4F1 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Noto Sans SC', sans-serif",
      padding: "0 32px",
      textAlign: "center",
    }}>
      {/* Profile greeting */}
      <div style={{
        fontSize: 13, color: "#9088A8", marginBottom: 32, letterSpacing: "0.04em",
      }}>
        正在为 <span style={{ color: "#5A5272", fontWeight: 500 }}>{profileName}</span> 建立档案
      </div>

      {/* Instrument */}
      <div style={{ marginBottom: 36 }}>
        <PrecisionInstrument stage={done ? 3 : stage} />
      </div>

      {/* Stage indicator */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>
        {STAGES.map((s, i) => {
          const isActive = i === stage && !done;
          const isPast   = i < stage || done;
          return (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 14,
              padding: "14px 18px",
              borderRadius: 18,
              background: isActive
                ? "rgba(255,255,255,0.80)"
                : isPast
                  ? "rgba(208,234,224,0.35)"
                  : "rgba(255,255,255,0.42)",
              border: isActive
                ? "1.5px solid rgba(232,129,106,0.30)"
                : isPast
                  ? "1px solid rgba(107,191,160,0.25)"
                  : "1px solid rgba(192,172,222,0.18)",
              backdropFilter: isActive ? "blur(16px)" : "none",
              WebkitBackdropFilter: isActive ? "blur(16px)" : "none",
              transition: "all 0.35s",
              opacity: i > stage && !done ? 0.45 : 1,
            }}>
              {/* State dot */}
              <div style={{
                width: 10, height: 10, borderRadius: "50%", flexShrink: 0,
                background: isPast
                  ? "#6BBFA0"
                  : isActive
                    ? "#E8816A"
                    : "rgba(192,172,222,0.35)",
                boxShadow: isActive ? "0 0 0 4px rgba(232,129,106,0.18)" : "none",
                transition: "all 0.3s",
              }} />
              <div style={{ textAlign: "left" }}>
                <div style={{
                  fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
                  color: isPast ? "#3E6E5A" : isActive ? "#28253D" : "#9088A8",
                  fontWeight: isActive ? 500 : 400,
                }}>{s.zh}</div>
                {isActive && (
                  <div style={{ fontSize: 11.5, color: "#A08878", marginTop: 2 }}>{s.sub}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom note */}
      <div style={{ marginTop: 32, fontSize: 11.5, color: "#B0A8C8", lineHeight: 1.6 }}>
        数据仅在设备本地处理
      </div>
    </div>
  );
}
