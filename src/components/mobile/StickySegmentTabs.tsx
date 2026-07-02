"use client";

import Link from "next/link";

export type SegmentTab = {
  id: string;
  label: string;
  href?: string;
  disabled?: boolean;
};

export function StickySegmentTabs({
  tabs,
  active,
  onChange,
  label,
}: {
  tabs: SegmentTab[];
  active: string;
  onChange?: (id: string) => void;
  label: string;
}) {
  return (
    <nav className="mobile-segment-tabs" aria-label={label}>
      <div>
        {tabs.map((tab) => {
          const className = tab.id === active ? "is-active" : "";
          if (tab.href && !tab.disabled) {
            return (
              <Link key={tab.id} href={tab.href} className={className} aria-current={tab.id === active ? "page" : undefined}>
                {tab.label}
              </Link>
            );
          }
          return (
            <button key={tab.id} type="button" className={className} onClick={() => onChange?.(tab.id)}>
              {tab.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
