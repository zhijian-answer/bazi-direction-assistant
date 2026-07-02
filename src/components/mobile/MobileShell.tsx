"use client";

import { CalendarRange, Home, Sparkles, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { id: "home", label: "首页", href: "/m", icon: Home },
  { id: "bazi", label: "生辰", href: "/m/report/bazi", icon: CalendarRange },
  { id: "zodiac", label: "星座", href: "/m/report/zodiac", icon: Sparkles },
  { id: "profile", label: "我的", href: "/m/profile", icon: UserRound },
] as const;

export function MobileShell({
  children,
  active,
  theme = "home",
  withNav = true,
}: {
  children: ReactNode;
  active?: (typeof navItems)[number]["id"];
  theme?: "home" | "bazi" | "zodiac";
  withNav?: boolean;
}) {
  return (
    <div className={`mobile-shell mobile-shell--${theme} ${withNav ? "mobile-shell--with-nav" : ""}`}>
      {children}
      {withNav ? (
        <nav className="mobile-bottom-nav" aria-label="主要导航">
          {navItems.map((item) => {
            const Icon = item.icon;
            const selected = active === item.id;
            return (
              <Link key={item.id} href={item.href} className={selected ? "is-active" : ""} aria-current={selected ? "page" : undefined}>
                <motion.span whileTap={{ scale: 0.9 }}>
                  <Icon aria-hidden="true" />
                  <small>{item.label}</small>
                </motion.span>
              </Link>
            );
          })}
        </nav>
      ) : null}
    </div>
  );
}
