"use client";

import { ArrowRight, Eye, FileWarning, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { activateDemoProfile, useMobileProfileState } from "@/lib/mobile/profile";
import { isValidProfileBirthDate } from "@/lib/mobile/profileCapabilities";
import { MobileShell } from "./MobileShell";

export function DemoProfileBanner() {
  return (
    <aside className="demo-profile-banner" aria-label="当前正在查看示例档案">
      <span><Eye />示例档案：小玄 · 结果不进历史</span>
      <Link href="/m/create?mode=new">创建我的档案<ArrowRight /></Link>
    </aside>
  );
}

export function ProfileRouteGuard({ children, requirement = "birth-date" }: { children: ReactNode; requirement?: "profile" | "birth-date" }) {
  const pathname = usePathname();
  const { profile, hasProfile } = useMobileProfileState();
  const needsBirthDate = requirement === "birth-date" && !isValidProfileBirthDate(profile);
  const createHref = `/m/create?mode=${hasProfile ? "edit" : "new"}&returnTo=${encodeURIComponent(pathname)}`;

  if (!hasProfile || needsBirthDate) {
    return (
      <MobileShell withNav={false} theme="home">
        <main className="profile-access-state">
          <span className="profile-access-state__icon"><FileWarning /></span>
          <small>{hasProfile ? "档案尚未完成" : "还没有个人档案"}</small>
          <h1>{hasProfile ? "补充出生日期后，再建立你的个人结构" : "先建立档案，再查看属于你的报告"}</h1>
          <p>{hasProfile ? "当前只保存了基础称呼。我们不会用示例生日或默认时辰替你生成结果。" : "你也可以主动查看示例；示例会持续标明身份，不会再显示成你的个人结果。"}</p>
          <div className="profile-access-state__actions">
            <Link href={createHref}><UserRoundPlus />{hasProfile ? "继续补充资料" : "创建我的档案"}<ArrowRight /></Link>
            {!hasProfile ? <button type="button" onClick={activateDemoProfile}><Eye />查看示例档案</button> : <Link className="is-secondary" href="/m">返回首页</Link>}
          </div>
        </main>
      </MobileShell>
    );
  }

  return <>{profile.isDemo ? <DemoProfileBanner /> : null}{children}</>;
}
