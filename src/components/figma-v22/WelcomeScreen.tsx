// ─── WelcomeScreen ────────────────────────────────────────────────────────────

// Original static orbit instrument — no animation, no copied assets
function WelcomeInstrument() {
  const CX = 90, CY = 90;
  const R_OUTER = 78, R_MID = 58, R_INNER = 40, R_CENTER = 24;
  const branches = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
  const cardinal = [0, 3, 6, 9]; // indices for 子 卯 午 酉

  return (
    <svg width={180} height={180} viewBox="0 0 180 180" style={{ overflow: "visible" }}>
      <defs>
        <radialGradient id="wc-center" cx="50%" cy="50%" r="50%">
          <stop offset="0%"  stopColor="#FFFFFF" stopOpacity="0.90" />
          <stop offset="100%" stopColor="#F4F0FF" stopOpacity="0.70" />
        </radialGradient>
      </defs>

      {/* Ambient halo */}
      <circle cx={CX} cy={CY} r={R_OUTER + 14}
        fill="none" stroke="rgba(192,172,222,0.10)" strokeWidth={12} />

      {/* Outer ring */}
      <circle cx={CX} cy={CY} r={R_OUTER}
        fill="none" stroke="rgba(192,172,222,0.32)" strokeWidth={1.4} />

      {/* 12 branch dots + cardinal labels */}
      {branches.map((b, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const isCard = cardinal.includes(i);
        const dotR = R_OUTER - 5;
        const lblR = R_OUTER + 13;
        return (
          <g key={b}>
            <circle
              cx={CX + dotR * Math.cos(a)} cy={CY + dotR * Math.sin(a)}
              r={isCard ? 2.8 : 1.8}
              fill={isCard ? "#E8816A" : "rgba(192,172,222,0.52)"} />
            {isCard && (
              <text
                x={CX + lblR * Math.cos(a)} y={CY + lblR * Math.sin(a)}
                textAnchor="middle" dominantBaseline="middle"
                fontSize={10} fontFamily="'Noto Serif SC', serif"
                fill="rgba(107,96,136,0.60)">{b}</text>
            )}
          </g>
        );
      })}

      {/* Mid ring – dashed */}
      <circle cx={CX} cy={CY} r={R_MID}
        fill="none" stroke="rgba(123,189,224,0.22)"
        strokeWidth={1} strokeDasharray="5 4" />

      {/* 8 spoke ticks from mid to inner */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
        const x1 = CX + (R_INNER + 2) * Math.cos(a);
        const y1 = CY + (R_INNER + 2) * Math.sin(a);
        const x2 = CX + (R_MID - 4) * Math.cos(a);
        const y2 = CY + (R_MID - 4) * Math.sin(a);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(192,172,222,0.28)" strokeWidth={0.8} />;
      })}

      {/* Inner ring */}
      <circle cx={CX} cy={CY} r={R_INNER}
        fill="none" stroke="rgba(233,201,126,0.35)" strokeWidth={1.2} />

      {/* Center disc */}
      <circle cx={CX} cy={CY} r={R_CENTER}
        fill="url(#wc-center)"
        stroke="rgba(233,201,126,0.45)" strokeWidth={1.4} />

      {/* Cardinal spokes through center */}
      {[0, 90].map(deg => {
        const a = deg * Math.PI / 180;
        return (
          <line key={deg}
            x1={CX - R_CENTER * Math.cos(a)} y1={CY - R_CENTER * Math.sin(a)}
            x2={CX + R_CENTER * Math.cos(a)} y2={CY + R_CENTER * Math.sin(a)}
            stroke="rgba(233,201,126,0.35)" strokeWidth={0.8} />
        );
      })}

      {/* 玄 character */}
      <text x={CX} y={CY + 1}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={18} fontFamily="'Noto Serif SC', serif" fontWeight={700}
        fill="rgba(40,37,61,0.70)">玄</text>
    </svg>
  );
}

// ─── WelcomeScreen ─────────────────────────────────────────────────────────────
interface WelcomeProps {
  onCreateProfile: () => void;
  onViewDemo: () => void;
}

