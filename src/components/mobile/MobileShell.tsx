import type { ReactNode } from "react";
import { BottomTabBar, type MobileNavId } from "./BottomTabBar";
import { CosmicBackground } from "./CosmicBackground";

export type MobileTheme = "home" | "bazi" | "zodiac" | "ziwei";

export function MobileShell({
  children,
  active,
  theme = "home",
  withNav = true,
}: {
  children: ReactNode;
  active?: MobileNavId;
  theme?: MobileTheme;
  withNav?: boolean;
}) {
  const hasCosmicBackground = true;

  return (
    <div className={`mobile-shell mobile-shell--${theme} ${withNav ? "mobile-shell--with-nav" : ""}`} data-system={theme} data-mobile-app="xuanshu">
      {hasCosmicBackground ? <CosmicBackground variant={theme} /> : null}
      <div className="mobile-shell-content">{children}</div>
      {withNav ? <BottomTabBar active={active} /> : null}
    </div>
  );
}
