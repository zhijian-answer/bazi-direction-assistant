"use client";

import { motion } from "framer-motion";
import { House, Orbit, Telescope, UserRound } from "lucide-react";
import Link from "next/link";

const navItems = [
  { id: "home", label: "首页", href: "/m", icon: House },
  { id: "report", label: "观测", href: "/m/report", icon: Orbit },
  { id: "tools", label: "工具", href: "/m/tools", icon: Telescope },
  { id: "profile", label: "我的", href: "/m/profile", icon: UserRound },
] as const;

export type MobileNavId = (typeof navItems)[number]["id"] | "bazi" | "zodiac" | "ziwei";

function isSelected(active: MobileNavId | undefined, itemId: (typeof navItems)[number]["id"]) {
  if (itemId === "report" && (active === "bazi" || active === "zodiac" || active === "ziwei")) return true;
  return active === itemId;
}

export function BottomTabBar({ active }: { active?: MobileNavId }) {
  return (
    <nav className="mobile-bottom-nav" aria-label="主要导航">
      {navItems.map((item) => {
        const selected = isSelected(active, item.id);
        const Icon = item.icon;
        return (
          <Link key={item.id} href={item.href} className={selected ? "is-active" : ""} aria-current={selected ? "page" : undefined}>
            <motion.span whileTap={{ scale: 0.9 }}>
              <Icon className="mobile-bottom-nav__icon" aria-hidden="true" />
              <small>{item.label}</small>
            </motion.span>
          </Link>
        );
      })}
    </nav>
  );
}
