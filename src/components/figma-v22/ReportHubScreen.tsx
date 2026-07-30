import { useState } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
type ReportCategory = "全部" | "生辰" | "星盘" | "紫微" | "合盘" | "流盘";

interface ReportDef {
  id: string;
  category: Exclude<ReportCategory, "全部">;
  iconKey: "bazi" | "natal" | "ziwei" | "compat" | "liupan";
  title: string;
  summary: string;
  status: string;
  statusColor: string;
  updatedAt: string;
  onNavigate: () => void;
}

// ─── Mini SVG Instruments ─────────────────────────────────────────────────────
function BaziIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="19" stroke="rgba(232,129,106,0.35)" strokeWidth="1.2" />
      <circle cx="22" cy="22" r="13" stroke="rgba(232,129,106,0.22)" strokeWidth="0.8" strokeDasharray="3 2.5" />
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return (
          <line key={i}
            x1={22 + 16 * Math.cos(a)} y1={22 + 16 * Math.sin(a)}
            x2={22 + 19 * Math.cos(a)} y2={22 + 19 * Math.sin(a)}
            stroke="rgba(232,129,106,0.55)" strokeWidth="1.4" />
        );
      })}
      <text x="22" y="23" textAnchor="middle" dominantBaseline="middle"
        fontSize="11" fontFamily="'Noto Serif SC', serif" fontWeight="700" fill="#C85A44">八</text>
      <circle cx="22" cy="6" r="2.5" fill="#E8816A" opacity="0.8" />
    </svg>
  );
}

function NatalIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="19" stroke="rgba(123,189,224,0.40)" strokeWidth="1.2" />
      {[0,1,2,3,4,5,6,7,8,9,10,11].map((i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={22 + 17 * Math.cos(a)} cy={22 + 17 * Math.sin(a)} r="1.2" fill="rgba(123,189,224,0.65)" />;
      })}
      <line x1="22" y1="22" x2={22 + 12 * Math.cos(-Math.PI / 2)} y2={22 + 12 * Math.sin(-Math.PI / 2)}
        stroke="#7BBDE0" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="22" y1="22" x2={22 + 8 * Math.cos(Math.PI / 4)} y2={22 + 8 * Math.sin(Math.PI / 4)}
        stroke="rgba(123,189,224,0.65)" strokeWidth="1" strokeLinecap="round" />
      <circle cx="22" cy="22" r="3" fill="rgba(123,189,224,0.20)" stroke="#7BBDE0" strokeWidth="1" />
    </svg>
  );
}

function ZiweiIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <rect x="4" y="4" width="36" height="36" rx="4" stroke="rgba(233,201,126,0.40)" strokeWidth="1" />
      <rect x="4" y="4" width="18" height="18" rx="2" stroke="rgba(233,201,126,0.30)" strokeWidth="0.8" />
      <rect x="22" y="4" width="18" height="18" rx="2" stroke="rgba(233,201,126,0.30)" strokeWidth="0.8" />
      <rect x="4" y="22" width="18" height="18" rx="2" stroke="rgba(233,201,126,0.30)" strokeWidth="0.8" />
      <rect x="22" y="22" width="18" height="18" rx="2" stroke="rgba(233,201,126,0.30)" strokeWidth="0.8" />
      <text x="13" y="14" textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontFamily="'Noto Serif SC', serif" fill="rgba(180,140,50,0.80)">紫</text>
      <text x="31" y="14" textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontFamily="'Noto Serif SC', serif" fill="rgba(180,140,50,0.60)">微</text>
      <text x="13" y="31" textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontFamily="'Noto Serif SC', serif" fill="rgba(180,140,50,0.55)">斗</text>
      <text x="31" y="31" textAnchor="middle" dominantBaseline="middle"
        fontSize="8" fontFamily="'Noto Serif SC', serif" fill="rgba(180,140,50,0.45)">数</text>
      <circle cx="22" cy="22" r="3.5" fill="rgba(233,201,126,0.30)" stroke="#E9C97E" strokeWidth="1" />
    </svg>
  );
}

function CompatIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="16" cy="22" r="10" stroke="rgba(107,191,160,0.45)" strokeWidth="1.2" />
      <circle cx="28" cy="22" r="10" stroke="rgba(192,172,222,0.45)" strokeWidth="1.2" />
      <path d="M22 13.5 Q22 22 22 30.5" stroke="rgba(180,160,210,0.30)" strokeWidth="0.8" />
      <circle cx="16" cy="22" r="4" fill="rgba(107,191,160,0.18)" />
      <circle cx="28" cy="22" r="4" fill="rgba(192,172,222,0.18)" />
      <text x="16" y="22.5" textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontFamily="'Noto Serif SC', serif" fill="#6BBFA0" fontWeight="700">木</text>
      <text x="28" y="22.5" textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontFamily="'Noto Serif SC', serif" fill="#C0ACDE" fontWeight="700">火</text>
    </svg>
  );
}

function LiupanIcon({ size = 44 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 44 44" fill="none">
      <circle cx="22" cy="22" r="18" stroke="rgba(192,172,222,0.30)" strokeWidth="1" />
      <circle cx="22" cy="22" r="12" stroke="rgba(107,191,160,0.30)" strokeWidth="1" strokeDasharray="2 3" />
      <line x1="4" y1="22" x2="40" y2="22" stroke="rgba(180,160,210,0.20)" strokeWidth="0.8" />
      <circle cx="10" cy="22" r="2.5" fill="#6BBFA0" opacity="0.70" />
      <circle cx="22" cy="22" r="3.5" fill="#C0ACDE" opacity="0.80" />
      <circle cx="34" cy="22" r="2" fill="#E9C97E" opacity="0.65" />
      <path d="M10 22 Q16 14 22 22 Q28 30 34 22" stroke="rgba(107,191,160,0.50)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <text x="22" y="10" textAnchor="middle" dominantBaseline="middle"
        fontSize="7" fontFamily="'Noto Sans SC', sans-serif" fill="rgba(107,96,136,0.60)">流年</text>
    </svg>
  );
}

function ReportIcon({ iconKey, size }: { iconKey: ReportDef["iconKey"]; size?: number }) {
  if (iconKey === "bazi") return <BaziIcon size={size} />;
  if (iconKey === "natal") return <NatalIcon size={size} />;
  if (iconKey === "ziwei") return <ZiweiIcon size={size} />;
  if (iconKey === "compat") return <CompatIcon size={size} />;
  return <LiupanIcon size={size} />;
}

// ─── Icon bg gradients ────────────────────────────────────────────────────────
const ICON_GRADIENTS: Record<ReportDef["iconKey"], string> = {
  bazi:   "linear-gradient(135deg, #FFF0EC, #FDDDD6)",
  natal:  "linear-gradient(135deg, #EBF5FD, #D3ECFA)",
  ziwei:  "linear-gradient(135deg, #FFF9E6, #FAF0CC)",
  compat: "linear-gradient(135deg, #E8F8F2, #D4F0E6)",
  liupan: "linear-gradient(135deg, #F3EEFF, #EBE4FA)",
};

// ─── Glass utilities ──────────────────────────────────────────────────────────
const glass = {
  background: "rgba(255,255,255,0.74)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.88)",
};

// ─── Pressable card shell ─────────────────────────────────────────────────────
function PressCard({
  children,
  onClick,
  style,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  style?: React.CSSProperties;
}) {
  const [pressed, setPressed] = useState(false);
  const cardStyle: React.CSSProperties = {
    ...glass,
    borderRadius: 20,
    boxShadow: pressed
      ? "0 2px 8px rgba(160,130,200,0.08)"
      : "0 4px 20px rgba(160,130,200,0.12)",
    transform: pressed ? "scale(0.983)" : "scale(1)",
    transition: "transform 0.13s ease, box-shadow 0.13s ease",
    cursor: onClick ? "pointer" : "default",
    ...style,
  };
  if (!onClick) return <div style={cardStyle}>{children}</div>;
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        ...cardStyle,
        width: "100%",
        color: "inherit",
        font: "inherit",
        textAlign: "left",
      }}
    >
      {children}
    </button>
  );
}

