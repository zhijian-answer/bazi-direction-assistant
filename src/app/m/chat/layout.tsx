import type { ReactNode } from "react";
import { ProfileAccessGuard } from "@/components/figma-v22/ProfileAccessGuard";

export default function MobileChatLayout({ children }: { children: ReactNode }) {
  return <ProfileAccessGuard>{children}</ProfileAccessGuard>;
}
