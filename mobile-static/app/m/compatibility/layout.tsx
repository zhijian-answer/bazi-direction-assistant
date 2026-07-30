import type { ReactNode } from "react";
import { ProfileRouteGuard } from "@/components/mobile/ProfileRouteGuard";

export default function MobileCompatibilityLayout({ children }: { children: ReactNode }) {
  return <ProfileRouteGuard>{children}</ProfileRouteGuard>;
}

