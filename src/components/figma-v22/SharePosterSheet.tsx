import { useMemo, useRef, useState } from "react";
import { X, Image as ImageIcon, Download, Share2, RefreshCw } from "lucide-react";
import { useMobileProfile } from "@/lib/mobile/profile";
import type { SharePosterData } from "@/lib/mobile/types";
import { SharePoster } from "@/components/mobile/SharePoster";
import { useShareImage } from "@/components/mobile/useShareImage";

export type PosterContentType = "今日提醒" | "人格结论" | "流盘观察" | "星座能量" | "紫微观察" | "问题解读";

interface SharePosterSheetProps {
  open: boolean;
  onClose: () => void;
  defaultType?: PosterContentType;
  content?: Partial<Record<PosterContentType, PosterContent>>;
}

type GenerateState = "idle" | "loading" | "success" | "error";

export type PosterContent = {
  title: string;
  body: string;
  tags: string[];
  accent: string;
  accentLight: string;
};

// ── Poster content catalogue ─────────────────────────────────────────────────
const POSTER_CONTENT: Record<PosterContentType, PosterContent> = {
  "今日提醒": {
    title: "我不是没有方向，只是该把力气收回来一点。",
    body: "今天先完成一件已经开始的事。做出一个结果，再决定要不要继续开新的方向。",
    tags: ["先做完", "少分心", "今天的重点"],
    accent: "#6BBFA0",
    accentLight: "rgba(107,191,160,0.15)",
  },
  "人格结论": {
    title: "你不是想太多，只是总会先把局面看完整。",
    body: "很多别人还没注意到的变化，你已经先感觉到了。真正需要练习的，是分清直觉和担心。",
    tags: ["感受很细", "先观察", "需要确定"],
    accent: "#C0ACDE",
    accentLight: "rgba(192,172,222,0.15)",
  },
  "流盘观察": {
    title: "最近不必每件事都用力，先看哪一件真的值得。",
    body: "有些事适合推进，有些事需要再等一个现实回应。把力气用对地方，比一味加速更重要。",
    tags: ["流年", "流月", "行动节奏"],
    accent: "#E8816A",
    accentLight: "rgba(232,129,106,0.15)",
  },
  "星座能量": {
    title: "月亮双鱼，直觉是你真正的罗盘",
    body: "太阳天秤寻求平衡，但真正驱动你决策的，往往是那个说不清楚却很准的感觉。",
    tags: ["太阳天秤", "月亮双鱼", "上升摩羯"],
    accent: "#7BBDE0",
    accentLight: "rgba(123,189,224,0.15)",
  },
  "紫微观察": {
    title: "紫微结构会从人生领域的分布开始阅读",
    body: "准确时辰与性别资料齐全后，玄枢才会展示十二宫、命宫与身宫依据，不使用默认时辰补盘。",
    tags: ["紫微斗数", "十二宫", "资料边界"],
    accent: "#D4A054",
    accentLight: "rgba(212,160,84,0.15)",
  },
  "问题解读": {
    title: "那个直觉其实是对的",
    body: "你不是想得太多，是还没有找到合适的边界。说清楚才能真正放下。",
    tags: ["说清楚", "看行动", "今日命题"],
    accent: "#E8816A",
    accentLight: "rgba(232,129,106,0.15)",
  },
};

