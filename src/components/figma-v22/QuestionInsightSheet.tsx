// QuestionInsightSheet — no local state needed after ShareCardButton was removed

// ─── Exported types ───────────────────────────────────────────────────────────
export interface Question {
  id: string;
  source: string;
  title: string;
  answer: string;
  observations: string[];
  action: string;
  boundary: string;
}

interface SheetProps {
  open: boolean;
  questions: Question[];
  activeIndex: number;
  onClose: () => void;
  onNext: () => void;
  onSharePoster?: () => void;
}

// ─── QuestionInsightSheet ─────────────────────────────────────────────────────
export default function QuestionInsightSheet({ open, questions, activeIndex, onClose, onNext, onSharePoster }: SheetProps) {
  const q = questions[activeIndex] ?? null;

  // Prevent rendering when no data
  if (!q && !open) return null;

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: "absolute", inset: 0, zIndex: 55,
          background: "rgba(40, 37, 61, 0.30)",
          backdropFilter: "blur(2px)",
          WebkitBackdropFilter: "blur(2px)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.28s ease",
        }}
      />

      {/* ── Sheet ── */}
      <div style={{
        position: "absolute",
        bottom: 0, left: 0, right: 0,
        height: "84%",
        zIndex: 60,
        borderRadius: "24px 24px 0 0",
        background: "linear-gradient(170deg, rgba(255,255,255,0.96) 0%, rgba(248,245,255,0.97) 100%)",
        backdropFilter: "blur(30px) saturate(180%)",
        WebkitBackdropFilter: "blur(30px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.95)",
        borderBottom: "none",
        boxShadow: "0 -8px 40px rgba(140,110,190,0.18), 0 -2px 8px rgba(160,130,200,0.10)",
        display: "flex", flexDirection: "column",
        transform: open ? "translateY(0)" : "translateY(102%)",
        transition: "transform 0.38s cubic-bezier(0.32, 0.72, 0, 1)",
        overflow: "hidden",
      }}>

        {/* ── Top bar: drag handle + close ── */}
        <div style={{
          padding: "12px 20px 0",
          display: "flex", flexDirection: "column", alignItems: "center", gap: 14,
          flexShrink: 0,
        }}>
          {/* Drag handle pill */}
          <div style={{
            width: 36, height: 4, borderRadius: 2,
            background: "rgba(180,160,220,0.40)",
          }} />

          {/* Source pill + close button row */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: "space-between", width: "100%",
          }}>
            <div style={{
              padding: "4px 12px", borderRadius: 20,
              background: "rgba(238,233,248,0.80)",
              border: "1px solid rgba(192,172,222,0.28)",
              fontSize: 10.5, color: "#7B6E94",
              fontFamily: "'Noto Sans SC', sans-serif",
              letterSpacing: "0.03em",
            }}>
              {q?.source ?? ""}
            </div>
            <button onClick={onClose} style={{
              width: 44, height: 44,
              background: "transparent", border: "none",
              cursor: "pointer", fontSize: 14, color: "#9088A8",
              display: "flex", alignItems: "center", justifyContent: "center",
              lineHeight: 1, padding: 0,
            }} aria-label="关闭">
              <span style={{
                width: 30, height: 30, borderRadius: "50%",
                background: "rgba(238,233,248,0.70)",
                border: "1px solid rgba(192,172,222,0.28)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>×</span>
            </button>
          </div>
        </div>

        {/* ── Scrollable content ── */}
        <div style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          padding: "18px 22px 10px",
          scrollbarWidth: "none",
        }}>
          {q && (
            <>
              {/* Question title */}
              <div style={{
                fontSize: 16, fontFamily: "'Noto Serif SC', serif",
                fontWeight: 700, color: "#28253D", lineHeight: 1.55,
                marginBottom: 18,
              }}>
                {q.title}
              </div>

              {/* Direct 2-line answer */}
              <div style={{
                padding: "16px 18px",
                borderRadius: 18,
                background: "linear-gradient(140deg, rgba(232,129,106,0.09) 0%, rgba(238,233,248,0.45) 100%)",
                border: "1px solid rgba(232,129,106,0.20)",
                marginBottom: 22,
              }}>
                <div style={{
                  fontSize: 10.5, color: "#E8816A",
                  fontFamily: "'Noto Sans SC', sans-serif",
                  fontWeight: 500, marginBottom: 9, letterSpacing: "0.05em",
                }}>
                  直接回应
                </div>
                <p style={{
                  fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
                  color: "#28253D", lineHeight: 1.75, margin: 0,
                }}>
                  {q.answer}
                </p>
              </div>

              {/* 你可以留意 */}
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
                  fontWeight: 500, color: "#6B607E", marginBottom: 12,
                  letterSpacing: "0.04em",
                }}>
                  你可以留意
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {q.observations.map((obs, i) => (
                    <div key={i} style={{
                      display: "flex", gap: 12, alignItems: "flex-start",
                      padding: "11px 14px", borderRadius: 14,
                      background: [
                        "rgba(107,191,160,0.08)",
                        "rgba(123,189,224,0.08)",
                        "rgba(233,201,126,0.10)",
                      ][i],
                      border: `1px solid ${["rgba(107,191,160,0.22)","rgba(123,189,224,0.22)","rgba(233,201,126,0.28)"][i]}`,
                    }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: 7, flexShrink: 0,
                        background: [
                          "rgba(107,191,160,0.20)",
                          "rgba(123,189,224,0.20)",
                          "rgba(233,201,126,0.22)",
                        ][i],
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 10.5, fontFamily: "'Noto Sans SC', sans-serif",
                        fontWeight: 600,
                        color: ["#6BBFA0","#7BBDE0","#D4A054"][i],
                      }}>{i + 1}</div>
                      <p style={{
                        fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                        color: "#3D3758", lineHeight: 1.65, margin: 0,
                      }}>{obs}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 现在可以怎么做 */}
              <div style={{ marginBottom: 22 }}>
                <div style={{
                  fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
                  fontWeight: 500, color: "#6B607E", marginBottom: 10,
                  letterSpacing: "0.04em",
                }}>
                  现在可以怎么做
                </div>
                <div style={{
                  padding: "14px 16px",
                  borderRadius: 16,
                  background: "linear-gradient(135deg, rgba(233,201,126,0.14) 0%, rgba(255,255,255,0.85) 100%)",
                  border: "1px solid rgba(233,201,126,0.38)",
                }}>
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                      background: "linear-gradient(135deg, #F6EACC, #E9C97E)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 13,
                    }}>✦</div>
                    <p style={{
                      fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
                      color: "#3D3758", lineHeight: 1.72, margin: 0,
                    }}>{q.action}</p>
                  </div>
                </div>
              </div>

              {/* Boundary note */}
              <div style={{
                padding: "10px 14px",
                borderRadius: 12,
                background: "rgba(238,233,248,0.55)",
                border: "1px solid rgba(192,172,222,0.20)",
                marginBottom: 6,
              }}>
                <p style={{
                  fontSize: 11, fontFamily: "'Noto Sans SC', sans-serif",
                  color: "#A094B8", lineHeight: 1.65, margin: 0,
                }}>{q.boundary}</p>
              </div>
            </>
          )}
        </div>

        {/* ── Fixed action bar ── */}
        <div style={{
          flexShrink: 0,
          padding: "12px 20px 28px",
          borderTop: "1px solid rgba(180,160,220,0.14)",
          background: "rgba(255,255,255,0.85)",
          display: "flex", gap: 10,
        }}>
          {q && onSharePoster && (
            <button onClick={onSharePoster} style={{
              flex: 1, padding: "13px 16px", borderRadius: 16,
              border: "1.5px solid rgba(232,129,106,0.40)",
              background: "linear-gradient(135deg, rgba(245,196,184,0.35), rgba(255,255,255,0.90))",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 4px 18px rgba(232,129,106,0.14)",
              transition: "all 0.18s ease",
            }}>
              <span style={{ fontSize: 14, color: "#E8816A" }}>⊙</span>
              <span style={{
                fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                fontWeight: 500, color: "#28253D",
              }}>生成分享卡</span>
            </button>
          )}

          <button onClick={onNext} style={{
            padding: "13px 16px", borderRadius: 16,
            border: "1.5px solid rgba(192,172,222,0.35)",
            background: "rgba(238,233,248,0.65)",
            cursor: "pointer",
            fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#7B6E94", fontWeight: 400,
            whiteSpace: "nowrap",
            transition: "all 0.18s ease",
          }}>
            换一个问题
          </button>
        </div>
      </div>

      <style>{`
        @media (prefers-reduced-motion: reduce) {
          [data-sheet] { transition: none !important; }
        }
      `}</style>
    </>
  );
}
