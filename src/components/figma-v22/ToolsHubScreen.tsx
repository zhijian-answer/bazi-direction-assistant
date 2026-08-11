import { useState } from "react";
import { releaseFeatures, releasedToolIds } from "@/lib/mobile/releaseFeatures";
import { type ToolStatusData } from "./ToolStatusSheet";

// ─── Data types — pure text/enum only, no JSX ─────────────────────────────────
type ToolState = "available" | "coming" | "example";
type ToolCategory = "关系" | "性格" | "日常" | "探索";
type FilterTab = "全部" | "关系" | "性格" | "日常" | "探索";
type ToolIconKey = "compat" | "natal" | "personality" | "qa" | "tarot" | "numerology" | "archetype" | "soulmate";

interface ToolDef {
  id: string;
  iconKey: ToolIconKey;
  title: string;
  subtitle: string;
  category: ToolCategory;
  state: ToolState;
  stateLabel: string;
  stateColor: string;
  statusDesc: string;
}

const TOOLS: ToolDef[] = [
  {
    id: "compat",
    iconKey: "compat",
    title: "两人合盘",
    subtitle: "看懂为什么互相吸引，又总在同一个地方误会",
    category: "关系",
    state: "available",
    stateLabel: "现在就看",
    stateColor: "#6BBFA0",
    statusDesc: "",
  },
  {
    id: "natal",
    iconKey: "natal",
    title: "完整星盘",
    subtitle: "看看别人眼里的你，和心里的自己有什么不同",
    category: "探索",
    state: "available",
    stateLabel: "现在就看",
    stateColor: "#6BBFA0",
    statusDesc: "",
  },
  {
    id: "personality",
    iconKey: "personality",
    title: "性格测试",
    subtitle: "从真实选择里，看看你习惯怎样面对关系和压力",
    category: "性格",
    state: "coming",
    stateLabel: "暂未开放",
    stateColor: "#7BBDE0",
    statusDesc: "性格测试暂时还不能使用。想先了解自己的性格和相处方式，可以查看生辰或星盘报告。",
  },
  {
    id: "qa",
    iconKey: "qa",
    title: "玄枢问答",
    subtitle: "有件事想不明白，就从最真实的困惑说起",
    category: "日常",
    state: "available",
    stateLabel: "在线问答",
    stateColor: "#6BBFA0",
    statusDesc: "",
  },
  {
    id: "tarot",
    iconKey: "tarot",
    title: "每日塔罗",
    subtitle: "结合当日流年，给出一张参考牌面",
    category: "日常",
    state: "coming",
    stateLabel: "暂未开放",
    stateColor: "#C0ACDE",
    statusDesc: "每日塔罗暂时还不能使用。想看看今天该注意什么，可以先读生辰报告里的今日提醒。",
  },
  {
    id: "numerology",
    iconKey: "numerology",
    title: "数字命理",
    subtitle: "从生日数字解读命格倾向与当年节律",
    category: "日常",
    state: "coming",
    stateLabel: "暂未开放",
    stateColor: "#C0ACDE",
    statusDesc: "数字命理暂时还不能使用。想先了解自己的性格与近期节奏，可以查看生辰报告。",
  },
  {
    id: "archetype",
    iconKey: "archetype",
    title: "人格原型",
    subtitle: "识别你的核心驱动模式和应激反应",
    category: "性格",
    state: "coming",
    stateLabel: "暂未开放",
    stateColor: "#C0ACDE",
    statusDesc: "人格原型暂时还不能使用。想先了解自己的反应方式，可以查看生辰或星盘报告。",
  },
  {
    id: "soulmate",
    iconKey: "soulmate",
    title: "灵魂伴侣画像",
    subtitle: "看看什么样的人，更容易让你真正放松下来",
    category: "关系",
    state: "example",
    stateLabel: "暂未开放",
    stateColor: "#E8816A",
    statusDesc: "灵魂伴侣画像暂时还不能使用。想看两个人的相处方式，可以先使用两人合盘。",
  },
];

const FILTER_TABS: FilterTab[] = ["全部", "关系", "日常", "探索"];