// ── Orbit motif SVG for poster ────────────────────────────────────────────────
function PosterOrbit({ accent }: { accent: string }) {
  return (
    <svg width={90} height={90} viewBox="0 0 90 90" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="po-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#F4F0FF" stopOpacity="0.60" />
        </radialGradient>
      </defs>
      {/* Outer ring */}
      <circle cx={45} cy={45} r={40} fill="none"
        stroke={`${accent}40`} strokeWidth={1.2} />
      {/* Mid dashed ring */}
      <circle cx={45} cy={45} r={28} fill="none"
        stroke="rgba(192,172,222,0.28)" strokeWidth={0.8} strokeDasharray="4 4" />
      {/* 8 branch dots */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        return (
          <circle key={i}
            cx={45 + 36 * Math.cos(a)} cy={45 + 36 * Math.sin(a)}
            r={i % 2 === 0 ? 2.2 : 1.4}
            fill={i % 2 === 0 ? accent : "rgba(192,172,222,0.45)"} />
        );
      })}
      {/* Center disc */}
      <circle cx={45} cy={45} r={14}
        fill="url(#po-center)"
        stroke="rgba(233,201,126,0.50)" strokeWidth={1.2} />
      {/* 玄 glyph */}
      <text x={45} y={46} textAnchor="middle" dominantBaseline="middle"
        fontSize={11} fontFamily="'Noto Serif SC', serif" fontWeight={700}
        fill="rgba(40,37,61,0.68)">玄</text>
    </svg>
  );
}

