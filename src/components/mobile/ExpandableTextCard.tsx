"use client";

import { ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import type { InsightCardData } from "@/lib/mobile/types";

export function ExpandableTextCard({ item, tone = "bazi" }: { item: InsightCardData; tone?: "bazi" | "zodiac" }) {
  const [open, setOpen] = useState(false);
  return (
    <motion.article className={`mobile-reading-card mobile-reading-card--${tone}`} whileTap={{ scale: 0.995 }}>
      <div className="mobile-reading-title">
        <span aria-hidden="true">{item.title.slice(0, 1)}</span>
        <h3>{item.title}</h3>
      </div>
      <strong className="mobile-reading-highlight">{item.highlight}</strong>
      <p className="mobile-term-explain">{item.term}</p>
      <p className="mobile-reading-summary">{item.summary}</p>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            className="mobile-reading-detail"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24 }}
          >
            <p>{item.detail}</p>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <button type="button" className="mobile-expand-button" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        {open ? "收起" : "查看全文"}
        <ChevronDown className={open ? "is-open" : ""} />
      </button>
    </motion.article>
  );
}
