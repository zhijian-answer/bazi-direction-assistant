"use client";

import { useEffect, useMemo, useState, type ReactNode, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import {
  activateDemoProfile,
  saveMobileProfile,
  setActiveMobileProfile,
  useMobileProfiles,
  useMobileProfileState,
} from "@/lib/mobile/profile";
import { getDailyInsight } from "@/lib/mobile/dailyInsightCatalog";
import { buildMobileQuestions } from "@/lib/mobile/buildMobileQuestions";
import { buildMobileBaziReport } from "@/lib/mobile/buildMobileBaziReport";
import { buildMobileZodiacReport } from "@/lib/mobile/buildMobileZodiacReport";
import { mobileProfileToZiweiInput } from "@/lib/mobile/ziweiAdapter";
import { calculateZiweiInsight } from "@/lib/ziwei/service";
import type { ZiweiCalculationResult } from "@/lib/ziwei/contracts";
import BaziScreen from "./BaziScreen";
import CompatibilityScreen from "./CompatibilityScreen";
import PersonalityScreen from "./PersonalityScreen";
import NatalChartScreen from "./NatalChartScreen";
import ZiweiScreen from "./ZiweiScreen";
import WelcomeScreen from "./WelcomeScreen";
import CreateProfileScreen, { type ProfileFormData } from "./CreateProfileScreen";
import GeneratingScreen from "./GeneratingScreen";
import ProfileScreen from "./ProfileScreen";
import ProfileSwitcherSheet, { type ProfileEntry } from "./ProfileSwitcherSheet";
import LoginInfoSheet from "./LoginInfoSheet";
import SharePosterSheet, { type PosterContent, type PosterContentType } from "./SharePosterSheet";
import UIStatesScreen from "./UIStatesScreen";
import ReportHubScreen from "./ReportHubScreen";
import ToolsHubScreen from "./ToolsHubScreen";
import CombinedInsightScreen from "./CombinedInsightScreen";
import ToolStatusSheet, { type ToolStatusData } from "./ToolStatusSheet";
import QuestionInsightSheet, { type Question } from "./QuestionInsightSheet";
import { buildFigmaBaziViewModel, buildFigmaNatalViewModel, buildFigmaZiweiViewModel } from "./viewModels";

export type FigmaV22Screen =
  | "home" | "bazi" | "comp" | "personality" | "natal" | "ziwei"
  | "welcome" | "create-profile" | "generating" | "profile" | "ui-states"
  | "report-hub" | "tools-hub" | "combined-insight";

// ─── Types ────────────────────────────────────────────────────────────────────
interface PressableProps {
  children: ReactNode;
  style?: CSSProperties;
  onClick?: () => void;
}

// ─── Orbit Instrument ─────────────────────────────────────────────────────────
// Scaled down to 170×170 so it anchors the hero without crowding text.
function OrbitInstrument({ size = 170 }: { size?: number }) {
  const cx = size / 2;
  const cy = size / 2;
  const scale = size / 220;
  const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const stems   = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];

  const R_OUTER  = 95  * scale;
  const R_MID    = 72  * scale;
  const R_INNER  = 50  * scale;
  const R_GLOW   = 26  * scale;
  const R_CENTER = 20  * scale;

  return (
    <div style={{ width: size, height: size, position: "relative", flexShrink: 0 }}>
      {/* Soft ambient glow behind the SVG */}
      <div style={{
        position: "absolute", inset: -12,
        background: "radial-gradient(ellipse, rgba(232,129,106,0.16) 0%, rgba(107,191,160,0.10) 50%, transparent 72%)",
        borderRadius: "50%", pointerEvents: "none",
      }} />

      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ overflow: "visible" }}>
        <defs>
          <radialGradient id="orb-center" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#F5C4B8" stopOpacity="0.88" />
            <stop offset="55%"  stopColor="#FAF8F5" stopOpacity="0.65" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="orb-gold" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="#E9C97E" stopOpacity="0.40" />
            <stop offset="100%" stopColor="#E9C97E" stopOpacity="0" />
          </radialGradient>
          <filter id="blur-sm"><feGaussianBlur stdDeviation="1.2" /></filter>
        </defs>

        {/* Outer branch ring — rotates slowly */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "orbit-slow 90s linear infinite" }}>
          <circle cx={cx} cy={cy} r={R_OUTER} fill="none"
            stroke="rgba(192,172,222,0.20)" strokeWidth={1} />
          {branches.map((b, i) => {
            const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
            const dotR = R_OUTER - 8 * scale;
            const txtR = R_OUTER + 2 * scale;
            const highlight = i === 2; // 寅 — active branch today
            return (
              <g key={b}>
                <circle
                  cx={cx + dotR * Math.cos(a)} cy={cy + dotR * Math.sin(a)}
                  r={1.8 * scale}
                  fill={highlight ? "#E8816A" : "rgba(192,172,222,0.55)"} />
                <text
                  x={cx + txtR * Math.cos(a)} y={cy + txtR * Math.sin(a)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={8.5 * scale} fontFamily="'Noto Serif SC', serif"
                  fill={highlight ? "#E8816A" : "rgba(107,96,136,0.65)"}>
                  {b}
                </text>
              </g>
            );
          })}
        </g>

        {/* Middle stem ring — counter-rotates */}
        <g style={{ transformOrigin: `${cx}px ${cy}px`, animation: "orbit-mid 60s linear infinite reverse" }}>
          <circle cx={cx} cy={cy} r={R_MID} fill="none"
            stroke="rgba(107,191,160,0.22)" strokeWidth={1} strokeDasharray={`${3*scale} ${5*scale}`} />
          {stems.map((s, i) => {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            const isFirst = i === 0;
            return (
              <text key={s}
                x={cx + R_MID * Math.cos(a)} y={cy + R_MID * Math.sin(a)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={8 * scale} fontFamily="'Noto Serif SC', serif"
                fontWeight={isFirst ? "700" : "400"}
                fill={isFirst ? "#6BBFA0" : "rgba(107,96,136,0.55)"}>
                {s}
              </text>
            );
          })}
        </g>

        {/* Inner decorative ring with tick marks */}
        <circle cx={cx} cy={cy} r={R_INNER} fill="url(#orb-center)"
          stroke="rgba(232,129,106,0.18)" strokeWidth={1.4} />
        {Array.from({ length: 24 }).map((_, i) => {
          const a = (i / 24) * Math.PI * 2;
          const r1 = R_INNER - 2 * scale;
          const r2 = R_INNER - (i % 6 === 0 ? 9 : 5) * scale;
          return (
            <line key={i}
              x1={cx + r1 * Math.cos(a)} y1={cy + r1 * Math.sin(a)}
              x2={cx + r2 * Math.cos(a)} y2={cy + r2 * Math.sin(a)}
              stroke={i % 6 === 0 ? "rgba(232,129,106,0.50)" : "rgba(192,172,222,0.28)"}
              strokeWidth={i % 6 === 0 ? 1.4 * scale : 0.7 * scale} />
          );
        })}

        {/* Gold center glow */}
        <circle cx={cx} cy={cy} r={R_GLOW} fill="url(#orb-gold)" filter="url(#blur-sm)" />
        <circle cx={cx} cy={cy} r={R_CENTER}
          fill="rgba(255,255,255,0.88)"
          stroke="rgba(233,201,126,0.50)" strokeWidth={1.4} />

        {/* Central glyph */}
        <text x={cx} y={cy - 0.5}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={13 * scale} fontFamily="'Noto Serif SC', serif" fontWeight="500"
          fill="#28253D">
          命
        </text>

        {/* Animated orbital dot */}
        <circle style={{ transformOrigin: `${cx}px ${cy}px`, animation: "orbit-dot 12s linear infinite" }}
          cx={cx + R_MID} cy={cy} r={3.5 * scale} fill="#E8816A" opacity="0.88" />

        {/* Fixed accent dots at corners */}
        {[0, 1, 2].map(i => {
          const a = (i / 3) * Math.PI * 2 - Math.PI / 6;
          return (
            <circle key={i}
              cx={cx + R_INNER * Math.cos(a)} cy={cy + R_INNER * Math.sin(a)}
              r={2.2 * scale}
              fill={["#E8816A","#6BBFA0","#E9C97E"][i]} opacity="0.72" />
          );
        })}
      </svg>
    </div>
  );
}