// ── Poster canvas (9:16) ──────────────────────────────────────────────────────
function PosterCanvas({ type, state, content, profileName }: {
  type: PosterContentType;
  state: GenerateState;
  content: PosterContent;
  profileName: string;
}) {
  const c = content;
  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  return (
    <div style={{
      width: "100%",
      paddingTop: "177.78%", // 9:16
      position: "relative",
      borderRadius: 18,
      overflow: "hidden",
      boxShadow: "0 8px 32px rgba(100,80,160,0.18), 0 1px 4px rgba(160,130,200,0.12)",
    }}>
      {/* Poster content */}
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(160deg,
          #FAF8FF 0%,
          #F0FAF5 30%,
          #FFF8F5 65%,
          #F8F4FF 100%)`,
        display: "flex", flexDirection: "column",
        padding: "24px 20px 20px",
        fontFamily: "'Noto Sans SC', sans-serif",
      }}>

        {/* Top wordmark row */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{
              width: 22, height: 22, borderRadius: 6,
              background: `linear-gradient(135deg, ${c.accent}CC, ${c.accent}66)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 700, color: "#fff",
            }}>玄</div>
            <span style={{
              fontSize: 13, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 700, color: "#28253D", letterSpacing: "0.10em",
            }}>玄枢</span>
          </div>
          <div style={{
            padding: "3px 9px", borderRadius: 10,
            background: c.accentLight,
            border: `1px solid ${c.accent}40`,
            fontSize: 9.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: c.accent, letterSpacing: "0.06em",
          }}>{type}</div>
        </div>

        {/* Orbit motif centered */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
          <div style={{
            padding: "14px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.72)",
            backdropFilter: "blur(10px)",
            border: `1px solid ${c.accent}30`,
            boxShadow: `0 4px 20px ${c.accent}20`,
          }}>
            <PosterOrbit accent={c.accent} />
          </div>
        </div>

        {/* Main conclusion */}
        <div style={{
          padding: "16px 16px 14px",
          borderRadius: 16,
          background: "rgba(255,255,255,0.75)",
          backdropFilter: "blur(12px)",
          border: "1px solid rgba(255,255,255,0.90)",
          boxShadow: "0 3px 16px rgba(160,130,200,0.09)",
          marginBottom: 12,
          flex: 1,
          display: "flex", flexDirection: "column", justifyContent: "center",
        }}>
          {/* Accent line */}
          <div style={{
            width: 28, height: 2, borderRadius: 1,
            background: c.accent,
            marginBottom: 10,
          }} />
          <div style={{
            fontSize: 16, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 700, color: "#28253D",
            lineHeight: 1.58, marginBottom: 12,
          }}>{c.title}</div>
          <div style={{
            fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#4A4168", lineHeight: 1.72,
          }}>{c.body}</div>
        </div>

        {/* Tags */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
          {c.tags.map(t => (
            <div key={t} style={{
              padding: "4px 10px", borderRadius: 10,
              background: c.accentLight,
              border: `1px solid ${c.accent}35`,
              fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
              color: c.accent,
            }}>{t}</div>
          ))}
        </div>

        {/* Profile + date */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 14px",
          borderRadius: 12,
          background: "rgba(255,255,255,0.60)",
          border: "1px solid rgba(192,172,222,0.20)",
          marginBottom: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: "linear-gradient(135deg, #6BBFA0DD, #6BBFA077)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontFamily: "'Noto Serif SC', serif",
              fontWeight: 700, color: "#fff",
            }}>木</div>
            <span style={{
              fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#5A5272",
            }}>{profileName}</span>
          </div>
          <span style={{
            fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#9088A8",
          }}>{dateStr}</span>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: "center",
          fontSize: 9, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#C0B8D8", letterSpacing: "0.04em",
        }}>仅供传统文化研究与自我观察</div>
      </div>

      {/* Loading overlay */}
      {state === "loading" && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(244,240,255,0.85)",
          backdropFilter: "blur(6px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 14,
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: "50%",
            border: "3px solid rgba(192,172,222,0.30)",
            borderTopColor: "#C0ACDE",
            animation: "poster-spin 0.9s linear infinite",
          }} />
          <span style={{
            fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#7B6E94",
          }}>正在渲染高清版本…</span>
        </div>
      )}

      {/* Success overlay badge */}
      {state === "success" && (
        <div style={{
          position: "absolute", top: 12, right: 12,
          padding: "5px 12px", borderRadius: 20,
          background: "rgba(107,191,160,0.90)",
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 12px rgba(107,191,160,0.35)",
          display: "flex", alignItems: "center", gap: 6,
        }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff" }} />
          <span style={{
            fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#fff", fontWeight: 500,
          }}>已就绪</span>
        </div>
      )}

      {/* Error overlay */}
      {state === "error" && (
        <div style={{
          position: "absolute", inset: 0,
          background: "rgba(253,244,241,0.92)",
          backdropFilter: "blur(6px)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: 10,
        }}>
          <div style={{ fontSize: 28 }}>◌</div>
          <div style={{
            fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#7B6E94", textAlign: "center", lineHeight: 1.6,
          }}>渲染失败<br />请重试</div>
        </div>
      )}
    </div>
  );
}

// ── SharePosterSheet ──────────────────────────────────────────────────────────
const TYPES: PosterContentType[] = ["今日提醒", "人格结论", "流盘观察", "星座能量", "紫微观察", "问题解读"];

export default function SharePosterSheet({ open, onClose, defaultType = "今日提醒", content }: SharePosterSheetProps) {
  const [type, setType] = useState<PosterContentType>(defaultType);
  const [notice, setNotice] = useState("");
  const profile = useMobileProfile();
  const exportRef = useRef<HTMLDivElement>(null);
  const c = content?.[type] ?? POSTER_CONTENT[type];
  const posterData = useMemo<SharePosterData>(() => ({
    id: `figma-${profile.id || "local"}-${type}`,
    category: type === "星座能量" ? "zodiac" : type === "紫微观察" ? "ziwei" : type === "人格结论" ? "personality" : type === "问题解读" ? "question" : "daily",
    eyebrow: type,
    title: c.title,
    body: c.body,
    tags: c.tags,
    footer: `${profile.name || "当前档案"} · ${new Date().toLocaleDateString("zh-CN")}`,
    tone: type === "星座能量" ? "sky" : type === "紫微观察" || type === "流盘观察" ? "warm" : type === "人格结论" ? "violet" : type === "问题解读" ? "coral" : "sage",
  }), [c.body, c.tags, c.title, profile.id, profile.name, type]);
  const analyticsContext = useMemo(() => ({
    posterId: posterData.id,
    category: posterData.category,
    profileId: profile.id || "local-profile",
    cloudProfileId: profile.cloudProfileId,
    title: posterData.title,
  }), [posterData, profile.cloudProfileId, profile.id]);
  const { dataUrl, status, error, generate, reset, markDelivery } = useShareImage(exportRef, analyticsContext);
  const genState: GenerateState = status === "generating" ? "loading" : status === "ready" ? "success" : status;

  async function handleGenerate() {
    setNotice("");
    await generate();
  }

  async function handleSave() {
    const image = dataUrl ?? await generate();
    if (!image) return;
    const link = document.createElement("a");
    link.download = `玄枢-${posterData.id}-1080x1920.png`;
    link.href = image;
    link.click();
    markDelivery("saved");
    setNotice("已生成 1080×1920 PNG；若浏览器没有直接保存，可长按预览图。 ");
  }

  async function handleShare() {
    const image = dataUrl ?? await generate();
    if (!image) return;
    try {
      const blob = await (await fetch(image)).blob();
      const file = new File([blob], `玄枢-${posterData.id}.png`, { type: "image/png" });
      if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ title: posterData.title, text: "玄枢 · 让命理，被科学看见", files: [file] });
        markDelivery("shared");
        setNotice("分享面板已打开。 ");
      } else {
        setNotice("当前设备不支持直接分享图片，请长按预览图保存。 ");
      }
    } catch (shareError) {
      if (shareError instanceof DOMException && shareError.name === "AbortError") return;
      setNotice("没有打开分享面板，请长按预览图保存。 ");
    }
  }

  const canSaveShare = genState === "success";

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { if (genState !== "loading") onClose(); }}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(40,37,61,0.32)",
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          zIndex: 65,
        }}
      />

      {/* Sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        zIndex: 66,
        borderRadius: "28px 28px 0 0",
        background: "rgba(252,250,255,0.97)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.92)",
        borderBottom: "none",
        boxShadow: "0 -8px 40px rgba(100,80,160,0.18)",
        display: "flex", flexDirection: "column",
        maxHeight: "90%",
        animation: "sheet-rise 0.32s cubic-bezier(0.32,0.72,0,1) both",
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(180,160,220,0.35)",
          margin: "12px auto 0", flexShrink: 0,
        }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "12px 22px 0", flexShrink: 0,
        }}>
          <span style={{
            fontSize: 15, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 600, color: "#28253D",
          }}>生成分享海报</span>
          <button onClick={onClose} disabled={genState === "loading"} style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(192,172,222,0.18)",
            border: "none", cursor: genState === "loading" ? "default" : "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            opacity: genState === "loading" ? 0.40 : 1,
          }}>
            <X size={15} color="#7B6E94" />
          </button>
        </div>

        {/* Content type selector */}
        <div style={{
          display: "flex", gap: 7, padding: "12px 22px 0",
          overflowX: "auto", scrollbarWidth: "none", flexShrink: 0,
        }}>
          {TYPES.map(t => (
            <button key={t} onClick={() => { setType(t); setNotice(""); reset(); }} style={{
              flexShrink: 0,
              padding: "7px 14px", borderRadius: 20,
              border: type === t
                ? `1.5px solid ${c.accent}66`
                : "1.5px solid rgba(192,172,222,0.28)",
              background: type === t ? POSTER_CONTENT[t].accentLight : "rgba(255,255,255,0.60)",
              cursor: "pointer",
              fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
              color: type === t ? POSTER_CONTENT[t].accent : "#7B6E94",
              fontWeight: type === t ? 500 : 400,
              transition: "all 0.18s",
            }}>{t}</button>
          ))}
        </div>

        {/* Poster preview — scrollable if needed */}
        <div style={{
          flex: 1, overflowY: "auto", scrollbarWidth: "none",
          padding: "14px 28px 0",
        }}>
          {dataUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={dataUrl} alt={`${posterData.title}分享图`} style={{ width: "100%", borderRadius: 18, display: "block" }} />
          ) : (
            <PosterCanvas type={type} state={genState} content={c} profileName={profile.name || "当前档案"} />
          )}
          <div style={{ position: "fixed", left: -10000, top: 0, width: 360, height: 640, pointerEvents: "none" }} aria-hidden="true">
            <SharePoster ref={exportRef} data={posterData} exportMode />
          </div>

          {/* Long-press hint */}
          <div style={{
            textAlign: "center", padding: "10px 0 2px",
            fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#B0A8C8",
          }}>
            不支持直接保存时，可长按图片保存
          </div>
        </div>

        {/* Action footer */}
        <div style={{
          flexShrink: 0,
          padding: "12px 22px 36px",
          borderTop: "1px solid rgba(192,172,222,0.14)",
          background: "rgba(252,250,255,0.90)",
        }}>
          {genState === "error" ? (
            /* Error row */
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={handleGenerate} style={{
                flex: 1, height: 50, borderRadius: 18,
                background: "linear-gradient(135deg, #F5C4B8, #E8816A)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#fff", fontWeight: 500,
                boxShadow: "0 5px 18px rgba(232,129,106,0.30)",
              }}>
                <RefreshCw size={15} color="#fff" />
                重新生成
              </button>
              <button onClick={onClose} style={{
                height: 50, padding: "0 18px", borderRadius: 18,
                background: "rgba(255,255,255,0.70)",
                border: "1.5px solid rgba(192,172,222,0.28)",
                cursor: "pointer",
                fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#7B6E94",
              }}>关闭</button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {/* Primary: generate / loading */}
              {(genState === "idle" || genState === "loading") && (
                <button onClick={handleGenerate} disabled={genState === "loading"} style={{
                  width: "100%", height: 50, borderRadius: 18,
                  background: genState === "loading"
                    ? "rgba(220,210,235,0.70)"
                    : "linear-gradient(135deg, #F5C4B8, #E8816A)",
                  border: "none",
                  cursor: genState === "loading" ? "default" : "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  fontSize: 14, fontFamily: "'Noto Serif SC', serif",
                  color: genState === "loading" ? "#A8A0BC" : "#fff",
                  fontWeight: 600, letterSpacing: "0.04em",
                  boxShadow: genState === "loading" ? "none" : "0 5px 18px rgba(232,129,106,0.30)",
                  transition: "all 0.2s",
                }}>
                  <ImageIcon size={16} color={genState === "loading" ? "#A8A0BC" : "#fff"} />
                  {genState === "loading" ? "正在渲染高清版本…" : "生成高清图"}
                </button>
              )}

              {/* Success actions */}
              {genState === "success" && (
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={handleSave} style={{
                    flex: 1, height: 50, borderRadius: 18,
                    background: "linear-gradient(135deg, rgba(107,191,160,0.22), rgba(107,191,160,0.12))",
                    border: "1.5px solid rgba(107,191,160,0.40)",
                    cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
                    color: "#3A8E70", fontWeight: 500,
                  }}>
                    <Download size={15} color="#3A8E70" />
                    保存图片
                  </button>
                  <button onClick={handleShare} style={{
                    flex: 1, height: 50, borderRadius: 18,
                    background: "linear-gradient(135deg, #F5C4B8, #E8816A)",
                    border: "none", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
                    color: "#fff", fontWeight: 500,
                    boxShadow: "0 5px 18px rgba(232,129,106,0.28)",
                  }}>
                    <Share2 size={15} color="#fff" />
                    分享图片
                  </button>
                </div>
              )}

              {/* Always-visible close link */}
              <button onClick={onClose} disabled={genState === "loading"} style={{
                width: "100%", height: 42,
                borderRadius: 16,
                background: "rgba(255,255,255,0.55)",
                border: "1.5px solid rgba(192,172,222,0.22)",
                cursor: genState === "loading" ? "default" : "pointer",
                fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#9088A8",
                opacity: genState === "loading" ? 0.45 : 1,
                transition: "opacity 0.18s",
              }}>关闭</button>

              {/* Save hint */}
              {canSaveShare && (
                <div style={{
                  textAlign: "center",
                  fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
                  color: "#B0A8C8", marginTop: -4,
                }}>
                  iOS / 微信中不支持直接保存时，可长按图片保存
                </div>
              )}
              {error && <div role="alert" style={{ textAlign: "center", fontSize: 11.5, color: "#B45F52" }}>{error}</div>}
              {notice && <div role="status" style={{ textAlign: "center", fontSize: 11.5, color: "#6B5A9A" }}>{notice}</div>}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes poster-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </>
  );
}
