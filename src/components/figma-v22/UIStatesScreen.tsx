import { useState } from "react";
import { ChevronLeft } from "lucide-react";

// ── State types ───────────────────────────────────────────────────────────────
type StateId =
  | "loading"
  | "empty"
  | "error"
  | "local"
  | "waiting"
  | "sync-failed"
  | "insufficient";

interface StateConfig {
  id: StateId;
  label: string;
  title: string;
  cause: string;
  detail?: string;
  primaryLabel: string;
  secondaryLabel: string;
  accent: string;
  accentLight: string;
  bgGradient: string;
}

const STATES: StateConfig[] = [
  {
    id: "loading",
    label: "加载中",
    title: "正在整理你的报告",
    cause: "出生资料已经确认，正在建立内容结构。通常需要几秒钟。",
    primaryLabel: "返回首页",
    secondaryLabel: "继续等待",
    accent: "#7BBDE0",
    accentLight: "rgba(123,189,224,0.14)",
    bgGradient: "linear-gradient(160deg, #EEF6FB 0%, #F4F0FF 60%, #FAF8FF 100%)",
  },
  {
    id: "empty",
    label: "暂无内容",
    title: "这里还没有记录",
    cause: "完成一次报告生成或分享后，相关记录会出现在这里。",
    primaryLabel: "去看看报告",
    secondaryLabel: "返回",
    accent: "#C0ACDE",
    accentLight: "rgba(192,172,222,0.14)",
    bgGradient: "linear-gradient(160deg, #F4F0FF 0%, #EEF6FB 50%, #FAF8FF 100%)",
  },
  {
    id: "error",
    label: "出现问题",
    title: "这次没有生成成功",
    cause: "你的资料没有丢失，可以直接重新尝试。",
    detail: "通常是因为资料结构解析超时，重试后大多可以恢复。",
    primaryLabel: "重新生成",
    secondaryLabel: "稍后再说",
    accent: "#E8816A",
    accentLight: "rgba(232,129,106,0.13)",
    bgGradient: "linear-gradient(160deg, #FDF4F1 0%, #FFF8F5 50%, #FAF8FF 100%)",
  },
  {
    id: "local",
    label: "仅本机/离线",
    title: "当前档案只保存在这台设备",
    cause: "清除浏览器数据、重装应用或换机后，档案可能无法找回。",
    detail: "登录后可将档案备份至云端，随时恢复。",
    primaryLabel: "了解保存方式",
    secondaryLabel: "继续本地使用",
    accent: "#6BBFA0",
    accentLight: "rgba(107,191,160,0.14)",
    bgGradient: "linear-gradient(160deg, #EEF9F4 0%, #F4F0FF 50%, #FAF8FF 100%)",
  },
  {
    id: "waiting",
    label: "等待同步",
    title: "正在等待网络恢复",
    cause: "网络可用后会自动继续同步，本机内容不受影响。",
    detail: "你的档案已在本机完整保存，同步状态不影响报告查看。",
    primaryLabel: "立即重试",
    secondaryLabel: "保留本机版本",
    accent: "#E9C97E",
    accentLight: "rgba(233,201,126,0.16)",
    bgGradient: "linear-gradient(160deg, #FFFCF0 0%, #FFF8F5 50%, #FAF8FF 100%)",
  },
  {
    id: "sync-failed",
    label: "同步失败",
    title: "没有覆盖你的本机档案",
    cause: "云端同步未完成，但本机内容仍然安全，没有任何数据丢失。",
    detail: "可在网络稳定后重试。如果持续失败，本机档案始终优先。",
    primaryLabel: "重试同步",
    secondaryLabel: "查看本机档案",
    accent: "#E8816A",
    accentLight: "rgba(232,129,106,0.13)",
    bgGradient: "linear-gradient(160deg, #FDF4F1 0%, #FFF0EB 50%, #FAF8FF 100%)",
  },
  {
    id: "insufficient",
    label: "资料不足",
    title: "还缺少精确出生时辰和性别",
    cause: "玄枢不会用中午或随机时辰替代，这会导致结果不准确。",
    detail: "现有资料可以支持八字基础报告和本命星盘，紫微斗数需要补充后才能使用。",
    primaryLabel: "补充资料",
    secondaryLabel: "查看可用报告",
    accent: "#C0ACDE",
    accentLight: "rgba(192,172,222,0.14)",
    bgGradient: "linear-gradient(160deg, #F4F0FF 0%, #EEF9F4 50%, #FAF8FF 100%)",
  },
];