export default function WelcomeScreen({ onCreateProfile, onViewDemo }: WelcomeProps) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: "linear-gradient(168deg, #F4F0FF 0%, #EEF9F4 50%, #FDF4F1 100%)",
      display: "flex", flexDirection: "column",
      fontFamily: "'Noto Sans SC', sans-serif",
      overflowY: "auto", scrollbarWidth: "none",
    }}>
      {/* Status bar spacer */}
      <div style={{ height: 56 }} />

      {/* Brand */}
      <div style={{ textAlign: "center", padding: "0 32px 4px" }}>
        <div style={{
          fontSize: 36, fontFamily: "'Noto Serif SC', serif", fontWeight: 700,
          color: "#28253D", letterSpacing: "0.10em", lineHeight: 1,
        }}>玄枢</div>
        <div style={{
          fontSize: 11, color: "#9088A8",
          fontFamily: "'Noto Sans SC', sans-serif",
          letterSpacing: "0.14em", marginTop: 8,
        }}>让命理，被科学看见</div>
      </div>

      {/* Instrument hero */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0 16px",
        position: "relative" }}>
        {/* Ambient glow behind instrument */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 220, height: 220, borderRadius: "50%",
          background: "radial-gradient(ellipse, rgba(192,172,222,0.16) 0%, rgba(107,191,160,0.10) 55%, transparent 75%)",
          pointerEvents: "none",
        }} />
        <WelcomeInstrument />
      </div>

      {/* Copy */}
      <div style={{
        padding: "0 32px", marginBottom: 28,
      }}>
        <div style={{
          padding: "18px 20px", borderRadius: 20,
          background: "rgba(255,255,255,0.65)",
          backdropFilter: "blur(20px) saturate(160%)",
          WebkitBackdropFilter: "blur(20px) saturate(160%)",
          border: "1px solid rgba(255,255,255,0.88)",
          boxShadow: "0 4px 20px rgba(160,130,200,0.10)",
        }}>
          <div style={{
            fontSize: 14.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 500,
            color: "#28253D", lineHeight: 1.68, marginBottom: 10,
          }}>
            传统命理记录了性格结构、行动节律和关系模式。
          </div>
          <div style={{
            fontSize: 13.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#4A4168", lineHeight: 1.72,
          }}>
            玄枢把这些结构翻译成你可以直接观察到的行为习惯和日常判断。它不做预测，帮你把自己看得更清楚一点。
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div style={{ padding: "0 28px", display: "flex", flexDirection: "column", gap: 12 }}>
        {/* Primary */}
        <button onClick={onCreateProfile} style={{
          width: "100%", padding: "16px 24px",
          borderRadius: 20,
          background: "linear-gradient(135deg, #F5C4B8, #E8816A)",
          border: "none", cursor: "pointer",
          fontSize: 15, fontFamily: "'Noto Serif SC', serif",
          fontWeight: 600, color: "#FFFFFF",
          boxShadow: "0 6px 22px rgba(232,129,106,0.38)",
          letterSpacing: "0.04em",
        }}>创建我的档案</button>

        {/* Secondary */}
        <button onClick={onViewDemo} style={{
          width: "100%", padding: "15px 24px",
          borderRadius: 20,
          background: "rgba(255,255,255,0.72)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          border: "1.5px solid rgba(180,160,220,0.35)",
          cursor: "pointer",
          fontSize: 14, fontFamily: "'Noto Sans SC', sans-serif",
          color: "#5A5272", fontWeight: 400,
        }}>先看示例</button>
      </div>

      {/* Guest note */}
      <div style={{ textAlign: "center", padding: "18px 32px 36px" }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 16px", borderRadius: 20,
          background: "rgba(238,233,248,0.60)",
          border: "1px solid rgba(192,172,222,0.22)",
        }}>
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#6BBFA0" }} />
          <span style={{
            fontSize: 11.5, fontFamily: "'Noto Sans SC', sans-serif",
            color: "#7B6E94", letterSpacing: "0.04em",
          }}>游客可直接体验 · 无需先登录</span>
        </div>
      </div>
    </div>
  );
}
