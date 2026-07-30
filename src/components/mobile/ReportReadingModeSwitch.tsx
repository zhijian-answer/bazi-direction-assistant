"use client";

import { BookOpenText, ListChecks } from "lucide-react";

export type ReportReadingMode = "quick" | "professional";

export function ReportReadingModeSwitch({
  mode,
  onChange,
  professionalLabel = "专业依据",
}: {
  mode: ReportReadingMode;
  onChange: (mode: ReportReadingMode) => void;
  professionalLabel?: string;
}) {
  return (
    <section className="report-reading-mode" aria-label="选择报告阅读方式">
      <header><small>阅读方式</small><strong>{mode === "quick" ? "先看结论与行动" : "展开术语与盘面依据"}</strong></header>
      <div>
        <button type="button" className={mode === "quick" ? "is-active" : ""} aria-pressed={mode === "quick"} onClick={() => onChange("quick")}>
          <ListChecks /><span><strong>快速看懂</strong><small>结论、场景、行动</small></span>
        </button>
        <button type="button" className={mode === "professional" ? "is-active" : ""} aria-pressed={mode === "professional"} onClick={() => onChange("professional")}>
          <BookOpenText /><span><strong>{professionalLabel}</strong><small>术语、结构、盘面</small></span>
        </button>
      </div>
    </section>
  );
}

export function ReportDepthPrompt({ title, note, onOpen }: { title: string; note: string; onOpen: () => void }) {
  return (
    <section className="report-depth-prompt">
      <BookOpenText />
      <div><small>需要更多依据时</small><strong>{title}</strong><p>{note}</p></div>
      <button type="button" onClick={onOpen}>展开专业内容</button>
    </section>
  );
}