// ─── SVG Icon Components ───────────────────────────────────────────────────────
function CompatToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="10" cy="14" r="7" stroke="rgba(107,191,160,0.55)" strokeWidth="1.2" />
      <circle cx="18" cy="14" r="7" stroke="rgba(192,172,222,0.55)" strokeWidth="1.2" />
      <text x="10" y="14.5" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="'Noto Serif SC', serif" fontWeight="700" fill="#6BBFA0">木</text>
      <text x="18" y="14.5" textAnchor="middle" dominantBaseline="middle" fontSize="6" fontFamily="'Noto Serif SC', serif" fontWeight="700" fill="#C0ACDE">火</text>
    </svg>
  );
}

function NatalToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" stroke="rgba(123,189,224,0.45)" strokeWidth="1" />
      {[0,1,2,3,4,5,6,7,8,9,10,11].map(i => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        return <circle key={i} cx={14 + 9 * Math.cos(a)} cy={14 + 9 * Math.sin(a)} r="1" fill="rgba(123,189,224,0.70)" />;
      })}
      <line x1="14" y1="14" x2={14 + 7 * Math.cos(-Math.PI / 2)} y2={14 + 7 * Math.sin(-Math.PI / 2)} stroke="#7BBDE0" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="14" cy="14" r="2" fill="rgba(123,189,224,0.25)" stroke="#7BBDE0" strokeWidth="0.8" />
    </svg>
  );
}

function PersonalityToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <polygon points="14,3 25,21 3,21" stroke="rgba(192,172,222,0.55)" strokeWidth="1.2" fill="none" />
      <line x1="14" y1="3" x2="14" y2="21" stroke="rgba(232,129,106,0.35)" strokeWidth="0.8" />
      <line x1="14" y1="3" x2="3" y2="21" stroke="rgba(107,191,160,0.35)" strokeWidth="0.8" />
      <line x1="14" y1="3" x2="25" y2="21" stroke="rgba(123,189,224,0.35)" strokeWidth="0.8" />
      <circle cx="14" cy="14" r="3" fill="rgba(192,172,222,0.30)" stroke="#C0ACDE" strokeWidth="0.8" />
    </svg>
  );
}

function QaToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="13" r="9" stroke="rgba(123,189,224,0.45)" strokeWidth="1.2" />
      <circle cx="14" cy="13" r="5.5" stroke="rgba(123,189,224,0.25)" strokeWidth="0.8" strokeDasharray="2 1.5" />
      <text x="14" y="13.5" textAnchor="middle" dominantBaseline="middle" fontSize="9" fontFamily="'Noto Serif SC', serif" fontWeight="700" fill="#7BBDE0">问</text>
      <path d="M10 22 L14 25 L18 22" fill="rgba(123,189,224,0.25)" stroke="rgba(123,189,224,0.45)" strokeWidth="0.8" />
    </svg>
  );
}

function TarotToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <rect x="7" y="2" width="14" height="20" rx="3" stroke="rgba(192,172,222,0.50)" strokeWidth="1.2" />
      <path d="M14 7 L15.5 11 L20 11 L16.5 13.5 L18 17.5 L14 15 L10 17.5 L11.5 13.5 L8 11 L12.5 11 Z" fill="rgba(233,201,126,0.40)" stroke="rgba(233,201,126,0.65)" strokeWidth="0.7" />
    </svg>
  );
}

function NumerologyToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="14" cy="14" r="11" stroke="rgba(192,172,222,0.35)" strokeWidth="1" />
      <text x="9" y="11" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontFamily="'Noto Sans SC', sans-serif" fill="rgba(107,96,136,0.70)">7</text>
      <text x="19" y="11" textAnchor="middle" dominantBaseline="middle" fontSize="8" fontFamily="'Noto Sans SC', sans-serif" fill="rgba(107,96,136,0.50)">3</text>
      <text x="14" y="18" textAnchor="middle" dominantBaseline="middle" fontSize="10" fontFamily="'Noto Sans SC', sans-serif" fontWeight="700" fill="#C0ACDE">9</text>
    </svg>
  );
}

function ArchetypeToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <ellipse cx="14" cy="13" rx="8" ry="9" stroke="rgba(192,172,222,0.50)" strokeWidth="1.2" />
      <path d="M9 13 Q14 9 19 13" stroke="rgba(192,172,222,0.65)" strokeWidth="0.9" fill="none" />
      <circle cx="11" cy="11" r="1.5" fill="rgba(192,172,222,0.60)" />
      <circle cx="17" cy="11" r="1.5" fill="rgba(192,172,222,0.60)" />
      <path d="M10 17 Q14 20 18 17" stroke="rgba(232,129,106,0.50)" strokeWidth="0.9" fill="none" />
    </svg>
  );
}

function SoulmateToolIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
      <circle cx="8" cy="12" r="4" stroke="rgba(232,129,106,0.45)" strokeWidth="1" fill="none" />
      <circle cx="20" cy="12" r="4" stroke="rgba(192,172,222,0.45)" strokeWidth="1" fill="none" />
      <line x1="12" y1="12" x2="16" y2="12" stroke="rgba(233,201,126,0.60)" strokeWidth="1" strokeDasharray="1.5 1" />
      <circle cx="8" cy="21" r="1.5" fill="rgba(232,129,106,0.55)" />
      <circle cx="20" cy="21" r="1.5" fill="rgba(192,172,222,0.55)" />
      <line x1="8" y1="21" x2="20" y2="21" stroke="rgba(233,201,126,0.40)" strokeWidth="0.8" />
    </svg>
  );
}

function ToolIcon({ iconKey }: { iconKey: ToolIconKey }) {
  if (iconKey === "compat") return <CompatToolIcon />;
  if (iconKey === "natal") return <NatalToolIcon />;
  if (iconKey === "personality") return <PersonalityToolIcon />;
  if (iconKey === "qa") return <QaToolIcon />;
  if (iconKey === "tarot") return <TarotToolIcon />;
  if (iconKey === "numerology") return <NumerologyToolIcon />;
  if (iconKey === "archetype") return <ArchetypeToolIcon />;
  return <SoulmateToolIcon />;
}

const ICON_BG: Record<ToolIconKey, string> = {
  compat:      "linear-gradient(135deg, #E4F5EC, #D0EEE3)",
  natal:       "linear-gradient(135deg, #E8F3FC, #D4EAFA)",
  personality: "linear-gradient(135deg, #EEE8FA, #E4DCFA)",
  qa:          "linear-gradient(135deg, #E6F4FC, #D8EDFA)",
  tarot:       "linear-gradient(135deg, #EDE8F8, #E2DAF5)",
  numerology:  "linear-gradient(135deg, #F0ECFC, #E6E0F8)",
  archetype:   "linear-gradient(135deg, #F3EEF8, #EBE4F4)",
  soulmate:    "linear-gradient(135deg, #FCEEE9, #F8E4DC)",
};

// ─── Glass helpers ─────────────────────────────────────────────────────────────
const glassBase: React.CSSProperties = {
  background: "rgba(255,255,255,0.74)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
  border: "1px solid rgba(255,255,255,0.88)",
};

function PressCard({
  children, onClick, style,
}: { children: React.ReactNode; onClick?: () => void; style?: React.CSSProperties }) {
  const [pressed, setPressed] = useState(false);
  const cardStyle: React.CSSProperties = {
    ...glassBase,
    borderRadius: 20,
    boxShadow: pressed ? "0 2px 8px rgba(160,130,200,0.08)" : "0 4px 18px rgba(160,130,200,0.11)",
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
        ...cardStyle, width: "100%", color: "inherit", font: "inherit", textAlign: "left",
      }}
    >{children}</button>
  );
}

