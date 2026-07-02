"use client";

import { ArrowLeft, CalendarDays, ChevronRight, Clock3, MapPin, UserRound } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { saveMobileProfile, useMobileProfile } from "@/lib/mobile/profile";
import type { MobileProfile } from "@/lib/mobile/types";
import { MobileShell } from "./MobileShell";

export function CreateProfileFlow() {
  const router = useRouter();
  const savedProfile = useMobileProfile();
  const [draft, setDraft] = useState<MobileProfile | null>(null);
  const profile = draft ?? savedProfile;
  const [error, setError] = useState("");

  function update<K extends keyof MobileProfile>(key: K, value: MobileProfile[K]) {
    setDraft((current) => ({ ...(current ?? savedProfile), [key]: value }));
    setError("");
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (!profile.name.trim()) return setError("请填写档案名称");
    if (!profile.birthDate) return setError("请选择出生日期");
    if (!profile.birthTime) return setError("请选择出生时间");
    if (!profile.birthPlace.trim()) return setError("请填写出生地点");
    saveMobileProfile(profile);
    router.push("/m/generating?next=bazi");
  }

  return (
    <MobileShell withNav={false} theme="home">
      <header className="create-topbar">
        <button type="button" className="mobile-icon-button" onClick={() => router.back()} aria-label="返回上一页"><ArrowLeft /></button>
        <div><strong>创建出生档案</strong><small>信息仅用于生成你的报告</small></div>
        <span />
      </header>

      <section className="create-intro">
        <small>第一步</small>
        <h1>从准确的出生信息开始</h1>
        <p>如果时间不确定，可以先填写最接近的时刻，之后仍能修改。</p>
      </section>

      <form className="create-form" onSubmit={submit}>
        <fieldset className="create-segment">
          <legend>日历类型</legend>
          <div>
            <button type="button" className={profile.calendarType === "solar" ? "is-active" : ""} onClick={() => update("calendarType", "solar")}>公历</button>
            <button type="button" className={profile.calendarType === "lunar" ? "is-active" : ""} onClick={() => update("calendarType", "lunar")}>农历</button>
          </div>
        </fieldset>

        <label className="create-field">
          <span><UserRound />档案名称</span>
          <input value={profile.name} onChange={(event) => update("name", event.target.value)} placeholder="例如：自己" />
        </label>

        <fieldset className="create-segment">
          <legend>性别</legend>
          <div className="create-segment--three">
            <button type="button" className={profile.gender === "female" ? "is-active" : ""} onClick={() => update("gender", "female")}>女</button>
            <button type="button" className={profile.gender === "male" ? "is-active" : ""} onClick={() => update("gender", "male")}>男</button>
            <button type="button" className={profile.gender === "other" ? "is-active" : ""} onClick={() => update("gender", "other")}>其他</button>
          </div>
        </fieldset>

        <label className="create-field">
          <span><CalendarDays />出生日期</span>
          <input type="date" value={profile.birthDate} onChange={(event) => update("birthDate", event.target.value)} />
        </label>

        <label className="create-field">
          <span><Clock3 />出生时间</span>
          <input type="time" value={profile.birthTime} onChange={(event) => update("birthTime", event.target.value)} />
        </label>

        <label className="create-field">
          <span><MapPin />出生地点</span>
          <input value={profile.birthPlace} onChange={(event) => update("birthPlace", event.target.value)} placeholder="例如：广东省广州市" />
        </label>

        {error ? <p className="create-error" role="alert">{error}</p> : null}

        <motion.button type="submit" className="create-submit" whileTap={{ scale: 0.98 }}>
          生成我的报告
          <ChevronRight />
        </motion.button>
        <p className="create-boundary">报告用于文化娱乐与自我探索，不作为现实决策的唯一依据。</p>
      </form>
    </MobileShell>
  );
}
