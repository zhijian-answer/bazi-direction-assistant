import { useState } from "react";

// ─── Prismatic Compass ────────────────────────────────────────────────────────
function PrismaticCompass({ revealed }: { revealed: boolean }) {
  const cx = 130, cy = 130, S = 260;

  function arcPath(R: number, r: number, startDeg: number, endDeg: number) {
    const toR = (d: number) => (d * Math.PI) / 180;
    const s = toR(startDeg), e = toR(endDeg);
    const f = (n: number) => n.toFixed(2);
    const x1o = f(cx + R * Math.cos(s)), y1o = f(cy + R * Math.sin(s));
    const x2o = f(cx + R * Math.cos(e)), y2o = f(cy + R * Math.sin(e));
    const x1i = f(cx + r * Math.cos(e)), y1i = f(cy + r * Math.sin(e));
    const x2i = f(cx + r * Math.cos(s)), y2i = f(cy + r * Math.sin(s));
    const la = endDeg - startDeg > 180 ? 1 : 0;
    return `M ${x1o} ${y1o} A ${R} ${R} 0 ${la} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${r} ${r} 0 ${la} 0 ${x2i} ${y2i} Z`;
  }

  const SEGS = [
    { name: "感知力", start: -88, end: -8,  color: "#E8816A", value: 88 },
    { name: "行动力", start: 2,   end: 82,  color: "#6BBFA0", value: 72 },
    { name: "边界感", start: 92,  end: 172, color: "#7BBDE0", value: 65 },
    { name: "连接力", start: 182, end: 262, color: "#E9C97E", value: 78 },
  ];

  const LABELS = SEGS.map(seg => {
    const mid = (seg.start + seg.end) / 2;
    const rad = (mid * Math.PI) / 180;
    return { x: cx + 110 * Math.cos(rad), y: cy + 110 * Math.sin(rad), color: seg.color, name: seg.name };
  });

  const DOTS = SEGS.map(seg => {
    const mid = (seg.start + seg.end) / 2;
    const rad = (mid * Math.PI) / 180;
    const dotR = 62 + (seg.value / 100) * (85 - 62);
    return { x: cx + dotR * Math.cos(rad), y: cy + dotR * Math.sin(rad), color: seg.color };
  });

  return (
    <div style={{ position: "relative", width: S, height: S, flexShrink: 0 }}>
      {/* Prismatic ambient glow */}
      <div style={{
        position: "absolute", inset: -24,
        background: revealed
          ? "radial-gradient(ellipse, rgba(232,129,106,0.14) 0%, rgba(107,191,160,0.11) 35%, rgba(123,189,224,0.09) 65%, transparent 100%)"
          : "radial-gradient(ellipse, rgba(180,160,220,0.10) 0%, transparent 70%)",
        pointerEvents: "none", borderRadius: "50%",
        transition: "background 1s ease",
      }} />

      <svg width={S} height={S} viewBox={`0 0 ${S} ${S}`} style={{ overflow: "visible" }}>
        <defs>
          {SEGS.map((seg, i) => (
            <radialGradient key={i} id={`pg${i}`} cx="40%" cy="40%" r="60%">
              <stop offset="0%"   stopColor={seg.color} stopOpacity="0.95" />
              <stop offset="100%" stopColor={seg.color} stopOpacity="0.58" />
            </radialGradient>
          ))}
          <radialGradient id="pcenter" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#FFFFFF" stopOpacity="1" />
            <stop offset="100%" stopColor="#F4EEFF" stopOpacity="0.95" />
          </radialGradient>
          <filter id="pglow">
            <feGaussianBlur stdDeviation="2.8" result="b" />
            <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="softshadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.12" />
          </filter>
        </defs>

        {/* ── Outer decorative ring ── */}
        <circle cx={cx} cy={cy} r={102} fill="none"
          stroke={revealed ? "rgba(180,160,220,0.22)" : "rgba(180,160,220,0.12)"} strokeWidth={1}
          style={{ transition: "stroke 0.8s ease" }} />
        {Array.from({ length: 36 }).map((_, i) => {
          const a = (i / 36) * Math.PI * 2;
          const r1 = 102, r2 = i % 9 === 0 ? 93 : 97;
          return (
            <line key={i}
              x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
              stroke={i % 9 === 0 ? "rgba(160,140,200,0.38)" : "rgba(180,160,220,0.18)"}
              strokeWidth={i % 9 === 0 ? 1.3 : 0.7} />
          );
        })}

        {/* ── Colored donut segments — hidden until revealed ── */}
        {SEGS.map((seg, i) => (
          <path key={i} d={arcPath(86, 63, seg.start, seg.end)}
            fill={`url(#pg${i})`}
            filter="url(#pglow)"
            style={{
              opacity: revealed ? 1 : 0,
              transition: `opacity 0.55s cubic-bezier(0.4,0,0.2,1) ${i * 0.12 + 0.12}s`,
            }} />
        ))}

        {/* ── Mid ring ── */}
        <circle cx={cx} cy={cy} r={61} fill="none"
          stroke="rgba(192,172,222,0.22)" strokeWidth={1} />

        {/* ── Crosshair ── */}
        <line x1={cx - 57} y1={cy} x2={cx + 57} y2={cy}
          stroke="rgba(180,160,220,0.14)" strokeWidth={0.8} />
        <line x1={cx} y1={cy - 57} x2={cx} y2={cy + 57}
          stroke="rgba(180,160,220,0.14)" strokeWidth={0.8} />

        {/* ── Center disc ── */}
        <circle cx={cx} cy={cy} r={50}
          fill="url(#pcenter)" stroke="rgba(233,201,126,0.52)" strokeWidth={2}
          filter="url(#softshadow)" />
        <circle cx={cx} cy={cy} r={45}
          fill="none" stroke="rgba(233,201,126,0.18)" strokeWidth={0.8} />

        {/* ── Center text: hidden vs revealed ── */}
        {revealed ? (
          <>
            <text x={cx} y={cy - 9} textAnchor="middle" dominantBaseline="middle"
              fontSize={10.5} fontFamily="'Noto Sans SC', sans-serif" fill="#9088A8">温柔的</text>
            <text x={cx} y={cy + 10} textAnchor="middle" dominantBaseline="middle"
              fontSize={14.5} fontFamily="'Noto Serif SC', serif" fontWeight="700" fill="#28253D">推进者</text>
          </>
        ) : (
          <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle"
            fontSize={22} fontFamily="'Noto Serif SC', serif" fill="rgba(180,160,220,0.50)">？</text>
        )}

        {/* ── Outer labels ── */}
        {LABELS.map((lp, i) => (
          <text key={i} x={lp.x} y={lp.y + 0.5}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={10} fontFamily="'Noto Sans SC', sans-serif"
            fill={lp.color} fontWeight="500"
            style={{ opacity: revealed ? 1 : 0, transition: `opacity 0.4s ease ${i * 0.10 + 0.5}s` }}>
            {lp.name}
          </text>
        ))}

        {/* ── Value dots on each segment ── */}
        {DOTS.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={4.8}
            fill="white" stroke={d.color} strokeWidth={2.2}
            style={{ opacity: revealed ? 1 : 0, transition: `opacity 0.35s ease ${i * 0.10 + 0.35}s` }} />
        ))}

        {/* ── Animated gold orbiting dot ── */}
        <circle r={6} fill="#E9C97E" opacity="0.80"
          cx={cx + 102} cy={cy}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: revealed ? "pris-rotate 20s linear infinite" : "none",
            opacity: revealed ? 0.80 : 0,
            transition: "opacity 0.6s ease 0.8s",
          }} />

        {/* Secondary small coral dot, offset by half turn */}
        <circle r={4} fill="#E8816A" opacity="0.65"
          cx={cx - 102} cy={cy}
          style={{
            transformOrigin: `${cx}px ${cy}px`,
            animation: revealed ? "pris-rotate 30s linear infinite reverse" : "none",
            opacity: revealed ? 0.65 : 0,
            transition: "opacity 0.6s ease 1.0s",
          }} />
      </svg>
    </div>
  );
}

