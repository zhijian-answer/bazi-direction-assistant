import type { ReactNode } from "react";
import { MobileAppFrame } from "@/components/mobile/MobileAppFrame";

export default function StaticMobileLayout({ children }: { children: ReactNode }) {
  return <MobileAppFrame>{children}</MobileAppFrame>;
}
