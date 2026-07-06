import type { ReactNode } from "react";

export function SectionTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <header className="xs-section-title">
      <div>
        {eyebrow ? <small>{eyebrow}</small> : null}
        <h2>{title}</h2>
      </div>
      {action ? <div className="xs-section-title__action">{action}</div> : null}
    </header>
  );
}
