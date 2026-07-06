import type { ReactNode } from "react";

export function DataPill({ children, tone = "brass" }: { children: ReactNode; tone?: "brass" | "jade" | "blue" | "cinnabar" }) {
  return <span className={`xs-data-pill xs-data-pill--${tone}`}>{children}</span>;
}