// ─── Dimension Card ───────────────────────────────────────────────────────────
function DimCard({ name, value, color, bg, border, desc, delay }: {
  name: string; value: number; color: string; bg: string; border: string; desc: string; delay: number;
}) {
  return (
    <div style={{
      flex: "1 1 calc(50% - 5px)",
      padding: "14px 14px 15px",
      borderRadius: 18,
      background: bg,
      border: `1px solid ${border}`,
      animationFillMode: "both",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 7 }}>
        <span style={{ fontSize: 13, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D" }}>
          {name}
        </span>
        <span style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 600, color }}>
          {value}
        </span>
      </div>
      <div style={{ height: 4, borderRadius: 2, background: "rgba(180,160,220,0.18)", marginBottom: 9, overflow: "hidden" }}>
        <div style={{
          height: "100%", borderRadius: 2,
          width: `${value}%`,
          background: `linear-gradient(90deg, ${color}CC, ${color}66)`,
          transition: `width 0.9s cubic-bezier(0.4,0,0.2,1) ${delay}s`,
        }} />
      </div>
      <p style={{
        fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
        color: "#4A4168", lineHeight: 1.62, margin: 0,
      }}>{desc}</p>
    </div>
  );
}

// ─── Generate Card Button ─────────────────────────────────────────────────────
function GenerateButton() {
  const [state, setState] = useState<"idle" | "loading" | "done">("idle");

  function handlePress() {
    if (state !== "idle") return;
    setState("loading");
    setTimeout(() => setState("done"), 1800);
  }

  const label = state === "idle" ? "生成我的性格卡" : state === "loading" ? "正在生成…" : "性格卡已生成 ✓";
  const bgColor = state === "done"
    ? "linear-gradient(135deg, rgba(107,191,160,0.20), rgba(255,255,255,0.85))"
    : "linear-gradient(135deg, rgba(232,129,106,0.18), rgba(245,196,184,0.25), rgba(255,255,255,0.88))";
  const borderColor = state === "done" ? "rgba(107,191,160,0.50)" : "rgba(232,129,106,0.45)";
  const iconBg = state === "done"
    ? "linear-gradient(135deg, #6BBFA0, #4EA888)"
    : "linear-gradient(135deg, #F5C4B8, #E8816A)";

  return (
    <button onClick={handlePress} disabled={state === "loading"} style={{
      width: "100%", padding: "16px 20px",
      borderRadius: 20,
      border: `1.5px solid ${borderColor}`,
      background: bgColor,
      cursor: state === "loading" ? "default" : "pointer",
      display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 5px 22px rgba(160,130,200,0.12)",
      transition: "all 0.35s ease",
    }}>
      <div style={{
        width: 38, height: 38, borderRadius: 13, flexShrink: 0,
        background: iconBg,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: state === "done" ? 16 : 18,
        boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
        transition: "background 0.35s ease",
      }}>
        {state === "done" ? "✓" : state === "loading" ? "◌" : "⊙"}
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={{
          fontSize: 14.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
          color: "#28253D", transition: "opacity 0.2s",
        }}>{label}</div>
        <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginTop: 2 }}>
          {state === "done" ? "可截图分享给朋友" : "生成一张可以分享的图卡"}
        </div>
      </div>
    </button>
  );
}