// ─── Status badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status, color }: { status: string; color: string }) {
  return (
    <span style={{
      padding: "2.5px 9px", borderRadius: 20, flexShrink: 0,
      fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
      color, background: `${color}16`, border: `1px solid ${color}30`,
    }}>{status}</span>
  );
}

// ─── Report Row ───────────────────────────────────────────────────────────────
function ReportRow({ report }: { report: ReportDef }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      onClick={report.onNavigate}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14,
        padding: "14px 16px",
        borderRadius: 18,
        ...glass,
        boxShadow: pressed
          ? "0 2px 8px rgba(160,130,200,0.06)"
          : "0 3px 16px rgba(160,130,200,0.10)",
        transform: pressed ? "scale(0.980)" : "scale(1)",
        transition: "all 0.13s ease",
        cursor: "pointer",
        width: "100%",
        color: "inherit",
        textAlign: "left",
      }}
    >
      {/* Icon */}
      <div style={{
        width: 48, height: 48, borderRadius: 14, flexShrink: 0,
        background: ICON_GRADIENTS[report.iconKey],
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
      }}>
        <ReportIcon iconKey={report.iconKey} size={34} />
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 14.5, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500, color: "#28253D", marginBottom: 3,
        }}>{report.title}</div>
        <div style={{
          fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#7B6E90", lineHeight: 1.45,
          overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
        }}>{report.summary}</div>
        <div style={{
          marginTop: 5, fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#B0A4C6",
        }}>{report.updatedAt}</div>
      </div>

      {/* Status + arrow */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6, flexShrink: 0 }}>
        <StatusBadge status={report.status} color={report.statusColor} />
        <span style={{ fontSize: 13, color: "#C0B4D8" }}>→</span>
      </div>
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  onBack: () => void;
  onOpenSwitcher: () => void;
  onGoToBazi: () => void;
  onGoToNatal: () => void;
  onGoToZiwei: () => void;
  onGoToComp: () => void;
  onGoToFlow: () => void;
  onGoToCombinedInsight: () => void;
  profileName: string;
  baziSummary: string;
  natalSummary: string;
  ziweiSummary: string;
  hasExactTime: boolean;
}