// ─── Glass Card ───────────────────────────────────────────────────────────────
function GlassCard({ children, style, onClick }: PressableProps) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        background: "rgba(255,255,255,0.74)",
        backdropFilter: "blur(22px) saturate(180%)",
        WebkitBackdropFilter: "blur(22px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.88)",
        borderRadius: 24,
        boxShadow: pressed
          ? "0 2px 10px rgba(160,130,200,0.10)"
          : "0 6px 28px rgba(160,130,200,0.14), 0 1px 3px rgba(180,140,200,0.08)",
        transform: pressed ? "scale(0.986)" : "scale(1)",
        transition: "transform 0.14s ease, box-shadow 0.14s ease",
        cursor: onClick ? "pointer" : "default",
        ...style,
      }}>
      {children}
    </div>
  );
}

// ─── Profile Switcher ─────────────────────────────────────────────────────────
type ProfileChip = { id: string; name: string; element: string; color: string };

function ProfileSwitcher({ onAdd, profiles, activeProfileId, onSelect }: {
  onAdd: () => void;
  profiles: ProfileChip[];
  activeProfileId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
      {profiles.map((p) => (
        <button key={p.id} onClick={() => onSelect(p.id)} style={{
          display: "flex", alignItems: "center", gap: 7,
          padding: "5px 13px 5px 6px", borderRadius: 24,
          border: activeProfileId === p.id ? `1.5px solid ${p.color}88` : "1.5px solid rgba(180,160,210,0.22)",
          background: activeProfileId === p.id ? `${p.color}16` : "rgba(255,255,255,0.52)",
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          cursor: "pointer", transition: "all 0.2s ease",
        }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: `linear-gradient(135deg, ${p.color}DD, ${p.color}77)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, color: "#fff",
            fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
          }}>{p.element}</div>
          <span style={{
            fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
            fontWeight: activeProfileId === p.id ? 500 : 400,
            color: activeProfileId === p.id ? "#28253D" : "#6B607E",
          }}>{p.name}</span>
        </button>
      ))}
      <button onClick={onAdd} style={{
        width: 30, height: 30, borderRadius: "50%",
        border: "1.5px dashed rgba(180,160,210,0.38)",
        background: "rgba(238,233,248,0.55)",
        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 16, color: "#C0ACDE",
      }}>+</button>
    </div>
  );
}

// ─── Report Entry ─────────────────────────────────────────────────────────────
function ReportEntry({ icon, title, subtitle, tag, gradient, onClick }: {
  icon: string; title: string; subtitle: string; tag: string; gradient: string; onClick?: () => void;
}) {
  const [pressed, setPressed] = useState(false);
  return (
    <div
      onClick={onClick}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        display: "flex", alignItems: "center", gap: 14, padding: "15px 18px",
        borderRadius: 18,
        background: "rgba(255,255,255,0.68)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: "1px solid rgba(255,255,255,0.88)",
        boxShadow: pressed ? "0 2px 8px rgba(160,130,200,0.07)" : "0 4px 18px rgba(160,130,200,0.10)",
        transform: pressed ? "scale(0.982)" : "scale(1)",
        transition: "all 0.14s ease", cursor: "pointer",
      }}>
      <div style={{
        width: 46, height: 46, borderRadius: 13, background: gradient, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
        boxShadow: "0 3px 10px rgba(0,0,0,0.07)",
      }}>{icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 14.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", marginBottom: 3 }}>
          {title}
        </div>
        <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#6B5E82", lineHeight: 1.45, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {subtitle}
        </div>
      </div>
      <div style={{
        padding: "3px 10px", borderRadius: 20, flexShrink: 0,
        fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
        color: "#6B607E", background: "rgba(238,233,248,0.72)",
        border: "1px solid rgba(192,172,222,0.22)",
      }}>{tag}</div>
    </div>
  );
}

// ─── Bottom Navigation ────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { label: "今日", symbol: "◎" },
  { label: "报告", symbol: "◈" },
  { label: "工具", symbol: "⊛" },
  { label: "我的", symbol: "◉" },
];

function BottomNav({ active, onChange }: { active: number; onChange: (i: number) => void }) {
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      /* Fixed height: nav bar + iOS safe-area bottom (approximated at 34px) */
      paddingBottom: 28,
      background: "rgba(250,248,245,0.85)",
      backdropFilter: "blur(26px) saturate(200%)",
      WebkitBackdropFilter: "blur(26px) saturate(200%)",
      borderTop: "1px solid rgba(255,255,255,0.92)",
      boxShadow: "0 -4px 20px rgba(160,130,200,0.10)",
      display: "flex", alignItems: "flex-start", paddingTop: 10,
      zIndex: 50,
    }}>
      {NAV_ITEMS.map((item, i) => {
        const isActive = active === i;
        return (
          <button key={item.label} onClick={() => onChange(i)} style={{
            flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            background: "none", border: "none", cursor: "pointer", padding: "4px 0",
            transform: isActive ? "scale(1.08)" : "scale(1)",
            transition: "transform 0.15s ease",
          }}>
            <div style={{
              width: 38, height: 28, borderRadius: 10,
              background: isActive ? "rgba(232,129,106,0.14)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 17, color: isActive ? "#E8816A" : "#B8AAD0",
              transition: "all 0.2s ease",
            }}>{item.symbol}</div>
            <span style={{
              fontSize: 10, fontFamily: "'Noto Sans SC', sans-serif",
              fontWeight: isActive ? 500 : 400,
              color: isActive ? "#E8816A" : "#A094B8",
              letterSpacing: "0.04em",
            }}>{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Observation Chip ─────────────────────────────────────────────────────────
function ObservationChip({ label, text, accent }: { label: string; text: string; accent: string }) {
  const [pressed, setPressed] = useState(false);
  return (
    <button
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      style={{
        flex: 1, padding: "14px 13px", borderRadius: 17,
        border: `1px solid ${accent}28`,
        background: `${accent}0C`,
        backdropFilter: "blur(10px)", WebkitBackdropFilter: "blur(10px)",
        cursor: "pointer", textAlign: "left",
        transform: pressed ? "scale(0.96)" : "scale(1)",
        transition: "transform 0.12s ease",
      }}
    >
      <div style={{ fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif", color: accent, marginBottom: 6, fontWeight: 500, letterSpacing: "0.04em" }}>
        {label}
      </div>
      <div style={{ fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.58 }}>
        {text}
      </div>
    </button>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App({ initialScreen = "home", initialBaziTab = 0 }: { initialScreen?: FigmaV22Screen; initialBaziTab?: number }) {
  const router = useRouter();
  const { profile, hasProfile } = useMobileProfileState();
  const storedProfiles = useMobileProfiles();
  const [navActive, setNavActive] = useState(() => initialScreen === "report-hub" ? 1 : initialScreen === "tools-hub" ? 2 : initialScreen === "profile" ? 3 : 0);
  const [screen, setScreen] = useState<FigmaV22Screen>(initialScreen);

  // ── Onboarding state ──
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);

  // ── Share poster sheet state ──
  const [posterOpen, setPosterOpen] = useState(false);
  const [posterType, setPosterType] = useState<PosterContentType>("今日提醒");
  function openPoster(type: PosterContentType) { setPosterType(type); setPosterOpen(true); }

  // ── Profile switcher sheet state ──
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [loginInfoOpen, setLoginInfoOpen] = useState(false);

  const profileChips = useMemo<ProfileChip[]>(() => storedProfiles.map((item, index) => ({
    id: item.id || `profile-${index}`,
    name: item.name || "未命名档案",
    element: item.isDemo ? "示" : item.name.trim().slice(0, 1) || "档",
    color: ["#6BBFA0", "#E8816A", "#7BBDE0", "#C0ACDE"][index % 4],
  })), [storedProfiles]);

  const dailyInsight = useMemo(() => {
    if (!hasProfile || !profile.birthDate) return null;
    try { return getDailyInsight(profile); } catch { return null; }
  }, [hasProfile, profile]);

  const baziOverview = useMemo(() => {
    if (!hasProfile || !profile.birthDate) return null;
    try { return buildMobileBaziReport(profile); } catch { return null; }
  }, [hasProfile, profile]);

  const baziViewModel = useMemo(() => {
    if (!hasProfile || !profile.birthDate) return null;
    try { return buildFigmaBaziViewModel(profile); } catch { return null; }
  }, [hasProfile, profile]);

  const zodiacOverview = useMemo(() => {
    if (!hasProfile || !profile.birthDate) return null;
    try { return buildMobileZodiacReport(profile); } catch { return null; }
  }, [hasProfile, profile]);

  const natalViewModel = useMemo(() => {
    if (!hasProfile || !profile.birthDate) return null;
    try { return buildFigmaNatalViewModel(profile); } catch { return null; }
  }, [hasProfile, profile]);

  const ziweiProfileKey = JSON.stringify([profile.calendarType, profile.birthDate, profile.birthTime, profile.birthTimeKnown, profile.gender, profile.isLeapMonth]);
  const [ziweiCalculation, setZiweiCalculation] = useState<{ key: string; result: ZiweiCalculationResult } | null>(null);

  useEffect(() => {
    if (screen !== "ziwei" || !hasProfile || !profile.birthDate) return;
    let active = true;
    calculateZiweiInsight(mobileProfileToZiweiInput(profile)).then((result) => {
      if (active) setZiweiCalculation({ key: ziweiProfileKey, result });
    });
    return () => { active = false; };
  }, [hasProfile, profile, screen, ziweiProfileKey]);

  const ziweiViewModel = useMemo(() => buildFigmaZiweiViewModel(
    profile,
    ziweiCalculation?.key === ziweiProfileKey ? ziweiCalculation.result : undefined,
  ), [profile, ziweiCalculation, ziweiProfileKey]);

  // Formal report pages use the Figma-authored editorial model directly.
  // AI narrative generation remains available for experiments, but must not
  // silently rewrite approved product copy.
  const presentedBaziViewModel = baziViewModel;
  const presentedNatalViewModel = natalViewModel;
  const presentedZiweiViewModel = ziweiViewModel;

  // ── Tool status sheet state ──
  const [toolStatusOpen, setToolStatusOpen] = useState(false);
  const [toolStatusData, setToolStatusData] = useState<ToolStatusData | null>(null);
  function openToolStatus(data: ToolStatusData) { setToolStatusData(data); setToolStatusOpen(true); }

  // ── Sheet state ──
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetQuestions, setSheetQuestions] = useState<Question[]>([]);
  const [sheetIndex, setSheetIndex] = useState(0);

  function openSheet(questions: Question[], index = 0) {
    setSheetQuestions(questions);
    setSheetIndex(index);
    setSheetOpen(true);
  }
  function closeSheet() { setSheetOpen(false); }
  function nextSheetQuestion() {
    setSheetIndex(i => (i + 1) % sheetQuestions.length);
  }

  // Home question (主卡片)
  const fallbackHomeQuestions: Question[] = [
    {
      id: "home-main",
      source: "来自生辰结构 · 仅供自我观察",
      title: "你最近总觉得自己想多了，但那个直觉其实是对的",
      answer: "你不是想得太多，而是习惯先把关系里的细节接住。真正让你累的，通常不是敏感本身，而是迟迟没有确认边界。",
      observations: [
        "留意你在什么时候会反复确认同一件事——那个位置通常是边界模糊的地方",
        "观察你「感觉不对劲」的直觉与最后发生的事情，两者吻合的频率有多高",
        "注意你每次说「没关系」的时候，内心是否真的觉得没关系",
      ],
      action: "找一件你一直「差不多接受」的事，用一句话写下你真正的感受。不需要给别人看，只是说清楚给自己。",
      boundary: "以上内容来自命理结构的参考解读，用于辅助自我观察，不代表任何预测或判断。",
    },
  ];

  function navigateTo(i: number) {
    const routes = ["/m", "/m/report", "/m/tools", "/m/profile"] as const;
    router.push(routes[i] ?? "/m");
  }
  // Generic back from any detail screen: return to hub or home based on which tab is active
  function goBackFromDetail() {
    if (initialScreen !== "home") {
      router.push("/m/report");
      return;
    }
    if (navActive === 1) setScreen("report-hub");
    else if (navActive === 2) setScreen("tools-hub");
    else setScreen("home");
  }
  const homeQuestions: Question[] = !hasProfile ? fallbackHomeQuestions : buildMobileQuestions("home", profile).map((item) => ({
      id: item.id,
      source: item.source,
      title: item.prompt,
      answer: item.interpretation,
      observations: [item.observation],
      action: item.action,
      boundary: "以上内容用于结构化自我观察，不代表事件预测，也不替代现实判断。",
    }));
  const activePosterQuestion = sheetQuestions[sheetIndex] || homeQuestions[0];
  const posterContent: Partial<Record<PosterContentType, PosterContent>> = {
    "今日提醒": {
      title: dailyInsight?.title || "先建立档案，再看今天的行动节奏",
      body: dailyInsight?.summary || "玄枢只展示能够从当前资料中得到的结构观察，不补写未知信息。",
      tags: dailyInsight ? [dailyInsight.keyword, dailyInsight.suitable, dailyInsight.avoid].filter(Boolean).slice(0, 3) : ["结构化观察", "行动建议"],
      accent: "#6BBFA0",
      accentLight: "rgba(107,191,160,0.15)",
    },
    "人格结论": {
      title: presentedBaziViewModel?.identityTitle || "当前生辰结构尚未生成",
      body: presentedBaziViewModel?.identitySummary || "完成出生档案后，这里会展示可以回到生活里验证的行为倾向。",
      tags: presentedBaziViewModel?.tags.slice(0, 3) || ["生辰结构", "自我观察"],
      accent: "#C0ACDE",
      accentLight: "rgba(192,172,222,0.15)",
    },
    "流盘观察": {
      title: baziViewModel?.flow.poster.title || "当前流盘尚未生成",
      body: baziViewModel?.flow.poster.body || "完成出生档案后，再查看时间结构与本命方式的关系。",
      tags: baziViewModel?.flow.poster.tags.slice(0, 3) || ["流年", "流月", "行动节奏"],
      accent: "#E8816A",
      accentLight: "rgba(232,129,106,0.15)",
    },
    "星座能量": {
      title: presentedNatalViewModel?.identityTitle || "当前星盘结构尚未生成",
      body: presentedNatalViewModel?.identitySummary || "补充出生日期后，可以查看星体位置与人格组合。",
      tags: presentedNatalViewModel?.core.map((item) => item.title).slice(0, 3) || ["本命星盘", "结构观察"],
      accent: "#7BBDE0",
      accentLight: "rgba(123,189,224,0.15)",
    },
    "紫微观察": {
      title: presentedZiweiViewModel.insight?.identity.title || "紫微结构尚未生成",
      body: presentedZiweiViewModel.insight?.identity.summary || "紫微需要准确出生时辰与明确性别；资料不足时不会使用默认时辰补盘。",
      tags: presentedZiweiViewModel.insight?.identity.tags.slice(0, 3) || ["紫微斗数", "资料边界"],
      accent: "#D4A054",
      accentLight: "rgba(212,160,84,0.15)",
    },
    "问题解读": {
      title: activePosterQuestion?.title || "从一个具体问题开始观察",
      body: activePosterQuestion?.answer || "问题解读会同时保留结构来源、可观察表现与行动建议。",
      tags: ["自我观察", "问题解读", profile.name || "当前档案"],
      accent: "#E8816A",
      accentLight: "rgba(232,129,106,0.15)",
    },
  };

  function goToBazi()        { router.push("/m/report/bazi"); }
  function goToComp()        { router.push("/m/compatibility"); }
  function goToPersonality() {
    openToolStatus({
      name: "性格测试",
      statusLabel: "内容校准中",
      statusColor: "#7BBDE0",
      description: "页面结构已经完成，题目、计分规则和结果解释还在校准。现在不会用示例人物或通用结论冒充你的测试结果。",
    });
  }
  function goToNatalReport() { router.push("/m/report/zodiac"); }
  function goToNatalTool()   { router.push("/m/chart"); }
  function goToFlow()        { router.push("/m/report/flow"); }
  function goToZiwei()       { router.push("/m/report/ziwei"); }
  function goToReportHub()      { router.push("/m/report"); }
  function goToCombinedInsight() {
    openToolStatus({
      name: "高阶合参",
      statusLabel: "证据引擎接入中",
      statusColor: "#8060C0",
      description: "八字与紫微的真实证据已经具备，奇门引擎、结论权重和体系冲突处理尚未接通。完整链路可追溯前，不展示模拟的高阶结论。",
    });
  }
  function goHome()          { navigateTo(0); }
  function goToUIStates()    { setScreen("ui-states"); }
  function goToWelcome()     { setScreen("welcome"); }
  function goToCreateProfile() { setScreen("create-profile"); }
  function goToGenerating(data: ProfileFormData) {
    setProfileData(data);
    const shichenHours = [23, 1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21];
    const hour = data.shichen >= 0 ? shichenHours[data.shichen] : 12;
    saveMobileProfile({
      name: data.name,
      gender: data.gender === "女" ? "female" : data.gender === "男" ? "male" : "other",
      calendarType: data.calType === "农历" ? "lunar" : "solar",
      birthDate: `${data.year}-${String(data.month).padStart(2, "0")}-${String(data.day).padStart(2, "0")}`,
      birthTime: data.shichen >= 0 ? `${String(hour).padStart(2, "0")}:00` : "",
      birthTimeKnown: data.shichen >= 0,
      isLeapMonth: false,
      birthPlace: data.citySkipped ? "" : data.city.trim(),
      isDemo: false,
      isLocalOnly: true,
      syncStatus: "local",
    });
    setScreen("generating");
  }
  function completeOnboarding() {
    setIsDemoMode(false);
    setScreen("home");
    setNavActive(0);
  }
  function startDemoMode() {
    activateDemoProfile();
    setIsDemoMode(true);
    setScreen("home");
    setNavActive(0);
  }

  const today = new Date();
  const months = today.getMonth() + 1;
  const days   = today.getDate();
  const weekDay = ["日","一","二","三","四","五","六"][today.getDay()];
  const activeScreen = !hasProfile && !isDemoMode ? "welcome" : screen;

  return (
    <div className="figma-v22-app" style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      minHeight: "100svh",
      background: "linear-gradient(140deg, #EDE8F8 0%, #E4F4EE 50%, #FCEEE9 100%)",
      fontFamily: "'Noto Sans SC', sans-serif",
    }}>
      {/* ── Phone shell ── */}
      <div className="figma-v22-shell" style={{
        width: "100%", maxWidth: 430, height: "100svh", maxHeight: 932,
        position: "relative", overflow: "hidden",
        boxShadow: "0 40px 80px rgba(100,80,140,0.22), 0 0 0 1px rgba(180,160,210,0.30)",
      }}>

        {/* Report Hub screen */}
        {activeScreen === "report-hub" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <ReportHubScreen
              profileName={profile.name || "当前档案"}
              baziSummary={baziViewModel ? `${baziViewModel.headerMeta} · ${baziViewModel.strongestLabel}相对突出` : "生辰资料待生成"}
              natalSummary={natalViewModel ? natalViewModel.core.map((item) => item.title).join(" · ") : "星盘资料待生成"}
              ziweiSummary={profile.birthTimeKnown && profile.gender !== "other" ? "出生资料完整，可查看十二宫结构" : "需要准确时辰与性别才能排盘"}
              hasExactTime={profile.birthTimeKnown && profile.gender !== "other"}
              onBack={goHome}
              onOpenSwitcher={() => setSwitcherOpen(true)}
              onGoToBazi={goToBazi}
              onGoToNatal={goToNatalReport}
              onGoToZiwei={goToZiwei}
              onGoToComp={goToComp}
              onGoToFlow={goToFlow}
              onGoToCombinedInsight={goToCombinedInsight}
            />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Tools Hub screen */}
        {activeScreen === "tools-hub" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <ToolsHubScreen
              profileName={profile.name || "当前档案"}
              onBack={goHome}
              onGoToComp={goToComp}
              onGoToNatal={goToNatalTool}
              onGoToPersonality={goToPersonality}
              onOpenToolStatus={openToolStatus}
              onGoToCombinedInsight={goToCombinedInsight}
            />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Combined Insight screen */}
        {activeScreen === "combined-insight" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <CombinedInsightScreen onBack={goBackFromDetail} />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Bazi screen */}
        {activeScreen === "bazi" && presentedBaziViewModel && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <BaziScreen viewModel={presentedBaziViewModel} initialTab={initialBaziTab} onBack={goBackFromDetail} onOpenSheet={openSheet}
              onSharePoster={() => openPoster("人格结论")}
              onShareFlowPoster={() => openPoster("流盘观察")} />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Compatibility screen */}
        {activeScreen === "comp" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <CompatibilityScreen onBack={goBackFromDetail} onOpenSheet={openSheet}
              onSharePoster={() => openPoster("问题解读")} />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Personality screen */}
        {activeScreen === "personality" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <PersonalityScreen onBack={goBackFromDetail}
              onSharePoster={() => openPoster("人格结论")} />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Natal chart screen */}
        {activeScreen === "natal" && presentedNatalViewModel && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <NatalChartScreen viewModel={presentedNatalViewModel} onBack={goBackFromDetail} onOpenSheet={openSheet}
              onSharePoster={() => openPoster("星座能量")} />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Ziwei screen */}
        {activeScreen === "ziwei" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <ZiweiScreen viewModel={presentedZiweiViewModel} onCompleteProfile={() => router.push("/m/create")} onBack={goBackFromDetail} onOpenSheet={openSheet}
              onSharePoster={() => openPoster("紫微观察")} />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Profile screen */}
        {activeScreen === "profile" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <ProfileScreen
              profile={profile}
              onOpenSwitcher={() => setSwitcherOpen(true)}
              onOpenLoginInfo={() => setLoginInfoOpen(true)}
              onWelcome={goToWelcome}
              onUIStates={goToUIStates}
            />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* UI States preview — accessible only from Profile */}
        {activeScreen === "ui-states" && (
          <div style={{ position: "absolute", inset: 0, zIndex: 10 }}>
            <UIStatesScreen onBack={() => setScreen("profile")} />
            <BottomNav active={navActive} onChange={navigateTo} />
          </div>
        )}

        {/* Page background */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 44%, #FDF4F1 100%)",
          zIndex: 0,
          display: activeScreen === "home" ? "block" : "none",
        }} />

        {/* ── Scrollable content ── */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0,
          bottom: 86,
          overflowY: "auto", overflowX: "hidden",
          zIndex: 1, scrollbarWidth: "none",
          display: activeScreen === "home" ? "block" : "none",
        }}>

          {/* Status-bar spacer */}
          <div style={{ height: 52 }} />

          {/* ── Header row ── */}
          <div style={{ padding: "0 24px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
              {/* Brand */}
              <div>
                <div style={{
                  fontSize: 26, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                  color: "#28253D", letterSpacing: "0.07em", lineHeight: 1,
                }}>玄枢</div>
                <div style={{ fontSize: 10, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif", letterSpacing: "0.12em", marginTop: 4 }}>
                  让命理，被科学看见
                </div>
              </div>
              {/* Date + settings */}
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{
                  padding: "5px 13px", borderRadius: 20,
                  background: "rgba(255,255,255,0.68)",
                  backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.90)",
                  fontSize: 12, color: "#524C6E",
                  fontFamily: "'Noto Sans SC', sans-serif",
                  boxShadow: "0 2px 8px rgba(160,130,200,0.09)",
                }}>
                  {months}月{days}日 周{weekDay}
                </div>
                <button onClick={goToWelcome} style={{
                  width: 34, height: 34, borderRadius: "50%",
                  background: "rgba(255,255,255,0.68)", backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255,255,255,0.90)",
                  boxShadow: "0 2px 8px rgba(160,130,200,0.09)",
                  cursor: "pointer", fontSize: 14, color: "#8C82A4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>⚙</button>
              </div>
            </div>

            {/* Profile switcher */}
            <ProfileSwitcher
              onAdd={() => setSwitcherOpen(true)}
              profiles={profileChips}
              activeProfileId={profile.id || ""}
              onSelect={(id) => setActiveMobileProfile(id)}
            />
          </div>

          {/* ── 今日观察 Hero ── */}
          <div style={{ padding: "0 18px 18px" }}>
            <GlassCard style={{
              padding: "22px 22px 20px",
              background: "linear-gradient(150deg, rgba(255,255,255,0.82) 0%, rgba(244,240,255,0.80) 100%)",
              borderRadius: 28,
            }}>
              {/* Eyebrow row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <div style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "linear-gradient(135deg, #E8816A, #E9C97E)",
                    boxShadow: "0 0 6px rgba(232,129,106,0.55)",
                    animation: "pulse-dot 2.6s ease-in-out infinite",
                  }} />
                  <span style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, color: "#9088A8", letterSpacing: "0.08em" }}>
                    今日观察
                  </span>
                </div>
                <div style={{
                  padding: "3px 11px", borderRadius: 20,
                  background: "rgba(232,129,106,0.11)", border: "1px solid rgba(232,129,106,0.22)",
                  fontSize: 10.5, color: "#D06A56", fontFamily: "'Noto Sans SC', sans-serif",
                }}>
                  {baziOverview?.identity.basis.replace("依据：", "").split(" · ").slice(0, 2).join(" · ") || "资料准备中"}
                </div>
              </div>

              {/* Headline — 2 lines max at 346px content width */}
              <div style={{
                fontSize: 21, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                color: "#28253D", lineHeight: 1.50, marginBottom: 10,
              }}>
                {dailyInsight?.title || "先建立一份档案，再看今天更适合怎么安排"}
              </div>

              {/* Supporting paragraph — 2 lines */}
              <div style={{
                fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#4A4168", lineHeight: 1.65, marginBottom: 20,
              }}>
                {dailyInsight?.summary || "出生资料只保存在当前设备。完成后，玄枢会把结构翻译成可观察的生活线索。"}
              </div>

              {/* Orbit + element chips side by side */}
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <OrbitInstrument size={170} />

                {/* Element chips stacked */}
                <div className="figma-v22-elements" style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 0 }}>
                  {(baziOverview?.elements
                    .slice()
                    .sort((a, b) => b.value - a.value)
                    .slice(0, 3)
                    .map((item) => ({
                      label: item.label,
                      trend: item.value >= 24 ? `↑ ${item.value}%` : item.value >= 16 ? `→ ${item.value}%` : `↓ ${item.value}%`,
                      color: item.color,
                      bg: `${item.color}14`,
                      border: `${item.color}42`,
                    })) || [
                      { label: "木", trend: "待计算", color: "#6BBFA0", bg: "rgba(107,191,160,0.10)", border: "rgba(107,191,160,0.30)" },
                      { label: "水", trend: "待计算", color: "#7BBDE0", bg: "rgba(123,189,224,0.10)", border: "rgba(123,189,224,0.30)" },
                      { label: "土", trend: "待计算", color: "#D4A054", bg: "rgba(233,201,126,0.12)", border: "rgba(233,201,126,0.35)" },
                    ]).map(e => (
                    <div className="figma-v22-element-card" key={e.label} style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "9px 13px", borderRadius: 13,
                      background: e.bg, border: `1px solid ${e.border}`,
                    }}>
                      <div style={{
                        width: 28, height: 28, borderRadius: 8, flexShrink: 0,
                        background: `${e.color}22`,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 14, fontFamily: "'Noto Serif SC', serif",
                        fontWeight: 700, color: e.color,
                      }}>{e.label}</div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif", color: e.color, fontWeight: 500 }}>
                          五行·{e.label}
                        </div>
                        <div style={{ fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", marginTop: 1 }}>
                          {e.trend}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </GlassCard>
          </div>

          {/* ── 今日命题 card — peeks into first viewport ── */}
          <div style={{ padding: "0 18px 16px" }}>
            <GlassCard style={{
              padding: "20px 22px 22px",
              background: "linear-gradient(140deg, rgba(232,129,106,0.09) 0%, rgba(255,255,255,0.80) 55%)",
              borderRadius: 24, cursor: "pointer",
            }} onClick={() => openSheet(homeQuestions, 0)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 14 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10.5, color: "#E8816A", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 9, letterSpacing: "0.06em" }}>
                    今日命题
                  </div>
                  <div style={{
                    fontSize: 16.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                    color: "#28253D", lineHeight: 1.55, marginBottom: 11,
                  }}>
                    {homeQuestions[0]?.title}
                  </div>
                  <div style={{ fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.68 }}>
                    {homeQuestions[0]?.answer}
                  </div>
                </div>
                <div style={{
                  width: 42, height: 42, borderRadius: 13, flexShrink: 0,
                  background: "linear-gradient(135deg, #F5C4B8, #E8816A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 18, boxShadow: "0 4px 12px rgba(232,129,106,0.30)",
                }}>✦</div>
              </div>
              <div style={{
                marginTop: 16, paddingTop: 13,
                borderTop: "1px solid rgba(180,160,210,0.14)",
                display: "flex", alignItems: "center", justifyContent: "space-between",
              }}>
                <span style={{ fontSize: 12, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif" }}>查看完整解读</span>
                <span style={{ fontSize: 12, color: "#E8816A", fontFamily: "'Noto Sans SC', sans-serif" }}>展开 →</span>
              </div>
            </GlassCard>
          </div>

          {/* ── Secondary observation chips ── */}
          <div style={{ padding: "0 18px 22px", display: "flex", gap: 11 }}>
            <ObservationChip
              label="关系观察"
              text={dailyInsight ? `今天适合：${dailyInsight.suitable}` : "完成档案后，这里会显示与你当前节奏有关的观察。"}
              accent="#6BBFA0"
            />
            <ObservationChip
              label="节律提示"
              text={dailyInsight ? `暂时少做：${dailyInsight.avoid}` : "不做事件预测，只给可以回到生活里验证的提示。"}
              accent="#7BBDE0"
            />
          </div>

          {/* ── Reports section ── */}
          <div style={{ padding: "0 18px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 13 }}>
              <span style={{ fontSize: 14, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D" }}>
                你的报告
              </span>
              <button type="button" onClick={goToReportHub} style={{ padding: 0, border: "none", background: "transparent", fontSize: 12, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif", cursor: "pointer" }}>全部 →</button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 11 }}>
              <ReportEntry
                icon="🏮"
                title="生辰八字"
                subtitle={baziOverview ? `${baziOverview.identity.dayPillar}日柱 · ${baziOverview.identity.strongestLabel}为结构重心` : "完成档案后生成真实结构"}
                tag="已解读"
                gradient="linear-gradient(135deg, #F5C4B8, #FFEDEA)"
                onClick={goToBazi}
              />
              <ReportEntry
                icon="✦"
                title="本命星盘"
                subtitle={zodiacOverview?.identity.title || "完成时间与地点后生成完整星盘"}
                tag="新内容"
                gradient="linear-gradient(135deg, #C6E2F5, #E6F3FC)"
                onClick={goToNatalReport}
              />
              <ReportEntry
                icon="◈"
                title="两人合盘"
                subtitle={storedProfiles.length > 1 ? "选择两份真实档案，查看关系中的共鸣与摩擦" : "新增一个关系档案后开始合盘"}
                tag={storedProfiles.length > 1 ? "可创建" : "待档案"}
                gradient="linear-gradient(135deg, #C4E8D6, #E4F5EC)"
                onClick={goToComp}
              />
            </div>

            {/* Compact 紫微 entry */}
            <button onClick={goToZiwei} style={{
              width: "100%", marginTop: 10,
              padding: "12px 15px",
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(255,248,225,0.88), rgba(255,255,255,0.72))",
              backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
              border: "1px solid rgba(233,201,126,0.32)",
              boxShadow: "0 2px 12px rgba(180,140,50,0.08)",
              cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
            }}>
              <div style={{
                width: 34, height: 34, borderRadius: 11, flexShrink: 0,
                background: "linear-gradient(135deg, #F6EACC, #E9C97E)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 15, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
                color: "#5A3E10",
                boxShadow: "0 3px 8px rgba(180,140,50,0.22)",
              }}>斗</div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <div style={{
                  fontSize: 13, fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 500, color: "#28253D",
                }}>紫微斗数</div>
                <div style={{
                  fontSize: 11, color: "#A09060",
                  fontFamily: "'Noto Sans SC', sans-serif", marginTop: 1,
                }}>{profile.birthTimeKnown && profile.gender !== "other" ? "十二宫 · 大运流年 — 资料已具备" : "十二宫 · 大运流年 — 待补时辰与性别"}</div>
              </div>
              <span style={{ fontSize: 12, color: "#C0A050" }}>→</span>
            </button>
          </div>

          <div style={{ height: 8 }} />
        </div>

        {/* ── Bottom Navigation for Home screen only ── */}
        {activeScreen === "home" && (
          <BottomNav active={navActive} onChange={navigateTo} />
        )}

        {/* ── Onboarding screens (no BottomNav, above everything) ── */}
        {(activeScreen === "welcome" || activeScreen === "create-profile" || activeScreen === "generating") && (
          <div style={{ position: "absolute", inset: 0, zIndex: 70 }}>
            {activeScreen === "welcome" && (
              <WelcomeScreen
                onCreateProfile={goToCreateProfile}
                onViewDemo={startDemoMode}
              />
            )}
            {activeScreen === "create-profile" && (
              <CreateProfileScreen
                onBack={goToWelcome}
                onComplete={goToGenerating}
              />
            )}
            {activeScreen === "generating" && (
              <GeneratingScreen
                profileName={profileData?.name ?? ""}
                onComplete={completeOnboarding}
              />
            )}
          </div>
        )}

        {/* ── Profile switcher sheet ── */}
        {(() => {
          const allProfiles: ProfileEntry[] = storedProfiles.map((item, index) => ({
            id: item.id || `profile-${index}`,
            name: item.name || "未命名档案",
            element: item.isDemo ? "示" : item.name.trim().slice(0, 1) || "档",
            color: ["#6BBFA0", "#E8816A", "#7BBDE0", "#C0ACDE"][index % 4],
            storage: item.syncStatus === "synced" ? "cloud" : "local",
          }));
          return (
            <ProfileSwitcherSheet
              open={switcherOpen}
              onClose={() => setSwitcherOpen(false)}
              onNewProfile={goToCreateProfile}
              profiles={allProfiles}
              activeProfileId={profile.id || ""}
              onSelect={id => setActiveMobileProfile(id)}
            />
          );
        })()}

        {/* ── Login info sheet ── */}
        <LoginInfoSheet
          open={loginInfoOpen}
          onClose={() => setLoginInfoOpen(false)}
        />

        {/* ── Question Insight Sheet (renders over all screens) ── */}
        <QuestionInsightSheet
          open={sheetOpen}
          questions={sheetQuestions}
          activeIndex={sheetIndex}
          onClose={closeSheet}
          onNext={nextSheetQuestion}
          onSharePoster={() => { closeSheet(); openPoster("问题解读"); }}
        />

        {/* ── Tool status sheet ── */}
        <ToolStatusSheet
          open={toolStatusOpen}
          onClose={() => setToolStatusOpen(false)}
          tool={toolStatusData}
          onViewTools={() => { setNavActive(2); setScreen("tools-hub"); }}
        />

        {/* ── Share poster sheet (highest z, above all sheets) ── */}
        <SharePosterSheet
          key={`${posterOpen}-${posterType}`}
          open={posterOpen}
          onClose={() => setPosterOpen(false)}
          defaultType={posterType}
          content={posterContent}
        />

        {/* ── Global keyframes ── */}
        <style>{`
          @keyframes pulse-dot {
            0%,100% { opacity:1; transform:scale(1); }
            50%      { opacity:0.45; transform:scale(0.65); }
          }
          @keyframes orbit-slow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes orbit-mid  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes orbit-dot  { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
          @keyframes sheet-rise {
            from { transform: translateY(100%); }
            to   { transform: translateY(0); }
          }
          ::-webkit-scrollbar { display:none; }
          @media (prefers-reduced-motion: reduce) {
            * { animation-duration:0.01ms !important; transition-duration:0.01ms !important; }
          }
        `}</style>
      </div>
    </div>
  );
}
