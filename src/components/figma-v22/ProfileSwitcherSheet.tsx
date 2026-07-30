import { useEffect, useRef } from "react";
import { X, Plus, Check, Smartphone } from "lucide-react";

export interface ProfileEntry {
  id: string;
  name: string;
  element: string;
  color: string;
  storage: "local" | "cloud";
}

interface ProfileSwitcherSheetProps {
  open: boolean;
  onClose: () => void;
  onNewProfile: () => void;
  profiles: ProfileEntry[];
  activeProfileId: string;
  onSelect: (id: string) => void;
}

export default function ProfileSwitcherSheet({
  open,
  onClose,
  onNewProfile,
  profiles,
  activeProfileId,
  onSelect,
}: ProfileSwitcherSheetProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  // Prevent body scroll while open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        ref={backdropRef}
        onClick={onClose}
        style={{
          position: "absolute", inset: 0,
          background: "rgba(40,37,61,0.28)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          zIndex: 55,
        }}
      />

      {/* Sheet */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0,
        zIndex: 60,
        borderRadius: "28px 28px 0 0",
        background: "rgba(252,250,255,0.96)",
        backdropFilter: "blur(28px) saturate(180%)",
        WebkitBackdropFilter: "blur(28px) saturate(180%)",
        border: "1px solid rgba(255,255,255,0.92)",
        borderBottom: "none",
        boxShadow: "0 -8px 40px rgba(100,80,160,0.16)",
        paddingBottom: 32,
        animation: "sheet-rise 0.32s cubic-bezier(0.32,0.72,0,1) both",
      }}>
        {/* Handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(180,160,220,0.35)",
          margin: "12px auto 0",
        }} />

        {/* Header */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 22px 10px",
        }}>
          <span style={{
            fontSize: 15, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 600, color: "#28253D",
          }}>切换档案</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(192,172,222,0.18)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={15} color="#7B6E94" />
          </button>
        </div>

        {/* Profile list */}
        <div style={{ padding: "4px 18px 0" }}>
          {profiles.map(p => {
            const isActive = p.id === activeProfileId;
            return (
              <button
                key={p.id}
                onClick={() => { onSelect(p.id); onClose(); }}
                style={{
                  width: "100%", display: "flex", alignItems: "center",
                  gap: 14, padding: "13px 16px",
                  borderRadius: 18, marginBottom: 8,
                  background: isActive
                    ? `${p.color}12`
                    : "rgba(255,255,255,0.60)",
                  border: isActive
                    ? `1.5px solid ${p.color}55`
                    : "1.5px solid rgba(192,172,222,0.20)",
                  cursor: "pointer",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  textAlign: "left",
                  transition: "all 0.15s",
                }}>
                {/* Avatar */}
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
                  background: `linear-gradient(135deg, ${p.color}DD, ${p.color}77)`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 16, fontFamily: "'Noto Serif SC', serif",
                  fontWeight: 700, color: "#fff",
                  boxShadow: `0 3px 10px ${p.color}44`,
                }}>{p.element}</div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 14.5, fontFamily: "'Noto Serif SC', serif",
                    fontWeight: isActive ? 600 : 400,
                    color: "#28253D",
                  }}>{p.name}</div>
                  <div style={{
                    display: "flex", alignItems: "center", gap: 5, marginTop: 3,
                  }}>
                    <Smartphone size={11} color={p.storage === "local" ? "#9088A8" : "#6BBFA0"} />
                    <span style={{
                      fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
                      color: p.storage === "local" ? "#9088A8" : "#6BBFA0",
                    }}>
                      {p.storage === "local" ? "仅本机" : "已同步"}
                    </span>
                  </div>
                </div>

                {/* Active check */}
                {isActive && (
                  <div style={{
                    width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
                    background: p.color,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Check size={13} color="#fff" strokeWidth={2.5} />
                  </div>
                )}
              </button>
            );
          })}

          {/* New profile action */}
          <button
            onClick={() => { onClose(); onNewProfile(); }}
            style={{
              width: "100%", display: "flex", alignItems: "center",
              gap: 14, padding: "13px 16px",
              borderRadius: 18, marginTop: 2,
              background: "rgba(255,255,255,0.50)",
              border: "1.5px dashed rgba(192,172,222,0.42)",
              cursor: "pointer", textAlign: "left",
            }}>
            <div style={{
              width: 40, height: 40, borderRadius: "50%", flexShrink: 0,
              background: "rgba(238,233,248,0.70)",
              border: "1.5px dashed rgba(192,172,222,0.40)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Plus size={18} color="#C0ACDE" />
            </div>
            <div>
              <div style={{
                fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#7B6E94", fontWeight: 400,
              }}>新建档案</div>
              <div style={{
                fontSize: 11.5, color: "#B0A8C8",
                fontFamily: "'Noto Sans SC', sans-serif", marginTop: 2,
              }}>为另一个人建立独立观察档案</div>
            </div>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes sheet-rise {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  );
}
