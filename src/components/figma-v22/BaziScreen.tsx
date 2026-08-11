import { useState } from "react";
import type { CSSProperties } from "react";
import type { Question } from "./QuestionInsightSheet";
import LiupanContent from "./LiupanContent";
import type { FigmaBaziViewModel, FigmaPillar } from "./viewModels";
import EditorialStorySections from "./EditorialStorySections";

const QUESTION_ACCENTS = ["#E8816A", "#6BBFA0", "#7BBDE0", "#C0ACDE"];

// ─── Shared glass card ────────────────────────────────────────────────────────
function Card({ children, style }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <div role="tablist" aria-label="生辰报告视图" style={{
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(22px) saturate(180%)",
      WebkitBackdropFilter: "blur(22px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.88)",
      borderRadius: 22,
      boxShadow: "0 5px 24px rgba(160,130,200,0.12), 0 1px 3px rgba(180,140,200,0.07)",
      ...style,
    }}>
      {children}
    </div>
  );
}

// ─── Segmented control ────────────────────────────────────────────────────────
function SegmentedControl({ tabs, active, onChange }: {
  tabs: string[]; active: number; onChange: (i: number) => void;
}) {
  return (
    <div style={{
      display: "flex", position: "relative",
      background: "rgba(238,233,248,0.70)",
      borderRadius: 14, padding: 3,
    }}>
      {/* Sliding indicator */}
      <div style={{
        position: "absolute",
        top: 3, bottom: 3,
        left: `calc(${active} * (100% - 6px) / ${tabs.length} + 3px)`,
        width: `calc((100% - 6px) / ${tabs.length})`,
        background: "rgba(255,255,255,0.92)",
        borderRadius: 11,
        boxShadow: "0 2px 8px rgba(160,130,200,0.16)",
        transition: "left 0.25s cubic-bezier(0.4,0,0.2,1)",
      }} />
      {tabs.map((t, i) => (
        <button type="button" role="tab" aria-selected={active === i} key={t} onClick={() => onChange(i)} style={{
          flex: 1, zIndex: 1, position: "relative",
          padding: "8px 0", border: "none", background: "transparent",
          fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: active === i ? 500 : 400,
          color: active === i ? "#28253D" : "#9088A8",
          cursor: "pointer", transition: "color 0.2s ease",
          letterSpacing: "0.03em",
        }}>{t}</button>
      ))}
    </div>
  );
}

// ─── Four-pillar strip ────────────────────────────────────────────────────────
const FALLBACK_PILLARS: FigmaPillar[] = [
  { label: "年柱", stem: "甲", branch: "辰", stemColor: "#6BBFA0", note: "早年" },
  { label: "月柱", stem: "壬", branch: "午", stemColor: "#7BBDE0", note: "环境" },
  { label: "日柱", stem: "癸", branch: "卯", stemColor: "#E8816A", note: "自己" },
  { label: "时柱", stem: "丙", branch: "子", stemColor: "#E9C97E", note: "后续" },
];

function FourPillars({ pillars = FALLBACK_PILLARS }: { pillars?: FigmaPillar[] }) {
  return (
    <div style={{ display: "flex", gap: 9 }}>
      {pillars.map((p, idx) => (
        <div key={p.label} style={{
          flex: 1,
          borderRadius: 16,
          overflow: "hidden",
          border: idx === 2 ? "1.5px solid rgba(232,129,106,0.45)" : "1px solid rgba(255,255,255,0.80)",
          boxShadow: idx === 2 ? "0 4px 16px rgba(232,129,106,0.18)" : "0 2px 10px rgba(160,130,200,0.09)",
          background: idx === 2
            ? "linear-gradient(170deg, rgba(245,196,184,0.30) 0%, rgba(255,255,255,0.80) 100%)"
            : "rgba(255,255,255,0.68)",
        }}>
          {/* Column label */}
          <div style={{
            padding: "5px 0 4px",
            background: idx === 2 ? "rgba(232,129,106,0.12)" : "rgba(238,233,248,0.55)",
            textAlign: "center",
            fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
            color: idx === 2 ? "#D06A56" : "#9088A8",
            letterSpacing: "0.05em",
          }}>{p.label}</div>
          {/* Stem */}
          <div style={{
            textAlign: "center", padding: "10px 0 4px",
            fontSize: 22, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
            color: p.stemColor, lineHeight: 1,
          }}>{p.stem}</div>
          {/* Branch */}
          <div style={{
            textAlign: "center", padding: "4px 0 8px",
            fontSize: 18, fontFamily: "'Noto Serif SC', serif", fontWeight: 400,
            color: "#4A4168", lineHeight: 1,
          }}>{p.branch}</div>
          {/* Note pill */}
          <div style={{
            textAlign: "center", paddingBottom: 8,
            fontSize: 9.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#A094B8",
          }}>{p.note}</div>
        </div>
      ))}
    </div>
  );
}

