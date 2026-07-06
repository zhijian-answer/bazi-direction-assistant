import type { ReactNode } from "react";

export function InstrumentPanel({
  children,
  className = "",
  eyebrow,
  title,
}: {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: string;
}) {
  return (
    <section className={`xs-instrument-panel ${className}`.trim()}>
      {eyebrow || title ? (
        <header className="xs-instrument-panel__header">
          {eyebrow ? <small>{eyebrow}</small> : null}
          {title ? <h2>{title}</h2> : null}
          <span aria-hidden="true" />
        </header>
      ) : null}
      <div className="xs-instrument-panel__content">{children}</div>
    </section>
  );
}