export default function ReportHubScreen({
  onBack,
  onOpenSwitcher,
  onGoToBazi,
  onGoToNatal,
  onGoToZiwei,
  onGoToComp,
  onGoToFlow,
  onGoToCombinedInsight,
  profileName,
  baziSummary,
  natalSummary,
  ziweiSummary,
  hasExactTime,
}: Props) {
  const [activeTab, setActiveTab] = useState<ReportCategory>("全部");

  const TABS: ReportCategory[] = ["全部", "生辰", "星盘", "紫微", "合盘", "流盘"];

  const REPORTS: ReportDef[] = [
    {
      id: "bazi",
      category: "生辰",
      iconKey: "bazi",
      title: "生辰八字",
      summary: baziSummary,
      status: "已解读",
      statusColor: "#6BBFA0",
      updatedAt: "当前档案",
      onNavigate: onGoToBazi,
    },
    {
      id: "natal",
      category: "星盘",
      iconKey: "natal",
      title: "本命星盘",
      summary: natalSummary,
      status: "已生成",
      statusColor: "#7BBDE0",
      updatedAt: "当前档案",
      onNavigate: onGoToNatal,
    },
    {
      id: "ziwei",
      category: "紫微",
      iconKey: "ziwei",
      title: "紫微斗数",
      summary: ziweiSummary,
      status: hasExactTime ? "已排盘" : "待补资料",
      statusColor: "#E9C97E",
      updatedAt: hasExactTime ? "当前档案" : "资料不足",
      onNavigate: onGoToZiwei,
    },
    {
      id: "compat",
      category: "合盘",
      iconKey: "compat",
      title: "两人合盘",
      summary: "选择两份真实档案后，查看关系结构",
      status: "去创建",
      statusColor: "#6BBFA0",
      updatedAt: "尚无记录",
      onNavigate: onGoToComp,
    },
    {
      id: "liupan",
      category: "流盘",
      iconKey: "liupan",
      title: `流盘 · ${new Date().getFullYear()} 年`,
      summary: `当前阶段与 ${new Date().getFullYear()} 年度节奏观察`,
      status: "可查看",
      statusColor: "#C0ACDE",
      updatedAt: "今日",
      onNavigate: onGoToFlow,
    },
  ];

  const visibleReports = activeTab === "全部"
    ? REPORTS
    : REPORTS.filter(r => r.category === activeTab);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 44%, #FDF4F1 100%)",
      overflowY: "auto", overflowX: "hidden",
      scrollbarWidth: "none",
    }}>
      {/* Status bar space */}
      <div style={{ height: 52 }} />

      {/* ── Header ── */}
      <div style={{ padding: "0 22px 0" }}>
        {/* Back + title row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <button
            onClick={onBack}
            style={{
              width: 34, height: 34, borderRadius: "50%",
              background: "rgba(255,255,255,0.68)",
              backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.88)",
              boxShadow: "0 2px 8px rgba(160,130,200,0.09)",
              cursor: "pointer", fontSize: 15, color: "#8C82A4",
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
            }}
          >←</button>
          <div>
            <div style={{
              fontSize: 22, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 700, color: "#28253D", letterSpacing: "0.04em", lineHeight: 1,
            }}>我的报告</div>
          </div>
        </div>

        <div style={{
          fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#9088A8", marginBottom: 16, marginLeft: 44,
        }}>
          从一条结论开始，再决定要不要往下看
        </div>

        {/* Profile row */}
        <button
          onClick={onOpenSwitcher}
          style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "8px 14px 8px 8px", borderRadius: 24,
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
            border: "1px solid rgba(255,255,255,0.88)",
            boxShadow: "0 2px 10px rgba(160,130,200,0.10)",
            cursor: "pointer", marginBottom: 20,
          }}
        >
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg, #6BBFA0DD, #6BBFA077)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#fff",
            fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
          }}>{profileName.trim().slice(0, 1) || "档"}</div>
          <span style={{
            fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 500, color: "#28253D",
          }}>{profileName}</span>
          <span style={{
            fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#B0A4C6", marginLeft: 2,
          }}>切换 ∨</span>
        </button>
      </div>

      {/* ── Continue Reading Card ── */}
      <div style={{ padding: "0 18px 18px" }}>
        <PressCard
          onClick={onGoToBazi}
          style={{
            padding: "18px 20px",
            background: "linear-gradient(145deg, rgba(255,255,255,0.85) 0%, rgba(244,240,255,0.80) 100%)",
            borderRadius: 22,
          }}
        >
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%",
              background: "#E8816A",
              boxShadow: "0 0 5px rgba(232,129,106,0.55)",
              animation: "pulse-dot 2.6s ease-in-out infinite",
            }} />
            <span style={{
              fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
              fontWeight: 500, color: "#9088A8", letterSpacing: "0.06em",
            }}>继续阅读</span>
          </div>

          {/* Conclusion line */}
          <div style={{
            fontSize: 16, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 700, color: "#28253D", lineHeight: 1.55, marginBottom: 8,
          }}>
            {baziSummary}
          </div>

          {/* Source */}
          <div style={{
            fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#7B6E90", marginBottom: 14,
          }}>
            从当前档案的生辰结构继续阅读
          </div>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
            <div style={{
              padding: "7px 16px", borderRadius: 20,
              background: "linear-gradient(135deg, #E8816A, #E9A87E)",
              fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
              fontWeight: 500, color: "#fff",
              boxShadow: "0 3px 10px rgba(232,129,106,0.28)",
              flexShrink: 0,
            }}>打开生辰报告 →</div>
          </div>
        </PressCard>
      </div>

      {/* ── Category Tabs ── */}
      <div style={{ paddingLeft: 18, marginBottom: 14, overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 8, paddingRight: 18 }}>
          {TABS.map(tab => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 16px", borderRadius: 20, flexShrink: 0,
                  background: isActive ? "rgba(232,129,106,0.13)" : "rgba(255,255,255,0.62)",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  border: isActive
                    ? "1.5px solid rgba(232,129,106,0.38)"
                    : "1px solid rgba(255,255,255,0.88)",
                  fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "#D06A56" : "#9088A8",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: isActive
                    ? "0 2px 10px rgba(232,129,106,0.14)"
                    : "0 2px 8px rgba(160,130,200,0.07)",
                }}
              >{tab}</button>
            );
          })}
        </div>
      </div>

      {/* ── Report List ── */}
      <div style={{ padding: "0 18px 8px" }}>
        {visibleReports.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {visibleReports.map(report => (
              <ReportRow key={report.id} report={report} />
            ))}
          </div>
        ) : (
          /* Empty state */
          <div style={{
            ...glass,
            borderRadius: 20,
            padding: "36px 24px",
            textAlign: "center",
          }}>
            <div style={{
              fontSize: 36, marginBottom: 12, opacity: 0.35,
            }}>◎</div>
            <div style={{
              fontSize: 15, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 500, color: "#28253D", marginBottom: 8,
            }}>暂无{activeTab}报告</div>
            <div style={{
              fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#9088A8", lineHeight: 1.6,
            }}>
              在首页完善档案信息后，<br />对应报告会在这里生成
            </div>
          </div>
        )}
      </div>

      {/* ── 高阶合参 entry ── */}
      <div style={{ padding: "0 18px 16px" }}>
        <button type="button" onClick={onGoToCombinedInsight} style={{
          borderRadius: 20, padding: "16px 18px",
          background: "linear-gradient(140deg, rgba(255,255,255,0.82), rgba(238,233,248,0.76))",
          backdropFilter: "blur(20px) saturate(180%)",
          WebkitBackdropFilter: "blur(20px) saturate(180%)",
          border: "1px solid rgba(192,172,222,0.35)",
          boxShadow: "0 4px 18px rgba(160,130,200,0.14)",
          cursor: "pointer",
          display: "flex", alignItems: "center", gap: 14,
          width: "100%", color: "inherit", textAlign: "left",
        }}>
          <div style={{
            width: 44, height: 44, borderRadius: 14, flexShrink: 0,
            background: "linear-gradient(135deg, #EEE8FA, #E4DCFA)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 18, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#8060C0",
          }}>合</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", marginBottom: 3 }}>
              高阶合参
            </div>
            <div style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#7B6E90" }}>
              八字、紫微证据已具备 · 奇门与权重引擎接入中
            </div>
          </div>
          <span style={{
            padding: "2.5px 9px", borderRadius: 20,
            fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#8060C0", background: "rgba(192,172,222,0.16)",
            border: "1px solid rgba(192,172,222,0.32)",
          }}>了解进度 →</span>
        </button>
      </div>

      {/* ── Recent Section ── */}
      <div style={{ padding: "4px 18px 28px" }}>
        <div style={{
          fontSize: 13, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500, color: "#28253D", marginBottom: 12,
        }}>报告记录</div>

        <div style={{
          padding: "14px 16px", borderRadius: 16,
          background: "rgba(255,255,255,0.52)",
          border: "1px solid rgba(255,255,255,0.82)",
          fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#7B6E90", lineHeight: 1.7,
        }}>
          当前报告在本地按档案即时生成。历史生成时间与阅读进度尚未接入，因此这里不展示推测的记录。
        </div>
      </div>

      {/* bottom nav spacer */}
      <div style={{ height: 86 }} />
    </div>
  );
}