// ─── PersonalityScreen ────────────────────────────────────────────────────────
export default function PersonalityScreen({ onBack, onSharePoster }: {
  onBack: () => void;
  onSharePoster?: () => void;
}) {
  const [revealed, setRevealed] = useState(false);

  const dims = [
    {
      name: "感知力", value: 88, delay: 0.55,
      color: "#E8816A", bg: "rgba(232,129,106,0.08)", border: "rgba(232,129,106,0.22)",
      desc: "你的感受总比别人早一步，只是你不一定选择把它说出来。",
    },
    {
      name: "行动力", value: 72, delay: 0.65,
      color: "#6BBFA0", bg: "rgba(107,191,160,0.08)", border: "rgba(107,191,160,0.25)",
      desc: "一旦确认方向，你推进的耐力远比旁人想象的稳。",
    },
    {
      name: "边界感", value: 65, delay: 0.75,
      color: "#7BBDE0", bg: "rgba(123,189,224,0.09)", border: "rgba(123,189,224,0.25)",
      desc: "你懂得保护自己，但有时会在不太重要的地方多忍了一步。",
    },
    {
      name: "连接力", value: 78, delay: 0.85,
      color: "#E9C97E", bg: "rgba(233,201,126,0.10)", border: "rgba(233,201,126,0.28)",
      desc: "你不广撒网，但你给出的温度，让人很难忘记。",
    },
  ];

  return (
    <>
      {/* Page background */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 44%, #FDF4F1 100%)",
        zIndex: 0,
      }} />

      <div style={{
        position: "absolute", top: 0, left: 0, right: 0, bottom: 86,
        overflowY: "auto", overflowX: "hidden", zIndex: 1, scrollbarWidth: "none",
      }}>
        <div style={{ height: 52 }} />

        {/* ── Header ── */}
        <div style={{ padding: "0 20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
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
                性格图谱
              </div>
              <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginTop: 3 }}>
                李晓媛 · 基于生辰与星盘的综合分析
              </div>
            </div>
            <div style={{
              padding: "4px 12px", borderRadius: 20,
              background: "rgba(232,129,106,0.12)", border: "1px solid rgba(232,129,106,0.28)",
              fontSize: 11, color: "#D06A56", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500,
            }}>感知型</div>
          </div>
        </div>

        {/* ── Hero: compass + reveal state ── */}
        <div style={{ padding: "0 18px 20px" }}>
          <div style={{
            borderRadius: 28,
            background: "rgba(255,255,255,0.74)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            border: "1px solid rgba(255,255,255,0.90)",
            boxShadow: "0 6px 30px rgba(160,130,200,0.14)",
            padding: "24px 22px",
            display: "flex", flexDirection: "column", alignItems: "center",
            overflow: "hidden",
          }}>
            {/* Compass instrument */}
            <div style={{ marginBottom: 20 }}>
              <PrismaticCompass revealed={revealed} />
            </div>

            {/* Pre-reveal state */}
            {!revealed && (
              <div style={{ textAlign: "center", width: "100%", paddingBottom: 4 }}>
                <div style={{
                  fontSize: 18, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                  color: "#28253D", lineHeight: 1.45, marginBottom: 10,
                }}>
                  你的性格图谱已生成
                </div>
                <div style={{
                  fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
                  color: "#6B607E", lineHeight: 1.60, marginBottom: 22,
                }}>
                  综合四柱结构与星盘相位，<br />形成了一份只属于你的能量图
                </div>
                <button
                  onClick={() => setRevealed(true)}
                  style={{
                    padding: "13px 36px", borderRadius: 16,
                    background: "linear-gradient(135deg, #F5C4B8, #E8816A)",
                    border: "none", cursor: "pointer",
                    fontSize: 15, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                    color: "#fff",
                    boxShadow: "0 6px 22px rgba(232,129,106,0.35)",
                    transition: "transform 0.15s ease, box-shadow 0.15s ease",
                  }}
                  onPointerDown={e => (e.currentTarget.style.transform = "scale(0.97)")}
                  onPointerUp={e => (e.currentTarget.style.transform = "scale(1)")}
                >
                  开始揭晓
                </button>
                <div style={{ fontSize: 11, color: "#B8AAD0", fontFamily: "'Noto Sans SC', sans-serif", marginTop: 12 }}>
                  轻触查看你的完整图谱
                </div>
              </div>
            )}

            {/* Post-reveal title + statement */}
            <div style={{
              width: "100%", textAlign: "center",
              opacity: revealed ? 1 : 0,
              transform: revealed ? "translateY(0)" : "translateY(16px)",
              transition: "opacity 0.55s ease 0.45s, transform 0.55s ease 0.45s",
              pointerEvents: revealed ? "auto" : "none",
            }}>
              {/* Type tags */}
              <div style={{ display: "flex", justifyContent: "center", gap: 7, marginBottom: 14 }}>
                {["感知型", "内驱型", "温和输出"].map(tag => (
                  <div key={tag} style={{
                    padding: "3px 11px", borderRadius: 20,
                    background: "rgba(238,233,248,0.80)",
                    border: "1px solid rgba(192,172,222,0.28)",
                    fontSize: 11, color: "#7B6E94",
                    fontFamily: "'Noto Sans SC', sans-serif",
                  }}>{tag}</div>
                ))}
              </div>

              {/* Large title */}
              <div style={{
                fontSize: 24, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                color: "#28253D", lineHeight: 1.35, marginBottom: 16,
              }}>
                温柔的推进者
              </div>

              {/* Shareable 2-line statement */}
              <div style={{
                padding: "16px 18px",
                borderRadius: 18,
                background: "linear-gradient(135deg, rgba(232,129,106,0.09) 0%, rgba(238,233,248,0.50) 100%)",
                border: "1px solid rgba(232,129,106,0.18)",
                marginBottom: 4,
              }}>
                <div style={{
                  fontSize: 16.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                  color: "#28253D", lineHeight: 1.55,
                }}>
                  你不是慢，你只是在等<br />一个真正值得的理由
                </div>
                <div style={{
                  fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
                  color: "#6B607E", marginTop: 7, lineHeight: 1.55,
                }}>
                  而那个时候，你比任何人都稳。
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── All content below — fades in after reveal ── */}
        <div style={{
          opacity: revealed ? 1 : 0,
          transform: revealed ? "translateY(0)" : "translateY(24px)",
          transition: "opacity 0.60s ease 0.65s, transform 0.60s ease 0.65s",
          pointerEvents: revealed ? "auto" : "none",
          padding: "0 18px",
          display: "flex", flexDirection: "column", gap: 14,
        }}>

          {/* ── Four dimensions 2×2 ── */}
          <div>
            <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginBottom: 10, paddingLeft: 2, letterSpacing: "0.04em" }}>
              四个能量维度
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {dims.map(d => <DimCard key={d.name} {...d} />)}
            </div>
          </div>

          {/* ── 别人看到的 / 你真正需要的 ── */}
          <div>
            <div style={{ display: "flex", gap: 11 }}>
              {[
                {
                  title: "别人看到的你", icon: "◎",
                  color: "#7BBDE0", bg: "rgba(123,189,224,0.08)", border: "rgba(123,189,224,0.25)",
                  items: ["温和、耐心、从不催人", "好商量、遇事不慌", "总是照顾别人感受"],
                },
                {
                  title: "你真正需要的", icon: "✦",
                  color: "#E8816A", bg: "rgba(232,129,106,0.08)", border: "rgba(232,129,106,0.22)",
                  items: ["被认真对待，不被敷衍", "付出的事被人看见", "不被随意打断或带节奏"],
                },
              ].map(col => (
                <div key={col.title} style={{
                  flex: 1, borderRadius: 18, overflow: "hidden",
                  border: `1px solid ${col.border}`, background: col.bg,
                }}>
                  <div style={{
                    padding: "10px 14px 8px",
                    background: `${col.color}10`,
                    display: "flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ fontSize: 12, color: col.color }}>{col.icon}</span>
                    <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: col.color }}>
                      {col.title}
                    </span>
                  </div>
                  <div style={{ padding: "10px 14px 14px", display: "flex", flexDirection: "column", gap: 7 }}>
                    {col.items.map((item, i) => (
                      <div key={i} style={{ display: "flex", gap: 7, alignItems: "flex-start" }}>
                        <div style={{
                          width: 5, height: 5, borderRadius: "50%",
                          background: col.color, marginTop: 5.5, flexShrink: 0,
                        }} />
                        <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.58 }}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── 隐藏优势 ── */}
          <div style={{
            padding: "18px 20px", borderRadius: 20,
            background: "linear-gradient(140deg, rgba(107,191,160,0.11) 0%, rgba(255,255,255,0.82) 100%)",
            border: "1px solid rgba(107,191,160,0.30)",
            boxShadow: "0 4px 20px rgba(107,191,160,0.10)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: "linear-gradient(135deg, #D0EAE0, #6BBFA0)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, boxShadow: "0 2px 8px rgba(107,191,160,0.25)",
              }}>◈</div>
              <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#3A7A62", letterSpacing: "0.04em" }}>
                隐藏优势
              </span>
            </div>
            <div style={{ fontSize: 15.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", lineHeight: 1.50, marginBottom: 9 }}>
              你的稳，是一种很少见的力量
            </div>
            <p style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.68, margin: 0 }}>
              很多人把你的温和理解为没主见，但当事情真的紧张起来，你才是那个不慌乱的人。这份冷静不是压抑，是真实的定力。
            </p>
          </div>

          {/* ── 容易被误解 ── */}
          <div style={{
            padding: "18px 20px", borderRadius: 20,
            background: "linear-gradient(140deg, rgba(192,172,222,0.11) 0%, rgba(255,255,255,0.82) 100%)",
            border: "1px solid rgba(192,172,222,0.28)",
            boxShadow: "0 4px 20px rgba(192,172,222,0.10)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: "linear-gradient(135deg, #E8E0F4, #C0ACDE)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, boxShadow: "0 2px 8px rgba(192,172,222,0.25)",
              }}>◎</div>
              <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#6B4EA8", letterSpacing: "0.04em" }}>
                容易被误解的地方
              </span>
            </div>
            <div style={{ fontSize: 15.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", lineHeight: 1.50, marginBottom: 9 }}>
              沉默不代表没感觉
            </div>
            <p style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.68, margin: 0 }}>
              你在思考或消化的时候，旁人很容易误以为你冷漠或不在乎。其实你只是需要一点时间把感受整理好，再开口。知道这个的人，才真正了解你。
            </p>
          </div>

          {/* ── 成长建议 ── */}
          <div style={{
            padding: "18px 20px", borderRadius: 20,
            background: "linear-gradient(140deg, rgba(233,201,126,0.14) 0%, rgba(255,255,255,0.82) 100%)",
            border: "1px solid rgba(233,201,126,0.40)",
            boxShadow: "0 4px 20px rgba(212,160,84,0.10)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 28, height: 28, borderRadius: 9, flexShrink: 0,
                background: "linear-gradient(135deg, #F6EACC, #E9C97E)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, boxShadow: "0 2px 8px rgba(212,160,84,0.25)",
              }}>✦</div>
              <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#8A6820", letterSpacing: "0.04em" }}>
                一个实用的方向
              </span>
            </div>
            <div style={{ fontSize: 15.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", lineHeight: 1.50, marginBottom: 9 }}>
              练习把「我需要」说出来
            </div>
            <p style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.68, margin: 0 }}>
              你擅长感知别人的需要，却不习惯表达自己的。这一年，试着在小事上先开口，让身边的人有机会照顾你。这不是自私，是让关系变得更真实。
            </p>
          </div>

          {/* ── 生成性格卡 ── */}
          {onSharePoster ? (
            <button onClick={onSharePoster} style={{
              width: "100%", padding: "16px 20px", borderRadius: 20,
              border: "1.5px solid rgba(232,129,106,0.45)",
              background: "linear-gradient(135deg, rgba(232,129,106,0.18), rgba(245,196,184,0.25), rgba(255,255,255,0.88))",
              cursor: "pointer", display: "flex", alignItems: "center", gap: 12,
              boxShadow: "0 5px 22px rgba(160,130,200,0.12)",
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: 13, flexShrink: 0,
                background: "linear-gradient(135deg, #F5C4B8, #E8816A)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 18, boxShadow: "0 3px 10px rgba(0,0,0,0.10)",
              }}>⊙</div>
              <div style={{ textAlign: "left" }}>
                <div style={{ fontSize: 14.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D" }}>
                  生成我的性格卡
                </div>
                <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: "#9088A8", marginTop: 2 }}>
                  生成一张可以分享的图卡
                </div>
              </div>
            </button>
          ) : (
            <GenerateButton />
          )}

          {/* ── 重新测一测 ── */}
          <button
            onClick={() => setRevealed(false)}
            style={{
              width: "100%", padding: "12px",
              borderRadius: 16, border: "1px solid rgba(192,172,222,0.30)",
              background: "rgba(238,233,248,0.55)",
              cursor: "pointer",
              fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#9088A8", fontWeight: 400,
              transition: "all 0.2s ease",
            }}>
            重新测一测
          </button>

          <div style={{ height: 8 }} />
        </div>
      </div>

      {/* Keyframes */}
      <style>{`
        @keyframes pris-rotate {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (prefers-reduced-motion: reduce) {
          [style*="pris-rotate"] { animation: none !important; }
        }
      `}</style>
    </>
  );
}
