"use client";

import { ArrowLeft, ChevronDown, Settings2, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function MobileTopBar({
  title = "自己",
  onShare,
  onSettings,
  showBack = true,
}: {
  title?: string;
  onShare?: () => void;
  onSettings?: () => void;
  showBack?: boolean;
}) {
  const router = useRouter();
  return (
    <header className="mobile-topbar">
      <div>
        {showBack ? (
          <button type="button" className="mobile-icon-button" onClick={() => router.back()} aria-label="返回上一页">
            <ArrowLeft />
          </button>
        ) : (
          <span className="mobile-topbar-spacer" />
        )}
      </div>
      <button type="button" className="mobile-profile-switch" aria-label="切换当前档案">
        {title}
        <ChevronDown />
      </button>
      <div className="mobile-topbar-actions">
        {onShare ? (
          <button type="button" className="mobile-icon-button" onClick={onShare} aria-label="分享报告">
            <Share2 />
          </button>
        ) : null}
        {onSettings ? (
          <button type="button" className="mobile-icon-button" onClick={onSettings} aria-label="报告设置">
            <Settings2 />
          </button>
        ) : null}
      </div>
    </header>
  );
}
