import type { CSSProperties, ReactNode } from "react";
import type { MobileFlowReport } from "@/lib/mobile/buildMobileFlowReport";
import type { Question } from "./QuestionInsightSheet";

function Card({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <section style={{
      borderRadius: 22,
      background: "rgba(255,255,255,0.72)",
      backdropFilter: "blur(22px) saturate(180%)",
      WebkitBackdropFilter: "blur(22px) saturate(180%)",
      border: "1px solid rgba(255,255,255,0.88)",
      boxShadow: "0 5px 24px rgba(160,130,200,0.10)",
      ...style,
    }}>
      {children}
    </section>
  );
}

function ListBlock({ title, items, accent }: { title: string; items: string[]; accent: string }) {
  return (
    <Card style={{ padding: "15px 16px", background: `linear-gradient(140deg, ${accent}0E, rgba(255,255,255,0.82))` }}>
      <div style={{ fontSize: 12.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 600, color: "#28253D", marginBottom: 10 }}>{title}</div>
      {items.map((item) => (
        <div key={item} style={{ display: "flex", gap: 9, alignItems: "flex-start", marginTop: 7 }}>
          <span style={{ width: 5, height: 5, borderRadius: "50%", background: accent, flexShrink: 0, marginTop: 7 }} />
          <span style={{ fontSize: 12.5, fontFamily: "'Noto Sans SC', sans-serif", color: "#3D3758", lineHeight: 1.68 }}>{item}</span>
        </div>
      ))}
    </Card>
  );
}

function toQuestion(flow: MobileFlowReport): Question {
  return {
    id: flow.question.id,
    source: flow.question.source,
    title: flow.question.prompt,
    answer: flow.question.interpretation,
    observations: [flow.question.observation],
    action: flow.question.action,
    boundary: "流盘描述时间结构与本命方式的关系，不保证具体事件，也不替代现实判断。",
  };
}