// ── Original orbit icons per state ───────────────────────────────────────────
// All 90×90, center at (45,45). Precision-instrument style.

function polarToXY(cx: number, cy: number, r: number, deg: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
}

function arc(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const [x1, y1] = polarToXY(cx, cy, r, startDeg);
  const [x2, y2] = polarToXY(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${x1.toFixed(2)} ${y1.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x2.toFixed(2)} ${y2.toFixed(2)}`;
}

function StateIcon({ id, accent }: { id: StateId; accent: string }) {
  const CX = 45, CY = 45;

  const base = (
    <>
      <circle cx={CX} cy={CY} r={41}
        fill="none" stroke={`${accent}18`} strokeWidth={10} />
    </>
  );

  switch (id) {
    case "loading": return (
      <svg width={90} height={90} viewBox="0 0 90 90">
        {base}
        {/* 3/4 arc — solid */}
        <path d={arc(CX, CY, 36, 0, 270)} fill="none" stroke={accent} strokeWidth={2.2}
          strokeLinecap="round" />
        {/* Final quarter — dashed/faint */}
        <path d={arc(CX, CY, 36, 270, 360)} fill="none" stroke={`${accent}40`}
          strokeWidth={1.4} strokeDasharray="4 4" strokeLinecap="round" />
        {/* Active dot at 270° */}
        {(() => { const [x,y] = polarToXY(CX, CY, 36, 270); return (
          <circle cx={x} cy={y} r={4} fill={accent}
            style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
        ); })()}
        {/* Mid ring */}
        <circle cx={CX} cy={CY} r={22} fill="none"
          stroke={`${accent}28`} strokeWidth={1} strokeDasharray="4 3" />
        {/* Center pulse disc */}
        <circle cx={CX} cy={CY} r={10}
          fill="rgba(255,255,255,0.88)" stroke={accent} strokeWidth={1.4} />
        <circle cx={CX} cy={CY} r={4} fill={accent} opacity={0.65} />
      </svg>
    );

    case "empty": return (
      <svg width={90} height={90} viewBox="0 0 90 90">
        {base}
        {/* Full outer ring — very faint */}
        <circle cx={CX} cy={CY} r={36} fill="none"
          stroke={`${accent}30`} strokeWidth={1.2} strokeDasharray="6 4" />
        {/* Mid ring — faint */}
        <circle cx={CX} cy={CY} r={24} fill="none"
          stroke={`${accent}22`} strokeWidth={0.9} strokeDasharray="4 4" />
        {/* 8 faint position dots */}
        {Array.from({ length: 8 }, (_, i) => {
          const [x, y] = polarToXY(CX, CY, 32, i * 45);
          return <circle key={i} cx={x} cy={y} r={1.6}
            fill={`${accent}35`} />;
        })}
        {/* Center: open ring only — no fill content */}
        <circle cx={CX} cy={CY} r={12}
          fill="rgba(255,255,255,0.70)" stroke={`${accent}50`} strokeWidth={1.2} />
        <circle cx={CX} cy={CY} r={3.5}
          fill="none" stroke={`${accent}60`} strokeWidth={1} />
      </svg>
    );

    case "error": return (
      <svg width={90} height={90} viewBox="0 0 90 90">
        {base}
        {/* Interrupted orbit — two arcs with a gap */}
        <path d={arc(CX, CY, 36, 30, 310)} fill="none"
          stroke={accent} strokeWidth={2} strokeLinecap="round" />
        {/* Break indicators at gap */}
        {[15, 325].map(deg => {
          const [x, y] = polarToXY(CX, CY, 36, deg);
          return <circle key={deg} cx={x} cy={y} r={2.8} fill={accent} opacity={0.55} />;
        })}
        {/* Mid ring */}
        <circle cx={CX} cy={CY} r={22} fill="none"
          stroke={`${accent}28`} strokeWidth={1} strokeDasharray="3 3" />
        {/* Center */}
        <circle cx={CX} cy={CY} r={11}
          fill="rgba(255,255,255,0.88)" stroke={accent} strokeWidth={1.4} />
        {/* Exclamation: line + dot */}
        <line x1={CX} y1={CY - 5} x2={CX} y2={CY + 1}
          stroke={accent} strokeWidth={2} strokeLinecap="round" />
        <circle cx={CX} cy={CY + 4.5} r={1.5} fill={accent} />
      </svg>
    );

    case "local": return (
      <svg width={90} height={90} viewBox="0 0 90 90">
        {base}
        <circle cx={CX} cy={CY} r={36} fill="none"
          stroke={accent} strokeWidth={1.4} />
        {/* 4 cardinal dots */}
        {[0, 90, 180, 270].map(deg => {
          const [x, y] = polarToXY(CX, CY, 36, deg);
          return <circle key={deg} cx={x} cy={y} r={2.5} fill={accent} />;
        })}
        {/* Mid ring dashed */}
        <circle cx={CX} cy={CY} r={22} fill="none"
          stroke={`${accent}35`} strokeWidth={1} strokeDasharray="5 4" />
        {/* Center: device silhouette (rounded rect + tiny screen) */}
        <circle cx={CX} cy={CY} r={12}
          fill="rgba(255,255,255,0.90)" stroke={accent} strokeWidth={1.4} />
        {/* Phone body */}
        <rect x={CX - 4} y={CY - 5.5} width={8} height={11} rx={1.5}
          fill="none" stroke={accent} strokeWidth={1.2} />
        {/* Screen */}
        <rect x={CX - 2.5} y={CY - 4} width={5} height={6} rx={0.8}
          fill={`${accent}45`} />
        {/* Home button dot */}
        <circle cx={CX} cy={CY + 4} r={0.8} fill={accent} />
      </svg>
    );

    case "waiting": return (
      <svg width={90} height={90} viewBox="0 0 90 90">
        {base}
        <circle cx={CX} cy={CY} r={36} fill="none"
          stroke={`${accent}40`} strokeWidth={1.2} />
        {/* 3 evenly spaced "pause" segments */}
        {[0, 120, 240].map(off => (
          <path key={off} d={arc(CX, CY, 36, off + 10, off + 80)}
            fill="none" stroke={accent} strokeWidth={2.2} strokeLinecap="round" />
        ))}
        {/* Mid ring */}
        <circle cx={CX} cy={CY} r={22} fill="none"
          stroke={`${accent}28`} strokeWidth={1} strokeDasharray="4 3" />
        {/* Center: hourglass-ish (two triangles) */}
        <circle cx={CX} cy={CY} r={11}
          fill="rgba(255,255,255,0.90)" stroke={accent} strokeWidth={1.4} />
        {/* Top triangle */}
        <path d={`M ${CX - 4} ${CY - 5} L ${CX + 4} ${CY - 5} L ${CX} ${CY} Z`}
          fill={`${accent}60`} />
        {/* Bottom triangle */}
        <path d={`M ${CX - 4} ${CY + 5} L ${CX + 4} ${CY + 5} L ${CX} ${CY} Z`}
          fill={`${accent}30`} />
      </svg>
    );

    case "sync-failed": return (
      <svg width={90} height={90} viewBox="0 0 90 90">
        {base}
        {/* Outer — broken at top */}
        <path d={arc(CX, CY, 36, 40, 320)} fill="none"
          stroke={accent} strokeWidth={2} strokeLinecap="round" />
        <path d={arc(CX, CY, 36, 330, 390)} fill="none"
          stroke={`${accent}30`} strokeWidth={1.4} strokeDasharray="3 3" />
        {/* Arrow hint at break — indicating failed direction */}
        {(() => {
          const [x, y] = polarToXY(CX, CY, 36, 36);
          return <circle cx={x} cy={y} r={3} fill={accent} opacity={0.55} />;
        })()}
        {/* Mid ring */}
        <circle cx={CX} cy={CY} r={22} fill="none"
          stroke={`${accent}25`} strokeWidth={1} strokeDasharray="3 3" />
        {/* Center X mark */}
        <circle cx={CX} cy={CY} r={11}
          fill="rgba(255,255,255,0.90)" stroke={accent} strokeWidth={1.4} />
        <line x1={CX - 4} y1={CY - 4} x2={CX + 4} y2={CY + 4}
          stroke={accent} strokeWidth={2} strokeLinecap="round" />
        <line x1={CX + 4} y1={CY - 4} x2={CX - 4} y2={CY + 4}
          stroke={accent} strokeWidth={2} strokeLinecap="round" />
      </svg>
    );

    case "insufficient": return (
      <svg width={90} height={90} viewBox="0 0 90 90">
        {base}
        {/* 3 of 4 quadrant arcs filled, 1 open */}
        <path d={arc(CX, CY, 36, 0, 80)} fill="none"
          stroke={accent} strokeWidth={2.2} strokeLinecap="round" />
        <path d={arc(CX, CY, 36, 90, 170)} fill="none"
          stroke={accent} strokeWidth={2.2} strokeLinecap="round" />
        <path d={arc(CX, CY, 36, 180, 260)} fill="none"
          stroke={accent} strokeWidth={2.2} strokeLinecap="round" />
        {/* Missing quadrant — dashed */}
        <path d={arc(CX, CY, 36, 270, 350)} fill="none"
          stroke={`${accent}38`} strokeWidth={1.4} strokeDasharray="4 3" />
        {/* Gap dot */}
        {(() => {
          const [x, y] = polarToXY(CX, CY, 36, 310);
          return <circle cx={x} cy={y} r={2.5} fill={`${accent}45`} />;
        })()}
        {/* Mid ring */}
        <circle cx={CX} cy={CY} r={22} fill="none"
          stroke={`${accent}28`} strokeWidth={1} strokeDasharray="4 4" />
        {/* Center */}
        <circle cx={CX} cy={CY} r={11}
          fill="rgba(255,255,255,0.90)" stroke={accent} strokeWidth={1.4} />
        {/* Question mark */}
        <path d={`M ${CX - 2.5} ${CY - 3.5}
          Q ${CX - 2.5} ${CY - 6} ${CX} ${CY - 6}
          Q ${CX + 3.5} ${CY - 6} ${CX + 3.5} ${CY - 3}
          Q ${CX + 3.5} ${CY} ${CX} ${CY + 1}`}
          fill="none" stroke={accent} strokeWidth={1.5} strokeLinecap="round" />
        <circle cx={CX} cy={CY + 4} r={1.3} fill={accent} />
      </svg>
    );
  }
}

// ── Reusable StatePanel ───────────────────────────────────────────────────────
interface StatePanelProps {
  config: StateConfig;
  onPrimary: () => void;
  onSecondary: () => void;
}

export function StatePanel({ config: c, onPrimary, onSecondary }: StatePanelProps) {
  return (
    <div style={{
      borderRadius: 24,
      background: c.bgGradient,
      border: "1px solid rgba(255,255,255,0.92)",
      boxShadow: "0 6px 28px rgba(160,130,200,0.12), 0 1px 3px rgba(180,140,200,0.08)",
      overflow: "hidden",
    }}>
      {/* Icon section */}
      <div style={{
        padding: "32px 24px 24px",
        display: "flex", flexDirection: "column", alignItems: "center",
        borderBottom: `1px solid ${c.accent}18`,
        position: "relative",
      }}>
        {/* Ambient glow */}
        <div style={{
          position: "absolute", top: 20, left: "50%",
          transform: "translateX(-50%)",
          width: 120, height: 120, borderRadius: "50%",
          background: `radial-gradient(ellipse, ${c.accent}20 0%, transparent 70%)`,
          pointerEvents: "none",
        }} />

        {/* Icon */}
        <div style={{
          padding: 10,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.80)",
          backdropFilter: "blur(12px)",
          border: `1px solid ${c.accent}30`,
          boxShadow: `0 4px 20px ${c.accent}28`,
          marginBottom: 20,
          position: "relative", zIndex: 1,
        }}>
          <StateIcon id={c.id} accent={c.accent} />
        </div>

        {/* Title */}
        <div style={{
          fontSize: 19, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
          color: "#28253D", textAlign: "center", lineHeight: 1.48,
          marginBottom: 10,
        }}>{c.title}</div>

        {/* Cause */}
        <div style={{
          fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#4A4168", textAlign: "center", lineHeight: 1.70,
          maxWidth: 280,
        }}>{c.cause}</div>
      </div>

      {/* Detail row (optional) */}
      {c.detail && (
        <div style={{
          padding: "14px 22px",
          borderBottom: `1px solid ${c.accent}14`,
          display: "flex", alignItems: "flex-start", gap: 10,
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%",
            background: c.accent, flexShrink: 0, marginTop: 6,
            opacity: 0.65,
          }} />
          <div style={{
            fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#6B6088", lineHeight: 1.65,
          }}>{c.detail}</div>
        </div>
      )}

      {/* Actions */}
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Primary */}
        <button onClick={onPrimary} style={{
          width: "100%", height: 50, borderRadius: 18,
          background: `linear-gradient(135deg, ${c.accent}CC, ${c.accent}99)`,
          border: "none", cursor: "pointer",
          fontSize: 14.5, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 600, color: "#fff",
          letterSpacing: "0.03em",
          boxShadow: `0 5px 18px ${c.accent}44`,
          transition: "opacity 0.14s",
        }}>{c.primaryLabel}</button>

        {/* Secondary */}
        <button onClick={onSecondary} style={{
          width: "100%", height: 46, borderRadius: 16,
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)",
          border: `1.5px solid ${c.accent}30`,
          cursor: "pointer",
          fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#5A5272", fontWeight: 400,
          transition: "opacity 0.14s",
        }}>{c.secondaryLabel}</button>
      </div>
    </div>
  );
}

// ── UIStatesScreen ────────────────────────────────────────────────────────────
interface UIStatesScreenProps {
  onBack: () => void;
}

export default function UIStatesScreen({ onBack }: UIStatesScreenProps) {
  const [activeId, setActiveId] = useState<StateId>("loading");
  const config = STATES.find(s => s.id === activeId)!;

  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 44%, #FDF4F1 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Noto Sans SC', sans-serif",
      overflow: "hidden",
    }}>
      {/* Status bar spacer */}
      <div style={{ height: 52, flexShrink: 0 }} />

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "flex-start",
        padding: "0 20px 14px", gap: 14, flexShrink: 0,
      }}>
        <button onClick={onBack} style={{
          width: 36, height: 36, borderRadius: "50%", marginTop: 2, flexShrink: 0,
          background: "rgba(255,255,255,0.70)",
          border: "1px solid rgba(192,172,222,0.28)",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer",
        }}>
          <ChevronLeft size={18} color="#5A5272" />
        </button>
        <div>
          <div style={{
            fontSize: 17, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 700, color: "#28253D", lineHeight: 1.2,
          }}>界面状态预览</div>
          <div style={{
            fontSize: 11.5, color: "#9088A8",
            fontFamily: "'Noto Sans SC', sans-serif", marginTop: 4,
            lineHeight: 1.4,
          }}>用于检查异常、空白与恢复路径</div>
        </div>
      </div>

      {/* Pill selector — horizontal scroll */}
      <div style={{
        flexShrink: 0,
        overflowX: "auto", overflowY: "hidden",
        scrollbarWidth: "none",
        padding: "0 18px 14px",
        display: "flex", gap: 7,
      }}>
        {STATES.map(s => {
          const isActive = s.id === activeId;
          return (
            <button key={s.id}
              onClick={() => setActiveId(s.id)}
              style={{
                flexShrink: 0,
                padding: "7px 15px", borderRadius: 20,
                border: isActive
                  ? `1.5px solid ${s.accent}66`
                  : "1.5px solid rgba(192,172,222,0.26)",
                background: isActive
                  ? s.accentLight
                  : "rgba(255,255,255,0.60)",
                cursor: "pointer",
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: isActive ? s.accent : "#7B6E94",
                fontWeight: isActive ? 500 : 400,
                transition: "all 0.16s",
              }}>{s.label}</button>
          );
        })}
      </div>

      {/* StatePanel — scrollable */}
      <div style={{
        flex: 1, overflowY: "auto", overflowX: "hidden",
        scrollbarWidth: "none",
        padding: "0 18px 40px",
      }}>
        <StatePanel
          key={activeId} // remount on switch to reset any internal state
          config={config}
          onPrimary={onBack}
          onSecondary={onBack}
        />

        {/* Dev hint */}
        <div style={{
          marginTop: 18, textAlign: "center",
          fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#C0B8D8", lineHeight: 1.6,
        }}>
          此页面仅用于内部设计检查，不出现在正式导航中。
        </div>
      </div>
    </div>
  );
}
