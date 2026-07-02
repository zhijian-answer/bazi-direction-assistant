"use client";

import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function MobileAppFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const theme = pathname.includes("zodiac") ? "zodiac" : pathname.includes("bazi") ? "bazi" : "home";

  return (
    <MotionConfig reducedMotion="user">
      <div className={`mobile-stage mobile-stage--${theme}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.main
            key={pathname}
            className="mobile-device"
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </MotionConfig>
  );
}