export default function LiupanContent({
  flow,
  onOpenSheet,
  onSharePoster,
}: {
  flow: MobileFlowReport;
  onOpenSheet: (questions: Question[], index: number) => void;
  onSharePoster?: () => void;
}) {
  const question = toQuestion(flow);
  const suitable = flow.focus.suitable.split("、").filter(Boolean);
  const caution = flow.focus.caution.split("、").filter(Boolean);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <Card style={{ padding: "20px 22px", background: "linear-gradient(145deg, rgba(255,255,255,0.84), rgba(244,240,255,0.80))" }}>
        <div style={{ fontSize: 10.5, color: "#9088A8", fontFamily: "'Noto Sans SC', sans-serif", fontWeight: 500, marginBottom: 11, letterSpacing: "0.07em" }}>
          {flow.dateLabel}
        </div>
        <h2 style={{ margin: "0 0 10px", fontSize: 19, fontFamily: "'Noto Serif SC', serif", color: "#28253D", lineHeight: 1.52 }}>{flow.title}</h2>
        <p style={{ margin: 0, fontSize: 13, fontFamily: "'Noto Sans SC', sans-serif", color: "#4A4168", lineHeight: 1.75 }}>{flow.summary}</p>
      </Card>

      <Card style={{ padding: "16px 14px" }}>
        <div style={{ fontSize: 11, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", marginBottom: 14 }}>从本命到当下</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 7 }}>
          {flow.columns.map((column, index) => {
            const colors = ["#C0ACDE", "#E9C97E", "#7BBDE0", "#E8816A"];
            return (
              <div key={column.label} style={{ textAlign: "center", padding: "11px 4px", borderRadius: 15, background: `${colors[index]}12`, border: `1px solid ${colors[index]}32` }}>
                <small style={{ display: "block", fontSize: 9.5, color: "#9088A8", marginBottom: 7 }}>{column.label}</small>
                <strong style={{ display: "block", fontSize: 15, fontFamily: "'Noto Serif SC', serif", color: colors[index], marginBottom: 5 }}>{column.value}</strong>
                <span style={{ display: "block", fontSize: 9, color: "#A094B8", lineHeight: 1.4 }}>{column.note}</span>
              </div>
            );
          })}
        </div>
      </Card>

      <Card style={{ padding: "18px", background: "linear-gradient(145deg, rgba(123,189,224,0.12), rgba(255,255,255,0.82))" }}>
        <div style={{ fontSize: 10, color: "#5A88B0", fontWeight: 500, marginBottom: 8 }}>{flow.focus.eyebrow}</div>
        <h3 style={{ margin: "0 0 8px", fontSize: 16, fontFamily: "'Noto Serif SC', serif", color: "#28253D" }}>{flow.focus.title}</h3>
        <p style={{ margin: 0, fontSize: 13, color: "#4A4168", lineHeight: 1.72 }}>{flow.focus.note}</p>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <ListBlock title="这段时间适合" items={suitable} accent="#6BBFA0" />
        <ListBlock title="暂时少做" items={caution} accent="#E8816A" />
      </div>

      <Card style={{ padding: "16px 18px" }}>
        <div style={{ fontSize: 11.5, fontFamily: "'Noto Serif SC', serif", fontWeight: 500, color: "#28253D", marginBottom: 11 }}>接下来几个月</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {flow.months.map((month) => (
            <div key={`${month.month}-${month.stem}`} style={{ padding: "10px 12px", borderRadius: 13, background: month.isCurrent ? "rgba(123,189,224,0.12)" : "rgba(238,233,248,0.36)", border: month.isCurrent ? "1px solid rgba(123,189,224,0.34)" : "1px solid rgba(192,172,222,0.16)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <strong style={{ fontSize: 12, color: "#28253D" }}>{month.month} · {month.stem}</strong>
                <span style={{ fontSize: 9.5, color: month.isCurrent ? "#4A86A8" : "#9088A8" }}>{month.isCurrent ? "当前" : month.theme}</span>
              </div>
              <p style={{ margin: 0, fontSize: 11.5, color: "#6B607E", lineHeight: 1.62 }}>{month.note}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card style={{ padding: "16px 18px", background: "linear-gradient(140deg, rgba(233,201,126,0.12), rgba(255,255,255,0.80))" }}>
        <div style={{ fontSize: 10, color: "#C0A050", fontWeight: 500, marginBottom: 8 }}>今天可以怎么做</div>
        <p style={{ margin: 0, fontSize: 13, color: "#3D3758", lineHeight: 1.75 }}>{flow.question.action}</p>
      </Card>

      <button onClick={() => onOpenSheet([question], 0)} style={{ width: "100%", padding: "14px 16px", borderRadius: 17, border: "1px solid rgba(192,172,222,0.30)", background: "rgba(255,255,255,0.68)", color: "#4A4168", fontSize: 13, cursor: "pointer" }}>
        {question.title} →
      </button>

      {flow.evidence.warnings.length > 0 && (
        <div style={{ padding: "12px 14px", borderRadius: 14, background: "rgba(233,201,126,0.10)", border: "1px solid rgba(233,201,126,0.25)", fontSize: 11, color: "#8C7860", lineHeight: 1.65 }}>
          出生时间如果接近时辰交界，这份内容更适合用来观察近期节奏，不适合判断某件事一定会不会发生。
        </div>
      )}

      <div style={{ fontSize: 10.5, color: "#A094B8", lineHeight: 1.65, textAlign: "center" }}>
        参考：本命 {flow.evidence.dayPillar} · 流年 {flow.evidence.annual} · 流月 {flow.evidence.monthly}
      </div>

      {onSharePoster && (
        <button onClick={onSharePoster} style={{ width: "100%", padding: "14px 20px", borderRadius: 18, background: "linear-gradient(135deg, rgba(245,196,184,0.30), rgba(255,255,255,0.85))", border: "1.5px solid rgba(232,129,106,0.32)", cursor: "pointer", fontSize: 13.5, fontFamily: "'Noto Serif SC', serif", color: "#28253D" }}>
          保存这段时间的提醒
        </button>
      )}
    </div>
  );
}