// ─── Five-elements radar (pure SVG, no recharts) ──────────────────────────────
const FALLBACK_ELEMENTS = [
  { label: "木", value: 65, color: "#6BBFA0" },
  { label: "火", value: 30, color: "#E8816A" },
  { label: "土", value: 25, color: "#D4A054" },
  { label: "金", value: 20, color: "#C0ACDE" },
  { label: "水", value: 55, color: "#7BBDE0" },
];

function FiveElementsViz({ elements = FALLBACK_ELEMENTS }: { elements?: Array<{ label: string; value: number; color: string }> }) {
  const normalizedElements = elements.map((item) => ({
    name: item.label,
    value: item.value,
    color: item.color,
    light: `${item.color}2E`,
  }));
  const W = 240, H = 200, cx = 120, cy = 98, R = 72;
  const n = 5;

  // angles: start at top (-90°), go clockwise
  const angle = (i: number) => (i / n) * Math.PI * 2 - Math.PI / 2;

  // polygon points for the filled area
  const polyPoints = normalizedElements.map((el, i) => {
    const r = (el.value / 100) * R;
    return [cx + r * Math.cos(angle(i)), cy + r * Math.sin(angle(i))] as [number, number];
  });

  // outer label positions
  const labelR = R + 20;
  const labelPos = normalizedElements.map((_, i) => ({
    x: cx + labelR * Math.cos(angle(i)),
    y: cy + labelR * Math.sin(angle(i)),
  }));

  return (
    <div>
      {/* SVG pentagon chart */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          {/* Background grid rings */}
          {[0.25, 0.5, 0.75, 1.0].map((frac, ri) => {
            const pts = Array.from({ length: n }).map((_, i) => {
              const r = frac * R;
              return `${cx + r * Math.cos(angle(i))},${cy + r * Math.sin(angle(i))}`;
            }).join(" ");
            return (
              <polygon key={ri} points={pts}
                fill="none" stroke="rgba(180,160,220,0.18)" strokeWidth={ri === 3 ? 1 : 0.7} />
            );
          })}

          {/* Axis spokes */}
          {normalizedElements.map((el, i) => (
            <line key={el.name}
              x1={cx} y1={cy}
              x2={cx + R * Math.cos(angle(i))} y2={cy + R * Math.sin(angle(i))}
              stroke={el.color} strokeWidth={0.8} strokeOpacity={0.35} />
          ))}

          {/* Filled polygon */}
          <polygon
            points={polyPoints.map(([x, y]) => `${x},${y}`).join(" ")}
            fill="rgba(107,191,160,0.14)"
            stroke="rgba(107,191,160,0.55)"
            strokeWidth={1.5}
            strokeLinejoin="round"
          />

          {/* Colored dots at each axis point */}
          {normalizedElements.map((el, i) => {
            const [px, py] = polyPoints[i];
            return (
              <circle key={el.name} cx={px} cy={py} r={4}
                fill={el.color} stroke="white" strokeWidth={1.5} />
            );
          })}

          {/* Element labels */}
          {normalizedElements.map((el, i) => {
            const { x, y } = labelPos[i];
            return (
              <g key={el.name}>
                <circle cx={x} cy={y} r={13} fill={el.light} stroke={el.color} strokeOpacity={0.4} strokeWidth={1} />
                <text x={x} y={y + 0.5}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={13} fontFamily="'Noto Serif SC', serif" fontWeight="700"
                  fill={el.color}>
                  {el.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Horizontal bar legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {normalizedElements.map(el => (
          <div key={el.name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{
              width: 20, fontSize: 12, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 700, color: el.color, textAlign: "center", flexShrink: 0,
            }}>{el.name}</div>
            <div style={{
              flex: 1, height: 6, borderRadius: 3,
              background: "rgba(180,160,220,0.15)",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%", borderRadius: 3,
                width: `${el.value}%`,
                background: `linear-gradient(90deg, ${el.color}CC, ${el.color}66)`,
                transition: "width 0.6s ease",
              }} />
            </div>
            <div style={{
              width: 28, fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
              color: el.color, fontWeight: 500, textAlign: "right", flexShrink: 0,
            }}>{el.value}%</div>
            <div style={{
              width: 36, fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#9088A8", flexShrink: 0,
            }}>
              {el.value >= 55 ? "偏旺" : el.value >= 35 ? "平衡" : "偏弱"}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Environment section ──────────────────────────────────────────────────────
function EnvironmentSection({ stable, drain }: { stable: string[]; drain: string[] }) {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {/* 稳定区 */}
      <div style={{
        flex: 1, borderRadius: 18, overflow: "hidden",
        border: "1px solid rgba(107,191,160,0.30)",
        background: "linear-gradient(170deg, rgba(107,191,160,0.10) 0%, rgba(255,255,255,0.75) 100%)",
      }}>
        <div style={{
          padding: "10px 14px 8px",
          background: "rgba(107,191,160,0.12)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{ fontSize: 14 }}>🌿</div>
          <span style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#3A7A62" }}>
            稳定区
          </span>
        </div>
        <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
          {stable.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#6BBFA0", marginTop: 5.5, flexShrink: 0,
              }} />
              <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.55 }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 消耗区 */}
      <div style={{
        flex: 1, borderRadius: 18, overflow: "hidden",
        border: "1px solid rgba(232,129,106,0.25)",
        background: "linear-gradient(170deg, rgba(232,129,106,0.08) 0%, rgba(255,255,255,0.75) 100%)",
      }}>
        <div style={{
          padding: "10px 14px 8px",
          background: "rgba(232,129,106,0.10)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{ fontSize: 14 }}>🌊</div>
          <span style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#A04A36" }}>
            消耗区
          </span>
        </div>
        <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
          {drain.map((s, i) => (
            <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#E8816A", marginTop: 5.5, flexShrink: 0,
              }} />
              <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.55 }}>
                {s}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Action card ──────────────────────────────────────────────────────────────
function ActionCard({ title, note }: { title: string; note: string }) {
  const [done, setDone] = useState(false);
  return (
    <div style={{
      borderRadius: 20,
      background: "linear-gradient(135deg, rgba(233,201,126,0.22) 0%, rgba(255,255,255,0.80) 100%)",
      border: "1px solid rgba(233,201,126,0.45)",
      padding: "18px 20px",
      boxShadow: "0 4px 20px rgba(212,160,84,0.12)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 9,
          background: "linear-gradient(135deg, #E9C97E, #D4A054)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 14, boxShadow: "0 2px 8px rgba(212,160,84,0.30)",
        }}>✦</div>
        <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#8A6820", letterSpacing: "0.05em" }}>
          今日可以怎么做
        </span>
      </div>
      <div style={{
        fontSize: 15.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
        color: "#28253D", lineHeight: 1.55, marginBottom: 10,
      }}>
        {title}
      </div>
      <div style={{
        fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
        color: "#4A4168", lineHeight: 1.65, marginBottom: 16,
      }}>
        {note}
      </div>
      <button
        onClick={() => setDone(!done)}
        style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "9px 16px", borderRadius: 12,
          border: done ? "1.5px solid rgba(107,191,160,0.55)" : "1.5px solid rgba(233,201,126,0.55)",
          background: done ? "rgba(107,191,160,0.14)" : "rgba(233,201,126,0.18)",
          cursor: "pointer", transition: "all 0.2s ease",
        }}>
        <div style={{
          width: 16, height: 16, borderRadius: "50%",
          border: done ? "2px solid #6BBFA0" : "2px solid #D4A054",
          background: done ? "#6BBFA0" : "transparent",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 9, color: "#fff", flexShrink: 0,
          transition: "all 0.2s ease",
        }}>{done ? "✓" : ""}</div>
        <span style={{
          fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: done ? "#3A7A62" : "#8A6820", fontWeight: 500,
        }}>
          {done ? "已记录，很好" : "我知道了，记下来"}
        </span>
      </button>
    </div>
  );
}

// ─── Collapsible 专业依据 ─────────────────────────────────────────────────────
function BasisSection({ items }: { items: Array<{ label: string; value: string }> }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      borderRadius: 18,
      border: "1px solid rgba(180,160,220,0.22)",
      background: "rgba(255,255,255,0.58)",
      overflow: "hidden",
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "14px 18px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "none", border: "none", cursor: "pointer",
        }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", letterSpacing: "0.06em" }}>
            专业依据
          </span>
          <div style={{
            padding: "2px 8px", borderRadius: 10,
            background: "rgba(238,233,248,0.80)",
            fontSize: 10, color: "#C0ACDE", fontFamily: "'Noto Sans SC', sans-serif",
          }}>命理格局</div>
        </div>
        <span style={{
          fontSize: 11, color: "#C0ACDE",
          transform: open ? "rotate(180deg)" : "rotate(0deg)",
          transition: "transform 0.25s ease",
          display: "inline-block",
        }}>▾</span>
      </button>

      {open && (
        <div style={{
          padding: "0 18px 16px",
          borderTop: "1px solid rgba(180,160,220,0.15)",
        }}>
          <div style={{
            marginTop: 12,
            fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#6B607E", lineHeight: 1.80,
          }}>
            {items.map((item, index) => (
              <p key={item.label} style={{ marginBottom: index === items.length - 1 ? 0 : 8 }}>
                <strong style={{ color: "#4A4168", fontWeight: 500 }}>{item.label}：</strong>
                {item.value}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BaziScreen ───────────────────────────────────────────────────────────────
export default function BaziScreen({
  onBack,
  onOpenSheet,
  onSharePoster,
  onShareFlowPoster,
  viewModel,
  initialTab = 0,
}: {
  onBack: () => void;
  onOpenSheet: (questions: Question[], index: number) => void;
  onSharePoster?: () => void;
  onShareFlowPoster?: () => void;
  viewModel: FigmaBaziViewModel;
  initialTab?: number;
}) {
  const [tab, setTab] = useState(initialTab);

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
        {/* Status bar */}
        <div style={{ height: 52 }} />

        {/* ── Header ── */}
        <div style={{ padding: "0 20px 14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
            <button onClick={onBack} style={{
              width: 36, height: 36, borderRadius: "50%",
              background: "rgba(255,255,255,0.70)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.90)",
              boxShadow: "0 2px 8px rgba(160,130,200,0.12)",
              cursor: "pointer", fontSize: 16, color: "#6B607E",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}>←</button>

            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", lineHeight: 1 }}>
                生辰报告
              </div>
              <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginTop: 3 }}>
                {viewModel.profileName} · {viewModel.headerMeta}
              </div>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "5px 12px 5px 7px", borderRadius: 20,
              background: "rgba(107,191,160,0.12)",
              border: "1px solid rgba(107,191,160,0.30)",
            }}>
              <div style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "linear-gradient(135deg, #6BBFA0CC, #6BBFA077)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, color: "#fff", fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
              }}>{viewModel.profileInitial}</div>
              <span style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#3A7A62", fontWeight: 500 }}>{viewModel.profileName}</span>
            </div>
          </div>

          {/* Segmented control */}
          <SegmentedControl
            tabs={["总览", "生辰", "流盘"]}
            active={tab}
            onChange={setTab}
          />
        </div>

        {/* ── 流盘 tab ── */}
        {tab === 2 && (
          <div style={{ padding: "0 18px 8px" }}>
            <LiupanContent flow={viewModel.flow} onOpenSheet={onOpenSheet} onSharePoster={onShareFlowPoster} />
          </div>
        )}

        {/* ── Body content (总览 / 生辰 tabs) ── */}
        {tab !== 2 && (
        <div style={{ padding: "0 18px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* 1. Human conclusion card */}
          <Card style={{
            padding: "20px 22px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.84) 0%, rgba(244,240,255,0.80) 100%)",
            borderRadius: 24,
          }}>
            <div style={{ fontSize: 10.5, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 12, letterSpacing: "0.07em" }}>
              关于你
            </div>
            <div style={{
              fontSize: 20, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
              color: "#28253D", lineHeight: 1.50, marginBottom: 12,
            }}>
              {viewModel.identityTitle}
            </div>
            <div style={{
              fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#4A4168", lineHeight: 1.70,
            }}>
              {viewModel.identitySummary}
            </div>
            {/* Divider + tags */}
            <div style={{
              marginTop: 16, paddingTop: 14,
              borderTop: "1px solid rgba(180,160,210,0.14)",
              display: "flex", gap: 8, flexWrap: "wrap",
            }}>
              {viewModel.tags.map(tag => (
                <div key={tag} style={{
                  padding: "3px 11px", borderRadius: 20,
                  background: "rgba(238,233,248,0.75)",
                  border: "1px solid rgba(192,172,222,0.28)",
                  fontSize: 11, color: "#7B6E94",
                  fontFamily: "'Noto Sans SC', sans-serif",
                }}>{tag}</div>
              ))}
            </div>
          </Card>

          {/* 2. Four pillars */}
          <Card style={{ padding: "18px 18px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <span style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#6B607E", letterSpacing: "0.05em" }}>
                四柱
              </span>
              <span style={{ fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#C0ACDE" }}>
                日柱为本我
              </span>
            </div>
            <FourPillars pillars={viewModel.pillars} />
          </Card>

          {/* 3. Five elements */}
          <Card style={{ padding: "18px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#6B607E", letterSpacing: "0.05em" }}>
                五行分布
              </span>
              <div style={{
                padding: "2px 9px", borderRadius: 10,
                background: "rgba(107,191,160,0.12)", border: "1px solid rgba(107,191,160,0.28)",
                fontSize: 10, color: "#3A7A62", fontFamily: "'Noto Sans SC', sans-serif",
              }}>{viewModel.strongestLabel}相对突出</div>
            </div>
            <FiveElementsViz elements={viewModel.elements} />
          </Card>

          {/* Figma-authored human reading: visible self, real needs, strength and reframe */}
          <EditorialStorySections story={viewModel.story} tone="bazi" showAction={false} />

          {/* 4. Environment */}
          <div>
            <div style={{ fontSize: 13, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", marginBottom: 10, paddingLeft: 2 }}>
              你在哪些环境里更容易发挥
            </div>
            <EnvironmentSection stable={viewModel.stableZone} drain={viewModel.drainZone} />
          </div>

          {/* 5. Action card */}
          <ActionCard title={viewModel.action.title} note={viewModel.action.note} />

          {/* 6. Question prompts */}
          <div>
            <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 10, paddingLeft: 2, letterSpacing: "0.04em" }}>
              可以问问自己
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {viewModel.questions.map((item, i) => (
                <button
                  key={item.id}
                  onClick={() => onOpenSheet(viewModel.questions, i)}
                  style={{
                    padding: "13px 16px", borderRadius: 15,
                    border: `1px solid ${QUESTION_ACCENTS[i % QUESTION_ACCENTS.length]}28`,
                    background: `${QUESTION_ACCENTS[i % QUESTION_ACCENTS.length]}0A`,
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
                    background: `${QUESTION_ACCENTS[i % QUESTION_ACCENTS.length]}20`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
                    color: QUESTION_ACCENTS[i % QUESTION_ACCENTS.length], fontWeight: 700,
                  }}>{i + 1}</div>
                  <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.55, flex: 1 }}>
                    {item.title}
                  </span>
                  <span style={{ fontSize: 11, color: QUESTION_ACCENTS[i % QUESTION_ACCENTS.length], flexShrink: 0 }}>→</span>
                </button>
              ))}
            </div>
          </div>

          {/* 7. 专业依据 collapsible */}
          <BasisSection items={viewModel.basis} />

          {/* Share entry */}
          {onSharePoster && (
            <div style={{ padding: "4px 0 0" }}>
              <button onClick={onSharePoster} style={{
                width: "100%", padding: "14px 20px",
                borderRadius: 18,
                background: "linear-gradient(135deg, rgba(245,196,184,0.30), rgba(255,255,255,0.85))",
                border: "1.5px solid rgba(232,129,106,0.32)",
                backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
                cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              }}>
                <span style={{ fontSize: 15, color: "#E8816A" }}>⊙</span>
                <span style={{
                  fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 500, color: "#28253D",
                }}>生成八字分享卡</span>
              </button>
            </div>
          )}

          <div style={{ height: 8 }} />
        </div>
        )}
      </div>
    </>
  );
}
