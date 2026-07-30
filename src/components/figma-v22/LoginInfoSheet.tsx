import { X, Smartphone, Cloud, ArrowRight } from "lucide-react";

interface LoginInfoSheetProps {
  open: boolean;
  onClose: () => void;
}

export default function LoginInfoSheet({ open, onClose }: LoginInfoSheetProps) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
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
        paddingBottom: 36,
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
          padding: "14px 22px 0",
        }}>
          <span style={{
            fontSize: 15, fontFamily: "'Noto Serif SC', serif",
            fontWeight: 600, color: "#28253D",
          }}>档案保存方式</span>
          <button onClick={onClose} style={{
            width: 30, height: 30, borderRadius: "50%",
            background: "rgba(192,172,222,0.18)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <X size={15} color="#7B6E94" />
          </button>
        </div>

        <div style={{ padding: "18px 22px 0" }}>
          {/* Current state card */}
          <div style={{
            padding: "16px 18px",
            borderRadius: 18,
            background: "rgba(208,234,224,0.30)",
            border: "1px solid rgba(107,191,160,0.25)",
            display: "flex", alignItems: "flex-start", gap: 14,
            marginBottom: 14,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: "rgba(107,191,160,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Smartphone size={18} color="#4A8E7A" />
            </div>
            <div>
              <div style={{
                fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                fontWeight: 500, color: "#28253D", marginBottom: 4,
              }}>当前：仅本机存储</div>
              <div style={{
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#4A6E5E", lineHeight: 1.65,
              }}>
                你的所有档案数据只保存在这台设备上，不会上传到任何服务器，也不会被读取。
              </div>
            </div>
          </div>

          {/* Login benefit card */}
          <div style={{
            padding: "16px 18px",
            borderRadius: 18,
            background: "rgba(192,172,222,0.12)",
            border: "1px solid rgba(192,172,222,0.25)",
            display: "flex", alignItems: "flex-start", gap: 14,
            marginBottom: 22,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: 11, flexShrink: 0,
              background: "rgba(192,172,222,0.22)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Cloud size={18} color="#7B6E94" />
            </div>
            <div>
              <div style={{
                fontSize: 13.5, fontFamily: "'Noto Serif SC', serif",
                fontWeight: 500, color: "#28253D", marginBottom: 4,
              }}>登录后：跨设备恢复</div>
              <div style={{
                fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#4A4168", lineHeight: 1.65,
              }}>
                登录后可以在换机时恢复档案，同时在多台设备上查看你的报告。你可以随时选择登录，之前记录的内容不会丢失。
              </div>
            </div>
          </div>

          {/* Note */}
          <div style={{
            fontSize: 12, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#A8A0BC", lineHeight: 1.65,
            textAlign: "center", marginBottom: 20,
          }}>
            登录功能即将开放，目前暂不需要注册或验证。
          </div>

          {/* CTAs */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* Primary — deferred, communicates readiness */}
            <button style={{
              width: "100%", height: 50,
              borderRadius: 18,
              background: "linear-gradient(135deg, rgba(192,172,222,0.55), rgba(160,140,200,0.40))",
              border: "1.5px solid rgba(192,172,222,0.45)",
              cursor: "default",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              opacity: 0.75,
            }}>
              <span style={{
                fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
                color: "#5A5272", fontWeight: 500,
              }}>登录以后再说</span>
              <ArrowRight size={14} color="#7B6E94" />
            </button>

            {/* Dismiss */}
            <button onClick={onClose} style={{
              width: "100%", height: 48,
              borderRadius: 18,
              background: "rgba(255,255,255,0.60)",
              border: "1.5px solid rgba(192,172,222,0.22)",
              cursor: "pointer",
              fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
              color: "#7B6E94",
            }}>稍后再说</button>
          </div>
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
