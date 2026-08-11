import type { ReactNode } from "react";
import { ProfileAccessGuard } from "@/components/figma-v22/ProfileAccessGuard";

export default function MobileGeneratingLayout({ children }: { children: ReactNode }) {
  return <ProfileAccessGuard>{children}</ProfileAccessGuard>;
}
