import type { EditorialStory } from "./editorialCatalog";

type Tone = "bazi" | "zodiac" | "ziwei";

const tones: Record<Tone, { primary: string; secondary: string; warm: string }> = {
  bazi: { primary: "#6BBFA0", secondary: "#7BBDE0", warm: "#E8816A" },
  zodiac: { primary: "#7BBDE0", secondary: "#C0ACDE", warm: "#E8816A" },
  ziwei: { primary: "#C0A050", secondary: "#7BBDE0", warm: "#E8816A" },
};

function PerspectiveColumn({
  title,
  items,
  accent,
  symbol,
}: {
  title: string;
  items: readonly string[];
  accent: string;
  symbol: string;
}) {
  return (
    <div style={{
      flex: 1,
      minWidth: 0,
      padding: "15px 13px 14px",
      borderRadius: 18,
      background: `${accent}0D`,
      border: `1px solid ${accent}33`,
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 11 }}>
        <span style={{ fontSize: 12, color: accent }}>{symbol}</span>
        <span style={{
          fontSize: 11,
          color: accent,
          fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 600,
        }}>{title}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {items.map((item) => (
          <div key={item} style={{ display: "flex", alignItems: "flex-start", gap: 7 }}>
            <span style={{ color: accent, fontSize: 8, lineHeight: "19px", flexShrink: 0 }}>●</span>
            <span style={{
              fontSize: 12,
              lineHeight: 1.58,
              color: "#433B5D",
              fontFamily: "'Noto Sans SC', sans-serif",
            }}>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function EditorialStorySections({
  story,
  tone,
  showAction = true,
}: {
  story: EditorialStory;
  tone: Tone;
  showAction?: boolean;
}) {
  const palette = tones[tone];
  return (
    <>
      <div style={{ display: "flex", gap: 10 }}>
        <PerspectiveColumn title="别人先看到的" items={story.othersSee} accent={palette.secondary} symbol="◎" />
        <PerspectiveColumn title="你真正需要的" items={story.realNeeds} accent={palette.warm} symbol="✦" />
      </div>

      <div style={{
        padding: "18px 18px 17px",
        borderRadius: 20,
        background: `linear-gradient(140deg, ${palette.primary}16, rgba(255,255,255,0.82))`,
        border: `1px solid ${palette.primary}3D`,
        boxShadow: "0 5px 20px rgba(120,100,160,0.08)",
      }}>
        <div style={{
          fontSize: 10,
          color: palette.primary,
          fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 600,
          marginBottom: 9,
          letterSpacing: "0.06em",
        }}>藏在表面之下的优势</div>
        <div style={{
          fontSize: 15.5,
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700,
          color: "#28253D",
          lineHeight: 1.55,
          marginBottom: 8,
        }}>{story.hiddenTitle}</div>
        <div style={{
          fontSize: 13,
          fontFamily: "'Noto Sans SC', sans-serif",
          color: "#4A4168",
          lineHeight: 1.72,
        }}>{story.hiddenBody}</div>
      </div>

      <div style={{
        padding: "17px 18px",
        borderRadius: 20,
        background: "rgba(255,255,255,0.68)",
        border: "1px solid rgba(192,172,222,0.25)",
      }}>
        <div style={{
          fontSize: 10,
          color: "#9088A8",
          fontFamily: "'Noto Sans SC', sans-serif",
          fontWeight: 600,
          marginBottom: 8,
          letterSpacing: "0.06em",
        }}>容易被误解的地方</div>
        <div style={{
          fontSize: 14.5,
          fontFamily: "'Noto Serif SC', serif",
          fontWeight: 700,
          color: "#28253D",
          lineHeight: 1.55,
          marginBottom: 8,
        }}>{story.misunderstandingTitle}</div>
        <div style={{
          fontSize: 12.8,
          fontFamily: "'Noto Sans SC', sans-serif",
          color: "#5A5272",
          lineHeight: 1.7,
        }}>{story.misunderstandingBody}</div>
      </div>

      {showAction && (
        <div style={{
          padding: "17px 18px",
          borderRadius: 20,
          background: `linear-gradient(135deg, ${palette.warm}1B, rgba(255,255,255,0.88))`,
          border: `1px solid ${palette.warm}3D`,
        }}>
          <div style={{ fontSize: 10, color: palette.warm, fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 600, marginBottom: 8 }}>
            今天可以做的一小步
          </div>
          <div style={{ fontSize: 15, color: "#28253D", fontFamily: "'Noto Serif SC', serif", fontWeight: 700, lineHeight: 1.5, marginBottom: 7 }}>
            {story.actionTitle}
          </div>
          <div style={{ fontSize: 12.8, color: "#4A4168", fontFamily: "'Noto Sans SC', sans-serif", lineHeight: 1.68 }}>
            {story.actionNote}
          </div>
        </div>
      )}
    </>
  );
}
