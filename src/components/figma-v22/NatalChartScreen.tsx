import { useState } from "react";
import type { Question } from "./QuestionInsightSheet";
import type { FigmaNatalPlanet, FigmaNatalViewModel } from "./viewModels";
import EditorialStorySections from "./EditorialStorySections";

// ─── Helpers ──────────────────────────────────────────────────────────────────
function polar(cx: number, cy: number, r: number, deg: number) {
  const rad = (deg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function fix(n: number) { return n.toFixed(2); }

// Counterclockwise sector path (decreasing angle), sweep=0 outer, sweep=1 inner
function sectorPath(cx: number, cy: number, ri: number, ro: number, a1: number, a2: number) {
  let arcSize = a1 - a2;
  if (arcSize < 0) arcSize += 360;
  const large = arcSize > 180 ? 1 : 0;
  const so = polar(cx, cy, ro, a1);
  const eo = polar(cx, cy, ro, a2);
  const si = polar(cx, cy, ri, a1);
  const ei = polar(cx, cy, ri, a2);
  return [
    `M ${fix(so.x)} ${fix(so.y)}`,
    `A ${ro} ${ro} 0 ${large} 0 ${fix(eo.x)} ${fix(eo.y)}`,
    `L ${fix(ei.x)} ${fix(ei.y)}`,
    `A ${ri} ${ri} 0 ${large} 1 ${fix(si.x)} ${fix(si.y)}`,
    `Z`,
  ].join(" ");
}

// ─── NatalChartWheel ──────────────────────────────────────────────────────────
export function NatalChartWheel({ planets, aspects }: { planets: FigmaNatalPlanet[]; aspects: FigmaNatalViewModel["aspects"] }) {
  const W = 340, H = 290;
  const cx = 170, cy = 147;

  // Radii
  const RO = 130;  // outer ring
  const RB = 108;  // house-band outer
  const RH = 86;   // house-band inner / planet region outer
  const RP = 73;   // planet center
  const RI = 53;   // inner circle
  const RC = 20;   // center

  // House cusp angles: H1 at 180° (left/ASC), decreasing by 30° per house
  const houseCusp = (n: number) => ((180 - (n - 1) * 30) + 360) % 360;
  const HC = Array.from({ length: 12 }, (_, i) => houseCusp(i + 1));

  // Planet map
  const planetByKey = Object.fromEntries(planets.map(p => [p.key, { ...p, svgAngle: p.angle }]));

  // Aspect lines (from inner-circle edge to inner-circle edge)
  const aspectLines = aspects.map(a => {
    const p1 = planetByKey[a.point1];
    const p2 = planetByKey[a.point2];
    const from = polar(cx, cy, RI, p1.svgAngle);
    const to   = polar(cx, cy, RI, p2.svgAngle);
    return { ...a, color: "rgba(123,189,224,0.42)", from, to };
  });

  // Alternating house sector colors
  const HOUSE_FILLS = [
    "rgba(123,189,224,0.07)", "rgba(238,233,248,0.08)",
    "rgba(123,189,224,0.05)", "rgba(238,233,248,0.06)",
    "rgba(123,189,224,0.07)", "rgba(238,233,248,0.08)",
    "rgba(123,189,224,0.05)", "rgba(238,233,248,0.06)",
    "rgba(123,189,224,0.07)", "rgba(238,233,248,0.08)",
    "rgba(123,189,224,0.05)", "rgba(238,233,248,0.06)",
  ];

  const HOUSE_LABELS = ["Ⅰ","Ⅱ","Ⅲ","Ⅳ","Ⅴ","Ⅵ","Ⅶ","Ⅷ","Ⅸ","Ⅹ","Ⅺ","Ⅻ"];

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="nc-bg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#F8FCFF" />
          <stop offset="100%" stopColor="#EEF6FF" />
        </radialGradient>
        <radialGradient id="nc-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F4F0FF" />
        </radialGradient>
        <filter id="nc-glow">
          <feGaussianBlur stdDeviation="2" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="nc-soft">
          <feGaussianBlur stdDeviation="1" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Outer background */}
      <circle cx={cx} cy={cy} r={RO}
        fill="url(#nc-bg)"
        stroke="rgba(123,189,224,0.30)" strokeWidth={1.5} />

      {/* House sectors */}
      {HC.map((a1, i) => {
        const a2 = HC[(i + 1) % 12];
        return (
          <path key={i}
            d={sectorPath(cx, cy, RI, RO, a1, a2)}
            fill={HOUSE_FILLS[i]} />
        );
      })}

      {/* Band circle (outer) */}
      <circle cx={cx} cy={cy} r={RB}
        fill="none" stroke="rgba(123,189,224,0.18)" strokeWidth={0.8} />

      {/* Band circle (inner) */}
      <circle cx={cx} cy={cy} r={RH}
        fill="none" stroke="rgba(123,189,224,0.18)" strokeWidth={0.8} />

      {/* House division lines */}
      {HC.map((angle, i) => {
        const inner = polar(cx, cy, RI, angle);
        const outer = polar(cx, cy, RO, angle);
        const isCardinal = i % 3 === 0;
        return (
          <line key={i}
            x1={fix(inner.x)} y1={fix(inner.y)}
            x2={fix(outer.x)} y2={fix(outer.y)}
            stroke={isCardinal ? "rgba(123,189,224,0.55)" : "rgba(123,189,224,0.20)"}
            strokeWidth={isCardinal ? 1.4 : 0.7} />
        );
      })}

      {/* Cardinal axis labels: ASC / DC / IC / MC */}
      {[
        { label: "ASC", angle: 180, color: "#E8816A" },
        { label: "IC",  angle: 90,  color: "#7BBDE0" },
        { label: "DC",  angle: 0,   color: "#E8816A" },
        { label: "MC",  angle: 270, color: "#E9C97E" },
      ].map(({ label, angle, color }) => {
        const pos = polar(cx, cy, RO + 13, angle);
        return (
          <text key={label}
            x={fix(pos.x)} y={fix(pos.y + 0.5)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={8.5} fontFamily="'Noto Sans SC', sans-serif"
            fontWeight="600" fill={color}>
            {label}
          </text>
        );
      })}

      {/* House number labels in the outer band */}
      {HC.map((angle, i) => {
        const midAngle = angle - 15;
        const lPos = polar(cx, cy, (RB + RO) / 2 + 1, midAngle);
        return (
          <text key={i}
            x={fix(lPos.x)} y={fix(lPos.y + 0.5)}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={7.5}
            fontFamily="Georgia, serif"
            fill="rgba(100,140,180,0.60)">
            {HOUSE_LABELS[i]}
          </text>
        );
      })}

      {/* Aspect lines */}
      {aspectLines.map(({ from, to, color }, i) => (
        <line key={i}
          x1={fix(from.x)} y1={fix(from.y)}
          x2={fix(to.x)}   y2={fix(to.y)}
          stroke={color} strokeWidth={1.2}
          strokeDasharray="5 3" />
      ))}

      {/* Inner circle */}
      <circle cx={cx} cy={cy} r={RI}
        fill="rgba(255,255,255,0.60)"
        stroke="rgba(123,189,224,0.25)" strokeWidth={1} />

      {/* Planet markers */}
      {planets.map(({ label, angle: svgAngle, color }) => {
        const pos = polar(cx, cy, RP, svgAngle);
        return (
          <g key={label} filter="url(#nc-soft)">
            <circle
              cx={fix(pos.x)} cy={fix(pos.y)} r={12.5}
              fill={color + "20"} stroke={color} strokeWidth={1.6} />
            <text
              x={fix(pos.x)} y={fix(+pos.y + 0.5)}
              textAnchor="middle" dominantBaseline="middle"
              fontSize={10.5}
              fontFamily="'Noto Serif SC', serif"
              fontWeight="700" fill={color}>
              {label}
            </text>
          </g>
        );
      })}

      {/* Center circle */}
      <circle cx={cx} cy={cy} r={RC}
        fill="url(#nc-center)"
        stroke="rgba(233,201,126,0.55)" strokeWidth={1.4} />

      {/* Center decoration: 4 rays + dot */}
      {[0, 45, 90, 135].map(a => {
        const p1 = polar(cx, cy, 9, a);
        const p2 = polar(cx, cy, 9, a + 180);
        return (
          <line key={a}
            x1={fix(p1.x)} y1={fix(p1.y)}
            x2={fix(p2.x)} y2={fix(p2.y)}
            stroke="rgba(233,201,126,0.55)" strokeWidth={0.8} />
        );
      })}
      <circle cx={cx} cy={cy} r={3.5}
        fill="#E9C97E" opacity={0.70} />
    </svg>
  );
}

// ─── Glass card wrapper ────────────────────────────────────────────────────────
export function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      borderRadius: 22,
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(22px) saturate(180%)",
      WebkitBackdropFilter: "blur(22px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.88)",
      boxShadow: "0 4px 22px rgba(100,150,200,0.10)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Segmented control ────────────────────────────────────────────────────────
export function Segment({ tabs, active, onChange }: {
  tabs: string[];
  active: number;
  onChange: (i: number) => void;
}) {
  return (
    <div role="tablist" aria-label="星盘报告视图" style={{
      display: "flex", gap: 4,
      padding: "4px",
      borderRadius: 16,
      background: "rgba(220,235,248,0.55)",
      border: "1px solid rgba(123,189,224,0.22)",
    }}>
      {tabs.map((tab, i) => (
        <button type="button" role="tab" aria-selected={active === i} key={tab} onClick={() => onChange(i)} style={{
          flex: 1, minHeight: 44, padding: "7px 4px",
          borderRadius: 12,
          border: "none",
          background: active === i
            ? "rgba(255,255,255,0.92)"
            : "transparent",
          boxShadow: active === i ? "0 2px 8px rgba(100,160,220,0.16)" : "none",
          fontSize: 12,
          fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: active === i ? 500 : 400,
          color: active === i ? "#28253D" : "#6B8BA8",
          cursor: "pointer",
          transition: "all 0.18s ease",
        }}>
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Core planet card ─────────────────────────────────────────────────────────
function CoreCard({ planet, role, body, accent }: {
  planet: string; role: string; body: string; accent: string;
}) {
  return (
    <div style={{
      padding: "16px 15px",
      borderRadius: 18,
      background: `linear-gradient(140deg, ${accent}14, rgba(255,255,255,0.85))`,
      border: `1.5px solid ${accent}30`,
      flex: 1,
    }}>
      <div style={{ fontSize: 9.5, color: accent, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 4, letterSpacing: "0.06em" }}>
        {role}
      </div>
      <div style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", marginBottom: 8 }}>
        {planet}
      </div>
      <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.62 }}>
        {body}
      </div>
    </div>
  );
}

// ─── Energy dimension bar ─────────────────────────────────────────────────────
function DimBar({ label, value, color, delay }: { label: string; value: number; color: string; delay: number }) {
  const [filled, setFilled] = useState(false);
  return (
    <div
      style={{ display: "flex", alignItems: "center", gap: 12 }}
      ref={el => {
        if (el && !filled) {
          setTimeout(() => setFilled(true), delay);
        }
      }}>
      <div style={{ width: 36, fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#5A5272", flexShrink: 0 }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 6, borderRadius: 3, background: "rgba(180,210,230,0.25)", overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 3,
          background: `linear-gradient(90deg, ${color}, ${color}CC)`,
          width: filled ? `${value}%` : "0%",
          transition: "width 0.75s cubic-bezier(0.34,1.56,0.64,1)",
        }} />
      </div>
      <div style={{ width: 28, fontSize: 11.5, color: color, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, textAlign: "right" }}>
        {value}
      </div>
    </div>
  );
}

// ─── Layer card ───────────────────────────────────────────────────────────────
function LayerCard({ label, labelColor, body }: { label: string; labelColor: string; body: string }) {
  return (
    <div style={{
      padding: "13px 15px",
      borderRadius: 16,
      background: "rgba(255,255,255,0.60)",
      border: "1px solid rgba(180,210,230,0.30)",
    }}>
      <div style={{ fontSize: 11, color: labelColor, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 7, letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.70 }}>
        {body}
      </div>
    </div>
  );
}

// ─── Collapsible section ──────────────────────────────────────────────────────
function CollapseSection({ title, children }: { title: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 18, overflow: "hidden",
      border: "1px solid rgba(180,210,230,0.30)",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "14px 18px",
          background: "rgba(255,255,255,0.55)",
          border: "none", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
        <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#5A5272", fontWeight: 500 }}>
          {title}
        </span>
        <span style={{
          fontSize: 11, color: "#7BBDE0",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.22s ease", display: "inline-block",
        }}>▼</span>
      </button>
      {open && (
        <div style={{ padding: "2px 18px 16px", background: "rgba(255,255,255,0.40)" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── 总览 Tab ─────────────────────────────────────────────────────────────────
function OverviewTab({ onOpenSheet, onSharePoster, viewModel }: {
  onOpenSheet: (q: Question[], i: number) => void;
  onSharePoster?: () => void;
  viewModel: FigmaNatalViewModel;
}) {
  const core = viewModel.core;
  const firstImpression = viewModel.traits[0];
  const layers = viewModel.traits.slice(0, 3);
  return (
    <>
      {/* Synthesis */}
      <Card style={{ padding: "20px 20px 18px", marginBottom: 14,
        background: "linear-gradient(145deg, rgba(123,189,224,0.12), rgba(255,255,255,0.78))" }}>
        <div style={{ fontSize: 10, color: "#7BBDE0", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 10, letterSpacing: "0.08em" }}>
          熟悉以后才会发现
        </div>
        <div style={{ fontSize: 17, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", lineHeight: 1.55 }}>
          {viewModel.identityTitle}<br />
          <span style={{ color: "#5A7FA0" }}>{viewModel.identitySummary}</span>
        </div>
      </Card>

      {/* Natal chart wheel */}
      <Card style={{ padding: "16px 8px 10px", marginBottom: 14, display: "flex", justifyContent: "center", overflow: "hidden" }}>
        <NatalChartWheel planets={viewModel.planets} aspects={viewModel.aspects} />
      </Card>

      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 14 }}>
        <EditorialStorySections story={viewModel.story} tone="zodiac" />
      </div>

      {/* Three core cards */}
      <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
        <CoreCard
          planet={core[0]?.title || "太阳配置"}
          role="外在驱动力"
          accent="#E8816A"
          body={core[0]?.note || "太阳描述你主动追求的方向。"}
        />
        <CoreCard
          planet={core[1]?.title || "月亮待确认"}
          role="情绪需要"
          accent="#7BBDE0"
          body={core[1]?.note || "补充准确出生时辰后，才能确认月亮配置。"}
        />
      </div>
      <Card style={{ padding: "15px 16px", marginBottom: 14,
        background: "linear-gradient(140deg, rgba(192,172,222,0.10), rgba(255,255,255,0.82))" }}>
        <div style={{ fontSize: 9.5, color: "#C0ACDE", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 4, letterSpacing: "0.06em" }}>
          给人的第一印象
        </div>
        <div style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", marginBottom: 7 }}>
          {core[2]?.title || "上升待补充"}
        </div>
        <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.62 }}>
          {firstImpression?.note || "出生时间与地点完整后，才能确认别人最先感受到的外在印象。"}
        </div>
      </Card>

      {/* 最值得关注的配置 */}
      <Card style={{ padding: "18px 18px 16px", marginBottom: 14,
        background: "linear-gradient(140deg, rgba(233,201,126,0.12), rgba(255,255,255,0.80))" }}>
        <div style={{ fontSize: 10, color: "#D4A054", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 10, letterSpacing: "0.05em" }}>
          最值得关注的配置
        </div>
        <div style={{ fontSize: 14.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", marginBottom: 10 }}>
          {viewModel.highlight.statistic}
        </div>
        <div style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.70 }}>
          {viewModel.highlight.note}
        </div>
      </Card>

      {/* Four energy dimensions */}
      <Card style={{ padding: "18px 18px 18px", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", marginBottom: 16 }}>
          四种性格倾向
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {viewModel.peaks.map((peak, index) => (
            <DimBar key={peak.name} label={peak.name} value={peak.value} color={peak.color} delay={(index + 1) * 100} />
          ))}
        </div>
      </Card>

      {/* Three layers */}
      <Card style={{ padding: "18px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", marginBottom: 13 }}>
          三个维度的你
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {layers.map((trait, index) => (
            <LayerCard key={trait.title} label={trait.title} labelColor={["#7BBDE0", "#E8816A", "#E9C97E"][index]} body={`${trait.value}。${trait.note}`} />
          ))}
        </div>
      </Card>

      {/* Question prompts */}
      <Card style={{ padding: "18px 16px", marginBottom: 14 }}>
        <div style={{ fontSize: 12, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", marginBottom: 13 }}>
          值得问自己的问题
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {viewModel.questions.slice(0, 3).map((q, i) => (
            <button key={q.id} onClick={() => onOpenSheet(viewModel.questions, i)} style={{
              width: "100%", textAlign: "left",
              padding: "13px 15px",
              borderRadius: 14,
              background: ["rgba(123,189,224,0.09)","rgba(232,129,106,0.08)","rgba(107,191,160,0.09)"][i],
              border: `1px solid ${["rgba(123,189,224,0.25)","rgba(232,129,106,0.22)","rgba(107,191,160,0.25)"][i]}`,
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 11,
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                background: ["rgba(123,189,224,0.22)","rgba(232,129,106,0.18)","rgba(107,191,160,0.20)"][i],
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9.5, color: ["#7BBDE0","#E8816A","#6BBFA0"][i],
                fontWeight: 600, fontFamily: "'Noto Sans SC', sans-serif",
              }}>{i + 1}</div>
              <span style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#28253D", lineHeight: 1.55 }}>
                {q.title}
              </span>
            </button>
          ))}
        </div>
      </Card>

      {/* Collapsed professional data */}
      <CollapseSection title="专业星盘数据">
        <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12 }}>
          {viewModel.planets.map((planet) => ({
            label: planet.name,
            value: `${planet.sign} ${planet.degree}${planet.house ? ` · 第 ${planet.house} 宫` : ""}`,
          })).map(row => (
            <div key={row.label} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "8px 4px",
              borderBottom: "1px solid rgba(180,210,230,0.20)",
            }}>
              <span style={{ fontSize: 12, color: "#8090A8", fontFamily: "'Noto Sans SC', sans-serif" }}>{row.label}</span>
              <span style={{ fontSize: 12, color: "#28253D", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500 }}>{row.value}</span>
            </div>
          ))}
        </div>
      </CollapseSection>

      {/* Share entry */}
      {onSharePoster && (
        <button onClick={onSharePoster} style={{
          width: "100%", padding: "14px 20px", marginTop: 4,
          borderRadius: 18,
          background: "linear-gradient(135deg, rgba(123,189,224,0.20), rgba(255,255,255,0.85))",
          border: "1.5px solid rgba(123,189,224,0.35)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
        }}>
          <span style={{ fontSize: 15, color: "#7BBDE0" }}>⊙</span>
          <span style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D" }}>
            生成星盘分享卡
          </span>
        </button>
      )}
    </>
  );
}

// ─── 行星 Tab ─────────────────────────────────────────────────────────────────
function PlanetsTab({ planets }: { planets: FigmaNatalPlanet[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
      {planets.map((p) => (
        <Card key={p.key} style={{ padding: "16px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: p.color + "20",
              border: `1.5px solid ${p.color}55`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 14, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
              color: p.color,
            }}>{p.label}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: "#28253D" }}>
                {p.name} · {p.sign}
              </div>
              <div style={{ height: 5, borderRadius: 2.5, background: "rgba(180,210,230,0.25)", marginTop: 6, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${Math.max(12, Math.min(100, p.angle / 3.6))}%`, borderRadius: 2.5, background: `linear-gradient(90deg, ${p.color}, ${p.color}AA)` }} />
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.68 }}>
            {p.description} <span style={{ color: "#9088A8" }}>{p.degree}{p.house ? ` · 第 ${p.house} 宫` : ""}</span>
          </div>
        </Card>
      ))}
    </div>
  );
}

// ─── 宫位 Tab ─────────────────────────────────────────────────────────────────
function HousesTab({ houses, isPartial, warning }: { houses: FigmaNatalViewModel["houses"]; isPartial: boolean; warning: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#7BBDE0", marginBottom: 4, letterSpacing: "0.04em" }}>
        有行星入住的宫位
      </div>
      {houses.map(h => (
        <Card key={h.id} style={{ padding: "16px 16px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 9 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10, flexShrink: 0,
              background: "rgba(123,189,224,0.14)",
              border: "1.5px solid rgba(123,189,224,0.35)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, fontFamily: "Georgia, serif",
              color: "#7BBDE0",
            }}>H{h.id}</div>
            <div>
              <div style={{ fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: "#28253D" }}>
                第{["","一","二","三","四","五","六","七","八","九","十","十一","十二"][h.id]}宫 · {h.sign}
              </div>
              <div style={{ fontSize: 10.5, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif", marginTop: 2 }}>
                宫头 {h.degree}
              </div>
            </div>
          </div>
          <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.68 }}>
            这一宫描述对应生活领域的背景环境。具体表现还需要结合落入其中的星体、相位与现实经历一起理解。
          </div>
        </Card>
      ))}

      <Card style={{ padding: "14px 16px", marginTop: 2,
        background: "rgba(238,246,255,0.80)" }}>
        <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#6B8BA8", lineHeight: 1.70 }}>
          {isPartial ? warning || "资料不足时不生成上升与宫位，避免用默认时间替代。" : "宫位描述的是不同生活领域的背景环境，不是固定命运；仍需和星体、相位及现实经历一起理解。"}
        </div>
      </Card>
    </div>
  );
}

const aspectCopy: Record<string, { label: string; description: string }> = {
  conjunction: {
    label: "合相",
    description: "这两部分常会一起出现，感受和行动容易互相放大。用得顺时很集中，紧绷时也容易只看见一种答案。",
  },
  sextile: {
    label: "六合相",
    description: "这两部分容易互相提供机会，但通常需要你主动迈出一步，优势才会真正发挥出来。",
  },
  square: {
    label: "刑相",
    description: "这两部分容易互相拉扯。它不代表一定不好，而是在提醒你：遇到压力时，内心可能会同时出现两种不同需要。",
  },
  trine: {
    label: "拱相",
    description: "这两部分配合得比较自然，很多反应几乎不需要刻意练习。也因此，优势有时会被你当成理所当然。",
  },
  opposition: {
    label: "冲相",
    description: "这两部分像站在同一条线的两端。真正的课题不是选一边，而是学会在不同情境里找到平衡。",
  },
};

// ─── 相位 Tab ─────────────────────────────────────────────────────────────────
function AspectsTab({ aspects, planets }: { aspects: FigmaNatalViewModel["aspects"]; planets: FigmaNatalPlanet[] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#7BBDE0", marginBottom: 4, letterSpacing: "0.04em" }}>
        主要相位
      </div>
      {aspects.map((a, i) => {
        const p1 = planets.find(p => p.key === a.point1)!;
        const p2 = planets.find(p => p.key === a.point2)!;
        const copy = aspectCopy[a.type] || {
          label: "相位",
          description: "这两部分会互相影响。它提供的是一种观察线索，需要结合你的真实经历一起理解。",
        };
        return (
          <Card key={i} style={{ padding: "16px 16px 14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <div style={{
                  width: 28, height: 28, borderRadius: 9,
                  background: p1.color + "20", border: `1.5px solid ${p1.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: p1.color,
                }}>{p1.label}</div>
                <div style={{ fontSize: 10, color: "#B0A0C8" }}>—</div>
                <div style={{
                  width: 28, height: 28, borderRadius: 9,
                  background: p2.color + "20", border: `1.5px solid ${p2.color}55`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: p2.color,
                }}>{p2.label}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: "#28253D" }}>
                  {p1.name}与{p2.name} · {copy.label}
                </div>
                <div style={{ fontSize: 10.5, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif", marginTop: 2 }}>
                  容许度 {a.orb}
                </div>
              </div>
              <div style={{
                padding: "3px 10px", borderRadius: 10,
                background: "rgba(123,189,224,0.15)",
                border: "1px solid rgba(123,189,224,0.42)",
                fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#5A5272",
              }}>
                {copy.label}
              </div>
            </div>
            <div style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.68 }}>
              {copy.description}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ─── NatalChartScreen ─────────────────────────────────────────────────────────
interface NatalChartProps {
  onBack: () => void;
  onOpenSheet: (questions: Question[], index: number) => void;
  onSharePoster?: () => void;
  viewModel: FigmaNatalViewModel;
}

export default function NatalChartScreen({ onBack, onOpenSheet, onSharePoster, viewModel }: NatalChartProps) {
  const [tab, setTab] = useState(0);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #EBF5FF 0%, #F0F9F5 50%, #FDF4F1 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Noto Sans SC', sans-serif",
    }}>
      {/* ── Header ── */}
      <div style={{
        padding: "52px 20px 14px",
        background: "rgba(235,245,255,0.85)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(123,189,224,0.18)",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
          <button onClick={onBack} style={{
            width: 44, height: 44, borderRadius: "50%",
            background: "rgba(255,255,255,0.80)",
            backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
            border: "1px solid rgba(123,189,224,0.28)",
            cursor: "pointer", fontSize: 14, color: "#7BBDE0",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(100,160,220,0.12)",
          }}>←</button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 17, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", letterSpacing: "0.05em" }}>
              本命星盘
            </div>
          </div>
          {/* Profile chip */}
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "5px 12px 5px 8px",
            borderRadius: 20,
            background: "rgba(255,255,255,0.75)",
            border: "1px solid rgba(123,189,224,0.28)",
            boxShadow: "0 2px 8px rgba(100,160,220,0.10)",
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "linear-gradient(135deg, #C6E2F5, #7BBDE0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 11, color: "#FFF", fontWeight: 600,
            }}>{viewModel.profileInitial}</div>
            <span style={{ fontSize: 12, color: "#28253D", fontFamily: "'Noto Sans SC', sans-serif" }}>{viewModel.profileName}</span>
          </div>
        </div>

        {/* Segmented control */}
        <Segment
          tabs={["总览", "行星", "宫位", "相位"]}
          active={tab}
          onChange={setTab}
        />
      </div>

      {/* ── Scrollable content ── */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        padding: "16px 18px 100px",
        scrollbarWidth: "none",
      }}>
        {tab === 0 && <OverviewTab viewModel={viewModel} onOpenSheet={onOpenSheet} onSharePoster={onSharePoster} />}
        {tab === 1 && <PlanetsTab planets={viewModel.planets} />}
        {tab === 2 && <HousesTab houses={viewModel.houses} isPartial={viewModel.isPartial} warning={viewModel.warning} />}
        {tab === 3 && <AspectsTab aspects={viewModel.aspects} planets={viewModel.planets} />}
      </div>
    </div>
  );
}