// ─── Wide available tool card (half width) ────────────────────────────────────
function WideToolCard({ tool, onClick }: { tool: ToolDef; onClick: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        flex: "1 1 calc(50% - 5px)",
        minWidth: 0,
        ...glassBase,
        borderRadius: 18,
        padding: "16px 14px",
        boxShadow: pressed ? "0 2px 8px rgba(160,130,200,0.06)" : "0 4px 16px rgba(160,130,200,0.10)",
        transform: pressed ? "scale(0.978)" : "scale(1)",
        transition: "all 0.13s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        gap: 10,
        color: "inherit", font: "inherit", textAlign: "left",
      }}
    >
      <div style={{
        width: 44, height: 44, borderRadius: 13,
        background: ICON_BG[tool.iconKey],
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
      }}>
        <ToolIcon iconKey={tool.iconKey} />
      </div>
      <div>
        <div style={{
          fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500, color: "#28253D", marginBottom: 4,
        }}>{tool.title}</div>
        <div style={{
          fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#7B6E90", lineHeight: 1.5,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        } as React.CSSProperties}>{tool.subtitle}</div>
      </div>
      <span style={{
        alignSelf: "flex-start",
        padding: "2.5px 9px", borderRadius: 20,
        fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
        color: tool.stateColor,
        background: `${tool.stateColor}16`,
        border: `1px solid ${tool.stateColor}30`,
      }}>{tool.stateLabel}</span>
    </button>
  );
}

// ─── Small unavailable tool card ──────────────────────────────────────────────
function SmallToolCard({ tool, onClick }: { tool: ToolDef; onClick: () => void }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      type="button"
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        flex: 1,
        background: "rgba(255,255,255,0.55)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.80)",
        borderRadius: 16,
        padding: "13px 12px",
        boxShadow: pressed ? "0 1px 4px rgba(160,130,200,0.05)" : "0 3px 12px rgba(160,130,200,0.08)",
        transform: pressed ? "scale(0.974)" : "scale(1)",
        transition: "all 0.13s ease",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
        color: "inherit", font: "inherit", textAlign: "left",
      }}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 11,
        background: ICON_BG[tool.iconKey],
        display: "flex", alignItems: "center", justifyContent: "center",
        opacity: 0.80,
      }}>
        <ToolIcon iconKey={tool.iconKey} />
      </div>
      <div style={{
        fontSize: 12.5, fontFamily: "'Noto Serif SC', serif",
        fontWeight: 500, color: "#3D3758",
      }}>{tool.title}</div>
      <span style={{
        padding: "2px 8px", borderRadius: 16,
        fontSize: 9.5, fontFamily: "'Noto Sans SC', sans-serif",
        color: tool.stateColor,
        background: `${tool.stateColor}14`,
        border: `1px solid ${tool.stateColor}28`,
      }}>{tool.stateLabel}</span>
    </button>
  );
}

