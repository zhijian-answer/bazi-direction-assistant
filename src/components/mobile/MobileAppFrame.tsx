"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function MobileAppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = pathname.includes("ziwei") ? "ziwei" : pathname.includes("zodiac") ? "zodiac" : pathname.includes("bazi") ? "bazi" : "home";

  return (
    <MotionConfig reducedMotion="user">
      <div className={`mobile-stage mobile-stage--${theme}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            className="mobile-device"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
