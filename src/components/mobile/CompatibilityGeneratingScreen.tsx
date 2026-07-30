"use client";

import { AlertCircle, Check, LoaderCircle, Orbit } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { buildCompatibilityReport } from "@/lib/compatibility";
import { loadCompatibilityDraft, saveCompatibilityReport } from "@/lib/compatibility/storage";
import { loadMobileProfiles } from "@/lib/mobile/profile";
import { MobileShell } from "./MobileShell";

const stages = ["正在整理双方资料", "正在建立双方结构关系", "正在识别连接与摩擦", "正在转换成容易理解的建议"];

export function CompatibilityGeneratingScreen() {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [error, setError] = useState("");
  useEffect(() => {
    const draft = loadCompatibilityDraft();
    const profiles = loadMobileProfiles();
    const primary = profiles.find((item) => item.id === draft?.primaryProfileId) ?? draft?.primarySnapshot;
    const partner = profiles.find((item) => item.id === draft?.partnerProfileId) ?? draft?.partnerSnapshot;
    if (!draft || !primary || !partner) {
      const failure = window.setTimeout(() => setError("合盘资料不完整，请返回重新选择双方档案。"), 0);
      return () => window.clearTimeout(failure);
    }
    const intervals = stages.map((_, index) => window.setTimeout(() => setActive(index), index * 380));
    const finish = window.setTimeout(() => {
      try {
        const report = buildCompatibilityReport(draft, primary, partner);
        saveCompatibilityReport(report, { persistHistory: !primary.isDemo && !partner.isDemo });
        router.replace("/m/compatibility/result");
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "生成关系报告时出现问题，请重试。");
      }
    }, 1600);
    return () => { intervals.forEach(window.clearTimeout); window.clearTimeout(finish); };
  }, [router]);
  return <MobileShell withNav={false} theme="home"><main className="compatibility-generating">
    <div className="compatibility-generating__orbit"><Orbit /><span /><i /></div>
    {error ? <section><AlertCircle /><h1>暂时无法生成</h1><p>{error}</p><Link href="/m/compatibility/create">返回检查资料</Link></section> : <section><small>关系结构正在建立</small><h1>把两个人的线索<br />放回同一张图里</h1><div>{stages.map((stage, index) => <p key={stage} className={index === active ? "is-active" : index < active ? "is-done" : ""}>{index < active ? <Check /> : <LoaderCircle />}{stage}</p>)}</div><footer>不会用随机时辰补全未知资料</footer></section>}
  </main></MobileShell>;
}
