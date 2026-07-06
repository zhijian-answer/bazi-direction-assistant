"use client";

import { Check, Cloud, CloudOff, Plus, UserRound } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { setActiveMobileProfile, useMobileProfile, useMobileProfiles } from "@/lib/mobile/profile";
import { MobileSheet } from "./MobileSheet";

export function ProfileSwitcherSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  const current = useMobileProfile();
  const stored = useMobileProfiles();
  const profiles = useMemo(
    () => stored.some((item) => item.id === current.id) ? stored : [current, ...stored],
    [current, stored],
  );

  function choose(profileId?: string) {
    if (!profileId || profileId === current.id) return onClose();
    if (setActiveMobileProfile(profileId)) onClose();
  }

  return (
    <MobileSheet open={open} title="切换观察档案" onClose={onClose} layerClassName="profile-switcher-layer">
      <div className="profile-switcher-sheet">
        <header>
          <small>当前设备的档案</small>
          <p>切换后，今日观察与三类报告会立即按新档案重新计算。</p>
        </header>
        <div className="profile-switcher-list" aria-label="本地档案列表">
          {profiles.map((profile) => {
            const active = profile.id === current.id;
            return (
              <button key={profile.id || profile.name} type="button" aria-pressed={active} className={active ? "is-active" : ""} onClick={() => choose(profile.id)}>
                <span className="profile-switcher-avatar"><UserRound /></span>
                <span className="profile-switcher-copy">
                  <strong>{profile.name || "未命名档案"}</strong>
                  <small>{profile.birthDate || "日期待补充"} · {profile.birthTimeKnown ? profile.birthTime || "时间待补充" : "时辰不确定"}</small>
                  <em>{profile.syncStatus === "synced" ? <><Cloud />已同步</> : <><CloudOff />仅本机</>}</em>
                </span>
                <span className="profile-switcher-state">{active ? <><Check />当前</> : "切换"}</span>
              </button>
            );
          })}
        </div>
        <Link href="/m/create?mode=new" className="profile-switcher-new" onClick={onClose}><Plus />新建另一份档案</Link>
        <p className="profile-switcher-boundary">本地档案只保存在当前浏览器。需要跨设备使用时，可在“我的”页面登录后同步。</p>
      </div>
    </MobileSheet>
  );
}