// ─── Props ─────────────────────────────────────────────────────────────────────
interface Props {
  onBack: () => void;
  onGoToComp: () => void;
  onGoToNatal: () => void;
  onGoToPersonality: () => void;
  onGoToChat: () => void;
  onOpenToolStatus: (data: ToolStatusData) => void;
  onGoToCombinedInsight: () => void;
  onGoToRecords: () => void;
  profileName: string;
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function ToolsHubScreen({
  onBack, onGoToComp, onGoToNatal, onGoToPersonality, onGoToChat, onOpenToolStatus, onGoToCombinedInsight, onGoToRecords, profileName,
}: Props) {
  const [activeTab, setActiveTab] = useState<FilterTab>("全部");
  const [searchQuery, setSearchQuery] = useState("");

  function handleToolTap(tool: ToolDef) {
    if (tool.state === "available") {
      if (tool.id === "compat") onGoToComp();
      else if (tool.id === "natal") onGoToNatal();
      else if (tool.id === "personality") onGoToPersonality();
      else if (tool.id === "qa") onGoToChat();
    } else {
      onOpenToolStatus({
        name: tool.title,
        statusLabel: tool.stateLabel,
        statusColor: tool.stateColor,
        description: tool.statusDesc,
      });
    }
  }

  const q = searchQuery.trim().toLowerCase();
  const filtered = TOOLS.filter(t => releasedToolIds.has(t.id)).filter(t => {
    const matchesTab = activeTab === "全部" || t.category === activeTab;
    const matchesSearch = q === "" || t.title.includes(q) || t.subtitle.includes(q);
    return matchesTab && matchesSearch;
  });

  const availableTools = filtered.filter(t => t.state === "available");
  const unavailableTools = filtered.filter(t => t.state !== "available");

  const showBanner = filtered.some(t => t.id === "compat") && (activeTab === "全部" || activeTab === "关系");

  const [bannerPressed, setBannerPressed] = useState(false);

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 44%, #FDF4F1 100%)",
      overflowY: "auto", overflowX: "hidden",
      scrollbarWidth: "none",
    }}>
      {/* Status bar */}
      <div style={{ height: 52 }} />

      {/* ── Header ── */}
      <div style={{ padding: "0 22px 16px" }}>
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
          <div style={{
            fontSize: 22, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 700, color: "#28253D", letterSpacing: "0.04em",
          }}>想先看哪件事？</div>
        </div>
        <div style={{
          fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#9088A8", marginLeft: 44,
        }}>从感情、工作或最近的状态开始，选一个你最在意的</div>
      </div>

      {/* ── Search bar ── */}
      <div style={{ padding: "0 18px 14px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          padding: "10px 16px",
          ...glassBase,
          borderRadius: 16,
          boxShadow: "0 3px 14px rgba(160,130,200,0.09)",
        }}>
          <span style={{ fontSize: 14, color: "#B0A4C6", flexShrink: 0 }}>◎</span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="搜索关系、性格或当下状态"
            style={{
              flex: 1, border: "none", background: "transparent",
              fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#28253D", outline: "none",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "none", border: "none", cursor: "pointer",
                fontSize: 13, color: "#B0A4C6", padding: 0, flexShrink: 0,
              }}
            >✕</button>
          )}
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div style={{ paddingLeft: 18, marginBottom: 18, overflowX: "auto", scrollbarWidth: "none" }}>
        <div style={{ display: "flex", gap: 8, paddingRight: 18 }}>
          {FILTER_TABS.map(tab => {
            const isActive = tab === activeTab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: "6px 16px", borderRadius: 20, flexShrink: 0,
                  background: isActive ? "rgba(107,191,160,0.14)" : "rgba(255,255,255,0.62)",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  border: isActive ? "1.5px solid rgba(107,191,160,0.40)" : "1px solid rgba(255,255,255,0.88)",
                  fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                  fontWeight: isActive ? 500 : 400,
                  color: isActive ? "#3D9E7E" : "#9088A8",
                  cursor: "pointer",
                  transition: "all 0.18s ease",
                  boxShadow: isActive ? "0 2px 10px rgba(107,191,160,0.18)" : "0 2px 8px rgba(160,130,200,0.07)",
                }}
              >{tab}</button>
            );
          })}
        </div>
      </div>

      {/* ── 高阶合参 featured card — always visible, above filters ── */}
      {releaseFeatures.combinedInsight && (activeTab === "全部" || activeTab === "探索") && q === "" && (
        <div style={{ padding: "0 18px 16px" }}>
          <button type="button" onClick={onGoToCombinedInsight} style={{
            borderRadius: 22, padding: "18px 20px",
            background: "linear-gradient(145deg, rgba(238,233,248,0.88) 0%, rgba(255,255,255,0.80) 60%, rgba(220,238,248,0.70) 100%)",
            backdropFilter: "blur(22px) saturate(180%)",
            WebkitBackdropFilter: "blur(22px) saturate(180%)",
            border: "1.5px solid rgba(192,172,222,0.42)",
            boxShadow: "0 6px 28px rgba(160,130,200,0.16)",
            cursor: "pointer",
            width: "100%", color: "inherit", textAlign: "left",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%", background: "#C0ACDE",
                boxShadow: "0 0 5px rgba(192,172,222,0.60)",
              }} />
              <span style={{
                fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: 500, color: "#8060C0", letterSpacing: "0.06em",
              }}>高阶工具</span>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
              <div style={{
                width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                background: "linear-gradient(135deg, #E8E0FA, #D8D0F2)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 20, fontFamily: "'Noto Serif SC', serif",
                fontWeight: 700, color: "#6040A0",
                boxShadow: "0 3px 12px rgba(160,130,200,0.22)",
              }}>合</div>
              <div>
                <div style={{ fontSize: 18, fontFamily: "'Noto Serif SC', serif", fontWeight: 700, color: "#28253D", marginBottom: 3 }}>
                  高阶合参
                </div>
                <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#7B6E90" }}>
                  三体系交叉验证 · 结论来源清晰
                </div>
              </div>
            </div>

            <div style={{
              fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#4A4168", lineHeight: 1.68, marginBottom: 14,
            }}>
              用八字、紫微、奇门分别形成证据，再合并分歧，给你一个说得清来源的结论。适合在重要决定前梳理清楚。
            </div>

            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 12, borderTop: "1px solid rgba(192,172,222,0.18)",
            }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["八字", "紫微", "奇门"].map(sys => (
                  <span key={sys} style={{
                    padding: "3px 10px", borderRadius: 16,
                    fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
                    color: "#8060C0", background: "rgba(192,172,222,0.16)",
                    border: "1px solid rgba(192,172,222,0.28)",
                  }}>{sys}</span>
                ))}
              </div>
              <div style={{
                padding: "7px 16px", borderRadius: 20,
                background: "linear-gradient(135deg, #8060C0, #A080E0)",
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: 500, color: "#fff",
                boxShadow: "0 3px 12px rgba(128,96,192,0.30)",
              }}>开始合参 →</div>
            </div>
          </button>
        </div>
      )}

      {/* ── Empty state ── */}
      {filtered.length === 0 && (
        <div style={{ padding: "0 18px 20px" }}>
          <div style={{
            ...glassBase,
            borderRadius: 20,
            padding: "36px 24px",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.35 }}>◎</div>
            <div style={{
              fontSize: 15, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 500, color: "#28253D", marginBottom: 8,
            }}>没有找到匹配的工具</div>
            <div style={{
              fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#9088A8", lineHeight: 1.6,
            }}>试试换一个关键词或分类</div>
          </div>
        </div>
      )}

      {/* ── Featured banner: 两人合盘 ── */}
      {showBanner && (
        <div style={{ padding: "0 18px 16px" }}>
          <button
            type="button"
            onClick={onGoToComp}
            onPointerDown={() => setBannerPressed(true)}
            onPointerUp={() => setBannerPressed(false)}
            onPointerLeave={() => setBannerPressed(false)}
            style={{
              borderRadius: 24, overflow: "hidden",
              background: "linear-gradient(140deg, rgba(255,255,255,0.88) 0%, rgba(228,245,236,0.82) 55%, rgba(230,235,250,0.80) 100%)",
              backdropFilter: "blur(22px) saturate(180%)",
              WebkitBackdropFilter: "blur(22px) saturate(180%)",
              border: "1px solid rgba(255,255,255,0.92)",
              boxShadow: bannerPressed ? "0 2px 10px rgba(107,191,160,0.12)" : "0 6px 28px rgba(107,191,160,0.16)",
              transform: bannerPressed ? "scale(0.984)" : "scale(1)",
              transition: "all 0.14s ease",
              cursor: "pointer",
              padding: "22px 22px 20px",
              width: "100%", color: "inherit", textAlign: "left",
            }}
          >
            {/* Eyebrow */}
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
              <div style={{
                width: 5, height: 5, borderRadius: "50%",
                background: "#6BBFA0",
                boxShadow: "0 0 5px rgba(107,191,160,0.55)",
              }} />
              <span style={{
                fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: 500, color: "#4A9E7E", letterSpacing: "0.06em",
              }}>精选工具</span>
            </div>

            {/* Dual profile visual */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
              <div style={{ display: "flex", alignItems: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #6BBFA0DD, #6BBFA077)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#fff",
                  fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                  border: "2px solid rgba(255,255,255,0.90)",
                  boxShadow: "0 3px 10px rgba(107,191,160,0.28)",
                }}>{profileName.trim().slice(0, 1) || "我"}</div>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%",
                  background: "linear-gradient(135deg, #E8816ADD, #E8816A77)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, color: "#fff",
                  fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                  border: "2px solid rgba(255,255,255,0.90)",
                  boxShadow: "0 3px 10px rgba(232,129,106,0.28)",
                  marginLeft: -12,
                }}>+</div>
              </div>
              <div>
                <div style={{
                  fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
                  color: "#6B8E7E", marginBottom: 2,
                }}>{profileName} × 另一份档案</div>
                <div style={{
                  fontSize: 20, fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 700, color: "#28253D",
                }}>两人合盘</div>
              </div>
            </div>

            {/* Conclusion */}
            <div style={{
              fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#4A4168", lineHeight: 1.65, marginBottom: 18,
            }}>
              选择另一份真实档案后，先看你们为什么靠近，再看哪些误会总会反复出现。
            </div>

            {/* CTA */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              paddingTop: 14, borderTop: "1px solid rgba(107,191,160,0.15)",
            }}>
              <span style={{
                fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#8BBBA8",
              }}>还没有关系报告</span>
              <div style={{
                padding: "7px 18px", borderRadius: 20,
                background: "linear-gradient(135deg, #6BBFA0, #7BBDE0)",
                fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
                fontWeight: 500, color: "#fff",
                boxShadow: "0 3px 12px rgba(107,191,160,0.30)",
              }}>开始合盘 →</div>
            </div>
          </button>
        </div>
      )}

      {/* ── Available tools (wide side-by-side cards) ── */}
      {availableTools.filter(t => t.id !== "compat" || !showBanner).length > 0 && (
        <div style={{ padding: "0 18px 16px" }}>
          <div style={{
            fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 500, color: "#9088A8", letterSpacing: "0.06em",
            marginBottom: 10,
          }}>现在可以看</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {availableTools
              .filter(t => t.id !== "compat" || !showBanner)
              .map(tool => (
                <WideToolCard key={tool.id} tool={tool} onClick={() => handleToolTap(tool)} />
              ))}
          </div>
        </div>
      )}

      {/* ── Unavailable tools (small grid) ── */}
      {unavailableTools.length > 0 && (
        <div style={{ padding: "0 18px 16px" }}>
          <div style={{
            fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: 500, color: "#9088A8", letterSpacing: "0.06em",
            marginBottom: 10,
          }}>更多功能陆续开放</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {unavailableTools.map(tool => (
              <div key={tool.id} style={{ flexBasis: "calc(50% - 5px)", flexGrow: 1, maxWidth: "calc(50% - 5px)" }}>
                <SmallToolCard tool={tool} onClick={() => handleToolTap(tool)} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Current available entry ── */}
      <div style={{ padding: "8px 18px 8px" }}>
        <div style={{
          fontSize: 13, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 500, color: "#28253D", marginBottom: 10,
        }}>接着往下看</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {[
            { iconKey: "natal" as ToolIconKey, label: `继续看 ${profileName} 的完整星盘`, time: "接着看" },
          ].map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "10px 14px", borderRadius: 14,
              background: "rgba(255,255,255,0.52)",
              border: "1px solid rgba(255,255,255,0.82)",
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: 9,
                background: ICON_BG[item.iconKey],
                display: "flex", alignItems: "center", justifyContent: "center",
                flexShrink: 0,
              }}>
                <ToolIcon iconKey={item.iconKey} />
              </div>
              <div style={{
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#7B6E90", flex: 1,
              }}>{item.label}</div>
              <div style={{
                fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#B0A4C6", flexShrink: 0,
              }}>{item.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── My records entry ── */}
      <div style={{ padding: "14px 18px 28px" }}>
        <PressCard onClick={onGoToRecords} style={{ padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 12, flexShrink: 0,
              background: "linear-gradient(135deg, #FFF0EC, #FDDDD6)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 16,
            }}>◈</div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: 14, fontFamily: "'Noto Serif SC', serif",
                fontWeight: 500, color: "#28253D",
              }}>合盘记录</div>
              <div style={{
                fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#9088A8", marginTop: 2,
              }}>查看已经保存的关系分析</div>
            </div>
            <span style={{ fontSize: 13, color: "#C0B4D8" }}>→</span>
          </div>
        </PressCard>
      </div>

      {/* Bottom nav spacer */}
      <div style={{ height: 86 }} />
    </div>
  );
}
