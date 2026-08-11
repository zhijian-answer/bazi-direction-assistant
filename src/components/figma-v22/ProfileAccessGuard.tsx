"use client";

import { ArrowRight, Eye, UserRoundPlus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { activateDemoProfile, useMobileProfileState } from "@/lib/mobile/profile";
import { isValidProfileBirthDate } from "@/lib/mobile/profileCapabilities";

export function ProfileAccessGuard({ children, requirement = "birth-date" }: { children: ReactNode; requirement?: "profile" | "birth-date" }) {
  const pathname = usePathname();
  const { profile, hasProfile } = useMobileProfileState();
  const needsBirthDate = requirement === "birth-date" && !isValidProfileBirthDate(profile);
  const createHref = `/m/create?mode=${hasProfile ? "edit" : "new"}&returnTo=${encodeURIComponent(pathname)}`;

  if (!hasProfile || needsBirthDate) {
    return (
      <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: 22, background: "linear-gradient(168deg,#EBF5FF 0%,#F1F8F4 52%,#FDF4F1 100%)", color: "#302C45", fontFamily: "'Noto Sans SC',sans-serif" }}>
        <section style={{ width: "min(100%,390px)", border: "1px solid rgba(255,255,255,.92)", borderRadius: 24, padding: "28px 22px", background: "rgba(255,255,255,.74)", boxShadow: "0 18px 45px rgba(92,78,130,.10)", backdropFilter: "blur(22px)", textAlign: "center" }}>
          <span style={{ width: 54, height: 54, display: "grid", placeItems: "center", margin: "0 auto 16px", borderRadius: 27, background: "linear-gradient(135deg,rgba(232,129,106,.18),rgba(154,123,184,.22))", color: "#9A7BB8" }}><UserRoundPlus size={24} /></span>
          <small style={{ color: "#9A7BB8" }}>{hasProfile ? "档案还差一步" : "先认识一下你"}</small>
          <h1 style={{ margin: "10px 0", fontFamily: "'Noto Serif SC',serif", fontSize: 24, lineHeight: 1.5 }}>{hasProfile ? "补上出生日期，就能继续看。" : "留下出生信息，玄枢才知道该从哪里说起。"}</h1>
          <p style={{ margin: "0 0 22px", color: "#716B81", fontSize: 14, lineHeight: 1.8 }}>{hasProfile ? "时间记不清也没关系，可以直接标记为不确定。玄枢不会替你猜。" : "出生资料只用于建立你的命盘。暂时不想填写，也可以先看一份明确标注的示例。"}</p>
          <Link href={createHref} style={{ minHeight: 48, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 16, background: "linear-gradient(135deg,#E48672,#9A7BB8)", color: "#fff", textDecoration: "none", fontWeight: 600, boxShadow: "0 12px 24px rgba(154,123,184,.20)" }}>{hasProfile ? "继续补充资料" : "创建我的档案"}<ArrowRight size={18} /></Link>
          {!hasProfile && <button type="button" onClick={activateDemoProfile} style={{ minHeight: 46, width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 8, border: 0, background: "transparent", color: "#817A91" }}><Eye size={17} />先看看示例</button>}
        </section>
      </main>
    );
  }

  return <>{profile.isDemo ? <aside style={{ minHeight: 40, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "6px 16px", background: "#FFF8E9", color: "#76623B", fontSize: 12 }}><span>当前正在查看示例档案</span><Link href="/m/create?mode=new" style={{ minHeight: 44, display: "inline-flex", alignItems: "center", color: "#8E7140", textDecoration: "none" }}>换成我的资料<ArrowRight size={14} /></Link></aside> : null}{children}</>;
}
